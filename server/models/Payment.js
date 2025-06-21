const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Razorpay Details
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },

  // Payment Information
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'created'
  },

  // Subscription Details
  subscriptionType: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  subscriptionStart: {
    type: Date
  },
  subscriptionEnd: {
    type: Date
  },

  // Payment Metadata
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'wallet', 'upi'],
    default: 'card'
  },
  description: {
    type: String,
    default: 'IntraRefer Premium Subscription'
  },

  // Failure Information
  failureReason: {
    type: String
  },

  // Refund Information
  refundId: {
    type: String
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },

  // Additional Metadata
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  },

  // Webhook Information
  webhookReceived: {
    type: Boolean,
    default: false
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ subscriptionStart: 1, subscriptionEnd: 1 });

// Virtual for subscription duration in days
paymentSchema.virtual('subscriptionDuration').get(function () {
  if (!this.subscriptionStart || !this.subscriptionEnd) return 0;

  const start = new Date(this.subscriptionStart);
  const end = new Date(this.subscriptionEnd);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to mark payment as successful
paymentSchema.methods.markAsSuccessful = async function (paymentId, signature) {
  this.razorpayPaymentId = paymentId;
  this.razorpaySignature = signature;
  this.status = 'paid';

  // Set subscription dates
  this.subscriptionStart = new Date();
  if (this.subscriptionType === 'monthly') {
    this.subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  } else if (this.subscriptionType === 'yearly') {
    this.subscriptionEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days
  }

  await this.save();

  // Update user subscription status
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    isSubscribed: true,
    subscriptionStart: this.subscriptionStart,
    subscriptionEnd: this.subscriptionEnd,
    subscriptionId: this._id
  });

  return this;
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function (reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = async function (refundAmount, reason) {
  this.status = 'refunded';
  this.refundAmount = refundAmount || this.amount;
  this.refundReason = reason;
  this.refundedAt = new Date();

  await this.save();

  // Update user subscription status if fully refunded
  if (this.refundAmount >= this.amount) {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.user, {
      isSubscribed: false,
      subscriptionStart: null,
      subscriptionEnd: null,
      subscriptionId: null
    });
  }

  return this;
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = function (startDate, endDate) {
  const matchStage = {};

  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

// Static method to get revenue statistics
paymentSchema.statics.getRevenueStats = function () {
  return this.aggregate([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalRevenue: { $sum: '$amount' },
        totalPayments: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ]);
};

// Static method to find active subscriptions
paymentSchema.statics.findActiveSubscriptions = function () {
  const now = new Date();
  return this.find({
    status: 'paid',
    subscriptionEnd: { $gt: now }
  }).populate('user', 'name email');
};

module.exports = mongoose.model('Payment', paymentSchema);