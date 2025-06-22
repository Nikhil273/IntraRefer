// /server/routes/userRoutes.js

const express = require('express');
const router = express.Router();

// Import authentication middleware
const { authenticateToken } = require('../middleware/auth');
const { uploadImage, uploadPdf } = require('../middleware/uploadMiddleware'); // <-- FIX THIS LINE

// Import user controller functions and validation rules
const {
  updateUserProfile,
  updateUserProfileValidation,
  getUserProfile,
  uploadAvatar,
  uploadResume
} = require('../controllers/userController');

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authenticateToken, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', authenticateToken, updateUserProfileValidation, updateUserProfile);

// @route   POST /api/users/profile/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/profile/avatar', authenticateToken, uploadImage, uploadAvatar);

// @route   POST /api/users/profile/resume
// @desc    Upload user resume
// @access  Private
router.post('/profile/resume', authenticateToken, uploadPdf, uploadResume);


module.exports = router;