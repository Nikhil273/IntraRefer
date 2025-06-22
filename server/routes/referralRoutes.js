// /server/routes/referralRoutes.js

const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
  createReferral,
  createReferralValidation,
  getReferrals
} = require('../controllers/referralController');

// @route   POST /api/referrals
// @desc    Create a new job referral
// @access  Private (Referrer and Admin)
router.post('/', authenticateToken, authorizeRole(['referrer', 'admin']), createReferralValidation, createReferral
);


// @route   GET /api/referrals
// @desc    Get all job referrals (filtered, searched, paginated, role-based)
// @access  Public for active referrals, Private for specific user's referrals/all referrals
router.get(
  '/',
  authenticateToken,
  getReferrals
);

module.exports = router;