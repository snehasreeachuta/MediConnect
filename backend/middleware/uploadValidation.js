const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config/environment');
const AppError = require('../utils/AppError');

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '..', config.upload.directory);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate safe, non-guessable random hex filename preserving extension
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase() || 
      (file.mimetype === 'application/pdf' ? '.pdf' : 
       file.mimetype === 'image/png' ? '.png' : 
       file.mimetype === 'image/webp' ? '.webp' : '.jpg');
    const safeName = `medrec_${Date.now()}_${randomHex}${ext}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  // Validate MIME type: PDF and common medical image formats
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file format. Supported formats are PDF, JPEG, PNG, and WEBP.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMb * 1024 * 1024 // e.g. 10MB
  }
});

module.exports = {
  upload,
  uploadDir
};
