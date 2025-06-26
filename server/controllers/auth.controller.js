// /server/controllers/authController.js

const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // Ensure correct path to your User model
const asyncHandler = require("express-async-handler"); // For simplifying error handling in async functions

// --- Helper Functions ---

// Generate JWT token
const generateToken = (userId) => {
  // expiresIn '7d' matches your current implementation
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// --- Validation Rules ---

const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["jobSeeker", "referrer"]) // Admin role typically not allowed for direct registration
    .withMessage("Role must be either jobSeeker or referrer"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// --- Controller Functions ---

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    // Create a custom error property to pass validation errors
    const error = new Error("Validation failed");
    error.errors = errors.array(); // Attach the array of validation errors directly
    throw error;
  }

  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    role,
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      name: user.name, // Use user.name from the saved user object
      role: user.role, // Use user.role from the saved user object
      email: user.email, // Use user.email from the saved user object
      // Add ID if your frontend expects it
      id: user._id,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const error = new Error("Validation failed");
    error.errors = errors.array();
    throw error;
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

  // Check if account is active
  if (!user.isActive) {
    res.status(400);
    throw new Error("Account is deactivated");
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

  // Generate token
  const token = generateToken(user._id);

  // Return user data (excluding password)
  // Assuming user.getPublicProfile() exists and returns a clean user object
  const userData = user.getPublicProfile
    ? user.getPublicProfile()
    : {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        // ... any other public fields
      };

  res.json({
    message: "Login successful",
    token,
    user: userData, // Send the full public user data
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by authenticateToken middleware
  // Ensure getPublicProfile() method exists on your User model
  // Or manually construct the public profile
  const userData = req.user.getPublicProfile
    ? req.user.getPublicProfile()
    : {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        // ... any other public fields
      };
  res.json({ user: userData });
});

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = asyncHandler(async (req, res) => {
  // Generate new token using existing user from req.user
  const token = generateToken(req.user._id);

  res.json({
    message: "Token refreshed successfully",
    token,
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // This endpoint exists for consistency and potential future enhancements
  res.json({ message: "Logout successful" });
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const error = new Error("Validation failed");
    error.errors = errors.array();
    throw error;
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password"); // Explicitly select password

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
});

// @desc    Deactivate user account
// @route   POST /api/auth/deactivate
// @access  Private
const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found or already deactivated.");
  }

  res.json({ message: "Account deactivated successfully" });
});

module.exports = {
  generateToken,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  logoutUser,
  changePassword,
  deactivateAccount,
};
