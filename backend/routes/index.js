const express = require('express');
const { upload, uploadToSupabase } = require('../config/multer.config');
const authMiddleware = require('../middlewares/auth');
const winston = require('winston');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

// Base API route
router.get('/status', (req, res) => {
  res.json({ message: "API is working!" });
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 uploads per window
});

// GET Home (Protected route)
router.get('/home', authMiddleware, (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to the homepage', 
    user: {
      userId: req.user.userId,
      username: req.user.username
    }
  });
});

// POST Upload File (Protected route)
router.post('/files/upload', authMiddleware, uploadLimiter, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  logger.info(`File uploaded by user ${req.user.userId}: ${req.file.filename}`);
  
  res.status(200).json({
    message: 'File uploaded successfully',
    filePath: `/uploads/${req.file.filename}`
  });
});

module.exports = router;