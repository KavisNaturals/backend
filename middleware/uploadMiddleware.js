const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Production: /var/www/kavis/uploads  |  Development: ./uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/kavis/uploads';
const fallbackDir = path.join(__dirname, '../uploads');

// Attempt production dir first; fall back to local on failure
let resolvedUploadDir = UPLOAD_DIR;
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  resolvedUploadDir = fallbackDir;
}

fs.mkdirSync(resolvedUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resolvedUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png, and webp images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Build the public URL for an uploaded file.
 * In production: https://api.kavisnaturals.cloud/uploads/<filename>
 * In dev:        http://localhost:5000/uploads/<filename>
 */
const getUploadUrl = (filename) => {
  const base = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${base}/uploads/${filename}`;
};

module.exports = { upload, getUploadUrl };
