const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use env-configured directory, fallback to local uploads/ for development
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// Ensure the directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
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
 * In production uses API_BASE_URL env var; in dev falls back to /uploads/<filename>.
 */
const getUploadUrl = (filename) => {
  const base = process.env.API_BASE_URL || '';
  return `${base}/uploads/${filename}`;
};

module.exports = { upload, getUploadUrl };
