const express = require('express');
const { upload, uploadToSupabase } = require('../config/multer.config');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// GET Home (Protected route for authenticated users)
router.get('/home', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Welcome to the homepage', user: req.user });
});

// POST Upload File (Protected route)
router.post('/upload-file', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await uploadToSupabase(req.file);

    if (!result) {
      return res.status(400).json({ error: 'Failed to upload file to storage' });
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: result.filePath,
      fileURL: result.publicURL
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `Server error: ${error.message || 'Unknown error during upload'}` });
  }
});

module.exports = router;