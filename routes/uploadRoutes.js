const express = require('express');
const { upload, getUploadUrl } = require('../middleware/uploadMiddleware');

const router = express.Router();

// POST /api/upload  – accepts field name "image"
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  return res.json({
    message: 'Uploaded successfully',
    fileName: req.file.filename,
    url: getUploadUrl(req.file.filename),
  });
});

// Centralised multer error handler
router.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || 'Upload error' });
  }
  next();
});

module.exports = router;