// /server/routes/userRoutes.js

const express = require('express');
const router = express.Router();

// Import authentication middleware
const { authenticateToken } = require('../middleware/auth');
const uploadSingleImage = require('../middleware/uploadMiddleware');

// Import user controller functions and validation rules
const {
  updateUserProfile,
  updateUserProfileValidation,
  getUserProfile,
  uploadAvatar,
  uploadResume
} = require('../controllers/userController');

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authenticateToken, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', authenticateToken, updateUserProfileValidation, updateUserProfile);

// @route   POST /api/users/profile/avatar
// @desc    Upload user avatar
// @access  Private
// multer middleware should come BEFORE the controller for file processing
router.post('/profile/avatar', authenticateToken, uploadSingleImage, uploadAvatar);

// @route   POST /api/users/profile/resume
// @desc    Upload user resume
// @access  Private
router.post('/profile/resume', authenticateToken, uploadPdf, uploadResume); // Use uploadPdf


module.exports = router;