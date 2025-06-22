const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  registerUser,
  registerValidation,
  loginUser,
  loginValidation,
  getMe,
  refreshToken,
  logoutUser,
  changePassword,
  changePasswordValidation,
  deactivateAccount
} = require('../controllers/auth.controller');

// Public Routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);

// Private Routes (require authentication)
router.get('/me', authenticateToken, getMe);
router.post('/refresh', authenticateToken, refreshToken);
router.post('/logout', authenticateToken, logoutUser);
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);
router.post('/deactivate', authenticateToken, deactivateAccount);

module.exports = router;