// /server/controllers/userController.js

const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs/promises');

// --- Validation Rules for Profile Update ---
// These rules will be conditionally applied based on the user's role or present data.
const updateUserProfileValidation = [
  // General fields (applicable to both, but optional for update)
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit phone number'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('linkedin').optional().matches(/^https?:\/\/(www\.)?linkedin\.com\/.*$/).withMessage('Please enter a valid LinkedIn URL'),
  body('github').optional().matches(/^https?:\/\/(www\.)?github\.com\/.*$/).withMessage('Please enter a valid GitHub URL'),
  body('portfolio').optional().isURL().withMessage('Please enter a valid URL'),

  // Job Seeker Specific Fields (conditionally validate if role is jobSeeker)
  body('skills').optional().isArray().withMessage('Skills must be an array').custom((value) => {
    if (!Array.isArray(value)) return false; // Already checked by isArray, but good for type safety
    if (value.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
      throw new Error('Skills array must contain non-empty strings.');
    }
    return true;
  }),
  body('experience').optional().isInt({ min: 0, max: 50 }).withMessage('Experience must be a number between 0 and 50'),
  body('desiredRoles').optional().isArray().withMessage('Desired roles must be an array').custom((value) => {
    if (!Array.isArray(value)) return false;
    if (value.some(role => typeof role !== 'string' || role.trim().length === 0)) {
      throw new Error('Desired roles array must contain non-empty strings.');
    }
    return true;
  }),

  // Referrer Specific Fields (conditionally validate if role is referrer)
  body('company').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Company must be between 2 and 100 characters'),
  body('position').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),
  body('department').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Department must be between 2 and 100 characters'),
  body('yearsAtCompany').optional().isInt({ min: 0 }).withMessage('Years at company cannot be negative')
];

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (Authenticated User)

const updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error('Validation failed: ' + JSON.stringify(errors.array()));
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Prepare an object to store updates
  const updates = {};

  // --- Common Fields Update ---
  // Iterate over the keys in req.body. For fields common to both roles,
  // or if the field is defined as optional in the schema, we can update directly.
  const commonFields = ['name', 'phone', 'location', 'bio', 'avatar', 'linkedin', 'github', 'portfolio'];
  commonFields.forEach(field => {
    if (req.body[field] !== undefined) { // Check if the field was sent in the request
      updates[field] = req.body[field];
    }
  });

  // --- Role-Specific Fields Update ---
  if (user.role === 'jobSeeker') {
    const jobSeekerFields = ['skills', 'experience', 'resume', 'desiredRoles'];
    jobSeekerFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
  } else if (user.role === 'referrer') {
    const referrerFields = ['company', 'position', 'department', 'yearsAtCompany'];
    referrerFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
  } else if (user.role === 'admin') {
    // Admin can potentially update more fields or specific user profiles via separate routes
    // For /api/users/profile, we'll keep it simple: admin updates their own admin profile.
    // If admins have referrer-like fields, they can be updated here.
    // For now, assume admin profile update is similar to referrer or basic fields.
    const adminFields = ['company', 'position', 'department', 'yearsAtCompany']; // Example for admin acting like referrer
    adminFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
  }

  // Apply updates using Object.assign or loop
  // Object.assign(user, updates); // Simpler way to apply all validated updates
  for (const key in updates) {
    user[key] = updates[key];
  }

  await user.save(); // Mongoose will run schema validations on save

  // Return the updated public profile
  res.json({
    message: 'Profile updated successfully',
    user: user.getPublicProfile()
  });
});

// @desc    Get user profile (current user)
// @route   GET /api/users/profile
// @access  Private (Authenticated User)
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is already populated by authenticateToken middleware
  // and contains the public profile data
  res.json({ user: req.user.getPublicProfile() });
});

// @desc    Upload user avatar
// @route   POST /api/users/profile/avatar
// @access  Private (Authenticated User)
const uploadAvatar = asyncHandler(async (req, res) => {
  // Multer will place the file info on req.file
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided for avatar upload.');
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Upload image to Cloudinary
  // You might want to specify a folder, quality, transformations etc.
  // Ensure the file path is correct (req.file.path or req.file.buffer depending on multer config)
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'job_portal_avatars', // Optional: organize your uploads
      width: 200, // Optional: resize for avatars
      height: 200,
      crop: "fill" // Crop to fill dimensions
    });

    // Update user's avatar URL in the database
    user.avatar = result.secure_url;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: user.avatar,
      user: user.getPublicProfile()
    });

  } catch (uploadError) {
    console.error('Cloudinary upload error:', uploadError);
    res.status(500);
    throw new Error('Image upload failed. Please try again.');
  }
});
// @desc    Upload user resume (PDF)
// @route   POST /api/users/profile/resume
// @access  Private (Authenticated User)
const uploadResume = asyncHandler(async (req, res) => {
  // Multer will place the file info on req.file
  if (!req.file) {
    res.status(400);
    throw new Error('No PDF file provided for resume upload.');
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    // Clean up the uploaded file if user not found
    await fs.unlink(req.file.path);
    res.status(404);
    throw new Error('User not found.');
  }

  try {
    // Upload PDF to Cloudinary as a raw file or specific resource type for documents
    // 'raw' resource type is good for general files like PDFs
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw", // Important for non-image files like PDF
      folder: 'job_portal_resumes', // Optional: organize your uploads
      public_id: `resume_${userId}_${Date.now()}` // Optional: unique public ID
    });

    // Delete old resume from Cloudinary if it exists
    if (user.resume) {
      try {
        const oldPublicId = user.resume.split('/').pop().split('.')[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: "raw" });
      } catch (destroyError) {
        console.warn(`Could not delete old resume ${user.resume}:`, destroyError.message);
        // Log warning but don't block the new upload
      }
    }

    // Update user's resume URL in the database
    user.resume = result.secure_url;
    await user.save();

    // Clean up the temporary file stored by multer
    await fs.unlink(req.file.path);

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl: user.resume,
      user: user.getPublicProfile()
    });

  } catch (uploadError) {
    console.error('Cloudinary resume upload error:', uploadError);
    // Clean up temporary file on error
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path);
    }
    res.status(500);
    throw new Error('Resume upload failed. Please try again.');
  }
});



module.exports = {
  updateUserProfile,
  updateUserProfileValidation,
  getUserProfile,
  uploadAvatar,
  uploadResume
};