// /server/models/User.js (Revised - Removed weeklyReferrals, canPostReferral)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['jobSeeker', 'referrer', 'admin'],
    default: 'jobSeeker'
  },
  // Profile Information
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  avatar: {
    type: String, // Cloudinary URL
    default: ''
  },

  // Job Seeker Specific Fields
  skills: [{
    type: String,
    trim: true,
    required: false
  }],
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  resume: {
    type: String, // Cloudinary URL
    required: false,
  },
  desiredRoles: [{
    type: String,
    trim: true,
    required: false
  }],

  // Referrer Specific Fields
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  yearsAtCompany: {
    type: Number,
    min: [0, 'Years at company cannot be negative']
  },

  // Subscription Information
  isSubscribed: {
    type: Boolean,
    default: false
  },
  subscriptionStart: {
    type: Date
  },
  subscriptionEnd: {
    type: Date
  },
  subscriptionId: {
    type: String
  },

  // Application Tracking (for free job seeker users) - Existing and Kept
  weeklyApplications: {
    count: {
      type: Number,
      default: 0
    },
    weekStart: {
      type: Date,
      default: Date.now
    }
  },

  // Profile Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Social Links
  linkedin: {
    type: String,
    match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please enter a valid LinkedIn URL']
  },
  github: {
    type: String,
    match: [/^https?:\/\/(www\.)?github\.com\/.*$/, 'Please enter a valid GitHub URL']
  },
  portfolio: {
    type: String,
    match: [/^https?:\/\/.*$/, 'Please enter a valid URL']
  }
}, {
  timestamps: true
});

// Index for better query performance
// userSchema.index({
//   email: 1
// });
userSchema.index({
  role: 1
});
userSchema.index({
  isSubscribed: 1
});
userSchema.index({
  skills: 1
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if subscription is active
userSchema.methods.isSubscriptionActive = function () {
  if (!this.isSubscribed || !this.subscriptionEnd) return false;
  return new Date() < this.subscriptionEnd;
};

// Helper to get the start of the current week (Monday)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 for Sunday, 1 for Monday...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Go back to Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Set time to beginning of the day
  return d;
};

// Reset weekly count if new week, for generic weekly limits
userSchema.methods.resetWeeklyCountIfNeeded = function (weeklyTrackingField) {
  const now = new Date();
  const weekStart = new Date(this[weeklyTrackingField].weekStart);
  const nowStartOfWeek = getStartOfWeek(now);
  const weekStartStartOfWeek = getStartOfWeek(weekStart);

  if (nowStartOfWeek.getTime() !== weekStartStartOfWeek.getTime()) {
    this[weeklyTrackingField].count = 0;
    this[weeklyTrackingField].weekStart = now; // Reset to current time
    return true; // Indicates a reset occurred
  }
  return false; // No reset
};


// Check if user can apply (for free users)
userSchema.methods.canApply = function () {
  if (this.isSubscriptionActive()) return true;

  this.resetWeeklyCountIfNeeded('weeklyApplications'); // Use the generic reset
  const WEEKLY_APPLICATION_LIMIT = 3; // Define the limit here or as a constant elsewhere
  return this.weeklyApplications.count < WEEKLY_APPLICATION_LIMIT;
};

// Get user profile data (excluding sensitive info)
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.subscriptionId;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);