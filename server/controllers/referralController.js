// /server/controllers/referralController.js

const Referral = require('../models/Referral');
const User = require('../models/User'); // Needed to check user role
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// --- Validation Rules for POST /api/referrals (UPDATED - Making more fields REQUIRED) ---
const createReferralValidation = [
  body('title')
    .notEmpty().withMessage('Job title is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('company')
    .notEmpty().withMessage('Company name is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),

  body('department')
    .optional() // Still optional as it's not explicitly requested to be required
    .trim()
    .isLength({ max: 50 }).withMessage('Department cannot exceed 50 characters'),

  body('location')
    .notEmpty().withMessage('Location is required')
    .trim(),

  body('jobType')
    .notEmpty().withMessage('Job type is required')
    .isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Invalid job type'),

  body('experienceLevel')
    .notEmpty().withMessage('Experience level is required')
    .isIn(['entry', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),

  body('description')
    .notEmpty().withMessage('Job description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  // --- MADE REQUIRED ---
  body('requirements')
    .notEmpty().withMessage('Requirements are required') // Now required
    .isArray().withMessage('Requirements must be an array of strings')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) { // Check for empty array
        throw new Error('Requirements array cannot be empty.');
      }
      if (value.some(req => typeof req !== 'string' || req.trim().length === 0 || req.length > 200)) {
        throw new Error('Each requirement must be a non-empty string up to 200 characters.');
      }
      return true;
    }),

  // --- MADE REQUIRED ---
  body('skills')
    .notEmpty().withMessage('Skills are required') // Now required
    .isArray().withMessage('Skills must be an array of strings')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) { // Check for empty array
        throw new Error('Skills array cannot be empty.');
      }
      if (value.some(skill => typeof skill !== 'string' || skill.trim().length === 0 || skill.length > 50)) {
        throw new Error('Each skill must be a non-empty string up to 50 characters.');
      }
      return true;
    }),

  body('benefits')
    .optional() // Still optional
    .isArray().withMessage('Benefits must be an array of strings')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      if (value.some(benefit => typeof benefit !== 'string' || benefit.trim().length === 0 || benefit.length > 200)) {
        throw new Error('Each benefit must be a non-empty string up to 200 characters.');
      }
      return true;
    }),

  // --- MADE REQUIRED (Salary Range Object) ---
  body('salaryRange')
    .notEmpty().withMessage('Salary range is required')
    .isObject().withMessage('Salary range must be an object'),

  body('salaryRange.min')
    .notEmpty().withMessage('Minimum salary is required') // Now required
    .isNumeric().withMessage('Minimum salary must be a number')
    .toFloat()
    .isFloat({ min: 0 }).withMessage('Minimum salary cannot be negative'),

  body('salaryRange.max')
    .notEmpty().withMessage('Maximum salary is required') // Now required
    .isNumeric().withMessage('Maximum salary must be a number')
    .toFloat()
    .isFloat({ min: 0 }).withMessage('Maximum salary cannot be negative')
    .custom((max, { req }) => {
      if (req.body.salaryRange && req.body.salaryRange.min !== undefined && max < req.body.salaryRange.min) {
        throw new Error('Maximum salary cannot be less than minimum salary');
      }
      return true;
    }),

  body('salaryRange.currency')
    .notEmpty().withMessage('Currency for salary is required') // Now required
    .isString().withMessage('Currency must be a string')
    .trim(),

  // --- MADE REQUIRED ---
  body('applicationDeadline')
    .notEmpty().withMessage('Application deadline is required') // Now required
    .isISO8601().withMessage('Application deadline must be a valid date (YYYY-MM-DD)')
    .toDate()
    .custom((value) => {
      // Compare against current date in Ghaziabad, India
      const now = new Date();
      // Optional: Adjust 'now' to a specific timezone if critical,
      // but usually comparing UTC dates is sufficient for "future" checks.
      // For now, comparing directly to new Date() which is local time on server.
      if (value <= now) { // Changed to <= to include today's date validation error
        throw new Error('Application deadline must be in the future.');
      }
      return true;
    }),

  // --- MADE REQUIRED ---
  body('workMode')
    .notEmpty().withMessage('Work mode is required') // Now required
    .isIn(['remote', 'onsite', 'hybrid']).withMessage('Invalid work mode.'),

  body('status') // Status should probably remain optional, with default 'draft'
    .optional()
    .isIn(['draft', 'active', 'closed']).withMessage('Invalid status. Only draft, active, or closed are allowed.'),

  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid urgency level.')
];



