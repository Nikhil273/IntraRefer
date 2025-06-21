const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: [true, 'Job type is required']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: [true, 'Experience level is required']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each requirement cannot exceed 200 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot exceed 50 characters']
  }],
  benefits: [{
    type: String,
    trim: true,
    maxlength: [200, 'Each benefit cannot exceed 200 characters']
  }],
  salaryRange: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  
  // Referrer Information
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'expired'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  
  // Premium Features
  isPriority: {
    type: Boolean,
    default: false
  },
  
  // Additional Information
  workMode: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    default: 'onsite'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
referralSchema.index({ referrer: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ skills: 1 });
referralSchema.index({ company: 1 });
referralSchema.index({ location: 1 });
referralSchema.index({ jobType: 1 });
referralSchema.index({ experienceLevel: 1 });
referralSchema.index({ createdAt: -1 });

// Text index for search functionality
referralSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  skills: 'text'
});

// Virtual for calculating days until deadline
referralSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.applicationDeadline) return null;
  
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Method to check if referral is expired
referralSchema.methods.isExpired = function() {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
};

// Method to increment view count
referralSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment application count
referralSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

// Method to calculate match score with job seeker
referralSchema.methods.calculateMatchScore = function(jobSeekerSkills) {
  if (!jobSeekerSkills || !this.skills || this.skills.length === 0) return 0;
  
  const referralSkills = this.skills.map(skill => skill.toLowerCase());
  const seekerSkills = jobSeekerSkills.map(skill => skill.toLowerCase());
  
  const matchingSkills = referralSkills.filter(skill => 
    seekerSkills.some(seekerSkill => 
      seekerSkill.includes(skill) || skill.includes(seekerSkill)
    )
  );
  
  return Math.round((matchingSkills.length / referralSkills.length) * 100);
};

// Pre-save middleware to update status based on deadline
referralSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Static method to find active referrals
referralSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active', 
    isActive: true,
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gt: new Date() } }
    ]
  });
};

// Static method to find referrals by skills
referralSchema.statics.findBySkills = function(skills) {
  return this.find({
    status: 'active',
    isActive: true,
    skills: { $in: skills.map(skill => new RegExp(skill, 'i')) }
  });
};

module.exports = mongoose.model('Referral', referralSchema);