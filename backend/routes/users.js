const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const auth = require('../middlewares/auth');

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

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}
// [NEW] Authentication check endpoint
router.get('/check-auth', auth, (req, res) => {
  res.status(200).json({ 
    authenticated: true,
    user: {
      userId: req.user.userId,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// Add this to handle /api/users
router.get('/', (req, res) => {
  res.json({ message: "Users endpoint working!" });
});

// POST Register User
router.post(
  '/register',
  [
    body('email').trim().isEmail().withMessage('Invalid email format'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password } = req.body;

    try {
      const existingUser = await userModel.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      });
      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          return res.status(400).json({ errors: [{ msg: 'Email already exists' }] });
        }
        if (existingUser.username === username.toLowerCase()) {
          return res.status(400).json({ errors: [{ msg: 'Username already exists' }] });
        }
      }

      const hashPassword = await bcrypt.hash(password, 10);
      await userModel.create({
        email,
        username,
        password: hashPassword,
      });

      logger.info(`User registered: ${username}`);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          errors: [{ msg: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` }],
        });
      }
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

// POST Login User
router.post(
  '/login',
  [
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      const user = await userModel.findOne({ username });
      if (!user) {
        return res.status(401).json({ errors: [{ msg: 'Username or password is incorrect' }] });

      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ errors: [{ msg: 'Username or password is incorrect' }] });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict', // Stricter for security
        maxAge: 3600000, // 1 hour
      });

      logger.info(`User logged in: ${username}`);
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
  }
);

module.exports = router;