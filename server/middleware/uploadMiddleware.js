// /server/middleware/uploadMiddleware.js (UPDATED)

const multer = require('multer');
const path = require('path');
const fs = require('fs'); // For ensuring upload directory exists

// Ensure the 'uploads/' directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the created directory
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Generic file type checker
const fileFilter = (allowedFileTypes) => (req, file, cb) => {
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Error: Only ${allowedFileTypes.source.replace(/\|/g, ', ')} files are allowed!`));
  }
};

// --- Export specific upload configurations ---

// For Images (e.g., Avatar)
const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: fileFilter(/jpeg|jpg|png|gif/)
}).single('avatar'); // Expects the field name 'avatar'

// For PDFs (e.g., Resume)
const uploadPdf = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for PDFs
  fileFilter: fileFilter(/pdf/)
}).single('resume'); // Expects the field name 'resume'

module.exports = {
  uploadImage,
  uploadPdf
};