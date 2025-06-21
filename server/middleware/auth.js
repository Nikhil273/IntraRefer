const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Check user role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Check if user is job seeker
const isJobSeeker = authorizeRole('jobSeeker');

// Check if user is referrer
const isReferrer = authorizeRole('referrer');

// Check if user is admin
const isAdmin = authorizeRole('admin');

// Check if user is referrer or admin
const isReferrerOrAdmin = authorizeRole('referrer', 'admin');

// Check if user is job seeker or admin
const isJobSeekerOrAdmin = authorizeRole('jobSeeker', 'admin');

// Check subscription status for premium features
const checkSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin always has access
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user has active subscription
  if (!req.user.isSubscriptionActive()) {
    return res.status(403).json({
      message: 'Premium subscription required for this feature',
      subscriptionRequired: true
    });
  }

  next();
};

// Check application limit for free users
const checkApplicationLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin and referrers don't have application limits
    if (req.user.role !== 'jobSeeker') {
      return next();
    }

    // Subscribed users have unlimited applications
    if (req.user.isSubscriptionActive()) {
      return next();
    }

    // Check if free user can apply
    if (!req.user.canApply()) {
      return res.status(403).json({
        message: 'Weekly application limit reached (3 applications per week for free users)',
        limitReached: true,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    console.error('Application limit check error:', error);
    res.status(500).json({ message: 'Error checking application limit' });
  }
};

// Optional authentication (for public routes that benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  isJobSeeker,
  isReferrer,
  isAdmin,
  isReferrerOrAdmin,
  isJobSeekerOrAdmin,
  checkSubscription,
  checkApplicationLimit,
  optionalAuth
};