// @route   POST /api/referrals
// @access  Private (Referrer only)
// @desc    Create a new job referral
const createReferral = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error('Validation failed: ' + JSON.stringify(errors.array()));
  }

  const { user } = req; // User object from authenticateToken middleware

  // Ensure only 'referrer' or 'admin' can create referrals
  if (user.role !== 'referrer' && user.role !== 'admin') {
    res.status(403);
    throw new Error('Only referrers or administrators can post referrals.');
  }

  // You can optionally fetch the referrer user again to confirm their status, etc.
  const referrerUser = await User.findById(user._id);
  if (!referrerUser || !referrerUser.isActive) {
    res.status(401);
    throw new Error('Referrer account is not active.');
  }

  // Prepare referral data from request body
  const referralData = {
    ...req.body,
    referrer: user._id, // Assign the authenticated user as the referrer
    status: req.body.status || 'active'
  };

  // Ensure optional array fields are handled correctly if not provided in body
  if (!referralData.benefits) referralData.benefits = [];


  // Create new referral
  const referral = new Referral(referralData);

  // Save referral to database
  await referral.save();

  res.status(201).json({
    message: 'Referral posted successfully!',
    referral: referral // You might want to omit some fields or populate referrer here
  });
});


// @desc    Get all job referrals (with filtering, search, pagination, role-based)
// @route   GET /api/referrals
// @access  Public for active referrals, Private for specific user's referrals/all referrals

const getReferrals = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt', // Default sort by creation date
    order = 'desc',      // Default order descending
    search,              // Text search query
    location,
    jobType,
    experienceLevel,
    skills,              // Comma-separated skills
    company,
    workMode,
    status,              // Referrers/Admins can filter by status
    myReferrals          // Flag for referrer/admin to see their own referrals or all
  } = req.query;

  const query = {};
  const sort = {};

  // --- Base Query: Active Referrals for Job Seekers & Public Access ---
  // By default, only active and non-expired referrals are shown.
  // If user is authenticated and specifically requesting 'myReferrals' or is an admin,
  // this default can be overridden.
  if (!req.user || (req.user && req.query.myReferrals !== 'true' && req.user.role === 'jobSeeker')) {
    query.status = 'active';
    query.isActive = true;
    // Ensure deadline is in future or not set
    query.$or = [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gt: new Date() } }
    ];
  }

  // --- Role-based Filtering ---
  if (req.user) { // If user is authenticated
    if (req.user.role === 'referrer' && myReferrals === 'true') {
      query.referrer = req.user._id; // Only show referrer's own referrals
      // If a referrer requests their own, they might want to see all statuses
      delete query.status; // Remove default 'active' status
      if (status) { // Allow referrer to filter their own by specific status
        query.status = status;
      }
    } else if (req.user.role === 'admin') {
      // Admins can see all referrals by default, unless filtered
      delete query.status; // Remove default 'active' status
      delete query.isActive; // Remove default 'isActive'
      delete query.$or; // Remove deadline check for admin
      if (status) { // Allow admin to filter by specific status
        query.status = status;
      }
      if (company) { // Allow admin to filter by company (or referrer by their own company)
        query.company = new RegExp(company, 'i');
      }
    }
  }


  // --- Filtering by Query Parameters ---
  if (location) {
    query.location = new RegExp(location, 'i'); // Case-insensitive search
  }
  if (jobType) {
    query.jobType = jobType;
  }
  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }
  if (workMode) {
    query.workMode = workMode;
  }
  if (company && (!req.user || req.user.role !== 'referrer')) { // Referrer handles their own company filter above
    query.company = new RegExp(company, 'i');
  }
  if (skills) {
    // Assuming skills come as comma-separated: e.g., "React,Node.js"
    const skillsArray = skills.split(',').map(s => new RegExp(s.trim(), 'i'));
    query.skills = { $in: skillsArray };
  }

  // --- Text Search ---
  if (search) {
    query.$text = { $search: search };
  }

  // --- Sorting ---
  sort[sortBy] = order === 'desc' ? -1 : 1;

  // --- Pagination ---
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    const referrals = await Referral.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('referrer', 'name email company position'); // Populate referrer info

    const totalCount = await Referral.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      count: referrals.length,
      page: pageNum,
      pages: totalPages,
      total: totalCount,
      data: referrals.map(ref => {
        // Ensure isExpired status is up-to-date
        if (ref.isExpired() && ref.status === 'active') {
          // Update status in DB if needed (optional, can be done via cron job too)
          // ref.status = 'expired';
          // ref.save();
          // Or just reflect it in the response
          ref.status = 'expired'; // Reflect in response without saving immediately
        }
        return ref;
      })
    });

  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500);
    throw new Error('Could not retrieve referrals.');
  }
});


module.exports = {
  createReferral,
  createReferralValidation,
  getReferrals
};