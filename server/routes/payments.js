const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { authenticateToken, isJobSeeker } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Subscription plans
const SUBSCRIPTION_PLANS = {
  monthly: {
    amount: 9900, // ₹99 in paise
    currency: 'INR',
    duration: 30, // days
    name: 'Monthly Premium'
  },
  yearly: {
    amount: 99000, // ₹990 in paise (10 months price for 12 months)
    currency: 'INR',
    duration: 365, // days
    name: 'Yearly Premium'
  }
};

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order for subscription
// @access  Private (Job Seekers only)
router.post('/create-order', [
  authenticateToken,
  isJobSeeker,
  body('subscriptionType')
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid subscription type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment service not configured. Please contact support.' 
      });
    }

    const { subscriptionType } = req.body;
    const plan = SUBSCRIPTION_PLANS[subscriptionType];

    if (!plan) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    // Check if user already has active subscription
    if (req.user.isSubscriptionActive()) {
      return res.status(400).json({ 
        message: 'You already have an active subscription',
        subscriptionEnd: req.user.subscriptionEnd
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: `receipt_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        subscriptionType,
        userEmail: req.user.email
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save payment record
    const payment = new Payment({
      user: req.user._id,
      razorpayOrderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
      subscriptionType,
      status: 'created',
      description: `${plan.name} Subscription`,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    await payment.save();

    res.json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      plan: {
        name: plan.name,
        duration: plan.duration,
        features: [
          'Unlimited job applications',
          'Verified badge on profile',
          'AI-based referral matching',
          'Resume analyzer',
          'Higher visibility to referrers',
          'Priority customer support'
        ]
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', [
  authenticateToken,
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ 
      razorpayOrderId: razorpay_order_id,
      user: req.user._id 
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ message: 'Payment already verified' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await payment.markAsFailed('Invalid signature');
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Mark payment as successful and update user subscription
    await payment.markAsSuccessful(razorpay_payment_id, razorpay_signature);

    // Get updated user data
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      message: 'Payment verified successfully',
      subscription: {
        isActive: true,
        type: payment.subscriptionType,
        startDate: payment.subscriptionStart,
        endDate: payment.subscriptionEnd
      },
      user: updatedUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay webhooks
// @access  Public (but verified)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.get('X-Razorpay-Signature');
    const body = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(body);
    
    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

// Handle payment captured webhook
const handlePaymentCaptured = async (paymentData) => {
  try {
    const payment = await Payment.findOne({ 
      razorpayOrderId: paymentData.order_id 
    });

    if (payment && payment.status !== 'paid') {
      await payment.markAsSuccessful(paymentData.id, null);
      payment.webhookReceived = true;
      payment.webhookData = paymentData;
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling payment captured webhook:', error);
  }
};

// Handle payment failed webhook
const handlePaymentFailed = async (paymentData) => {
  try {
    const payment = await Payment.findOne({ 
      razorpayOrderId: paymentData.order_id 
    });

    if (payment && payment.status !== 'failed') {
      await payment.markAsFailed(paymentData.error_description || 'Payment failed');
      payment.webhookReceived = true;
      payment.webhookData = paymentData;
      await payment.save();
    }
  } catch (error) {
    console.error('Error handling payment failed webhook:', error);
  }
};

// @route   GET /api/payments/subscription-status
// @desc    Get current subscription status
// @access  Private
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const isActive = user.isSubscriptionActive();

    let currentPayment = null;
    if (user.subscriptionId) {
      currentPayment = await Payment.findById(user.subscriptionId);
    }

    res.json({
      isSubscribed: user.isSubscribed,
      isActive,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      subscriptionType: currentPayment?.subscriptionType,
      daysRemaining: isActive ? Math.ceil((new Date(user.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Error fetching subscription status' });
  }
});

// @route   GET /api/payments/history
// @desc    Get payment history for user
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .select('-razorpaySignature -webhookData')
      .sort({ createdAt: -1 });

    res.json({ payments });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Error fetching payment history' });
  }
});

// @route   GET /api/payments/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', (req, res) => {
  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
    id: key,
    name: plan.name,
    amount: plan.amount,
    currency: plan.currency,
    duration: plan.duration,
    features: [
      'Unlimited job applications',
      'Verified badge on profile',
      'AI-based referral matching',
      'Resume analyzer',
      'Higher visibility to referrers',
      'Priority customer support'
    ],
    savings: key === 'yearly' ? '17% savings compared to monthly' : null
  }));

  res.json({ plans });
});

module.exports = router;