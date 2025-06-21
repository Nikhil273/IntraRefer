const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    required: true
  },
  jobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application Content
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: {
    type: String, // Cloudinary URL
    default: ''
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // Referrer Feedback
  referrerNotes: {
    type: String,
    maxlength: [1000, 'Referrer notes cannot exceed 1000 characters']
  },
  reviewedAt: {
    type: Date
  },
  
  // Additional Information
  expectedSalary: {
    type: Number,
    min: [0, 'Expected salary cannot be negative']
  },
  availableFrom: {
    type: Date
  },
  noticePeriod: {
    type: Number, // in days
    min: [0, 'Notice period cannot be negative'],
    max: [365, 'Notice period cannot exceed 365 days']
  },
  
  // Application Metadata
  source: {
    type: String,
    enum: ['direct', 'search', 'recommendation'],
    default: 'direct'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Communication
  lastContactedAt: {
    type: Date
  },
  communicationHistory: [{
    message: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['jobSeeker', 'referrer'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ referral: 1, jobSeeker: 1 }, { unique: true });

// Other indexes for performance
applicationSchema.index({ jobSeeker: 1, status: 1 });
applicationSchema.index({ referrer: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for application age in days
applicationSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Method to update status with timestamp
applicationSchema.methods.updateStatus = function(newStatus, referrerNotes = '') {
  this.status = newStatus;
  this.reviewedAt = new Date();
  if (referrerNotes) {
    this.referrerNotes = referrerNotes;
  }
  return this.save();
};

// Method to add communication
applicationSchema.methods.addCommunication = function(message, sender) {
  this.communicationHistory.push({
    message,
    sender,
    timestamp: new Date()
  });
  this.lastContactedAt = new Date();
  return this.save();
};

// Method to check if application can be withdrawn
applicationSchema.methods.canBeWithdrawn = function() {
  return ['pending', 'reviewed'].includes(this.status);
};

// Method to check if application can be updated by job seeker
applicationSchema.methods.canBeUpdatedByJobSeeker = function() {
  return this.status === 'pending';
};

// Static method to get applications by status
applicationSchema.statics.findByStatus = function(status, userId, userRole) {
  const query = { status };
  
  if (userRole === 'jobSeeker') {
    query.jobSeeker = userId;
  } else if (userRole === 'referrer') {
    query.referrer = userId;
  }
  
  return this.find(query)
    .populate('referral', 'title company location jobType')
    .populate('jobSeeker', 'name email skills experience')
    .populate('referrer', 'name company position')
    .sort({ createdAt: -1 });
};

// Static method to get application statistics
applicationSchema.statics.getStatistics = function(userId, userRole) {
  const matchStage = userRole === 'jobSeeker' 
    ? { jobSeeker: mongoose.Types.ObjectId(userId) }
    : { referrer: mongoose.Types.ObjectId(userId) };
    
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware to update referral application count
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Referral = mongoose.model('Referral');
      await Referral.findByIdAndUpdate(
        this.referral,
        { $inc: { applicationCount: 1 } }
      );
    } catch (error) {
      console.error('Error updating referral application count:', error);
    }
  }
  next();
});

// Pre-save middleware to update user's weekly application count
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.jobSeeker);
      
      if (user && !user.isSubscriptionActive()) {
        user.resetWeeklyApplicationsIfNeeded();
        user.weeklyApplications.count += 1;
        await user.save();
      }
    } catch (error) {
      console.error('Error updating user application count:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);