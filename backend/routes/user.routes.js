const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer();

// POST Register User
router.post(
  '/register',
  upload.none(),
  body('email').trim().isEmail().withMessage('Invalid email format'),
  body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(err => err.msg).join(', ') });
    }

    const { email, username, password } = req.body;

    try {
      // Check for existing user
      const existingUser = await userModel.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          return res.status(400).json({ message: 'Email already exists' });
        }
        if (existingUser.username === username.toLowerCase()) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }

      const hashPassword = await bcrypt.hash(password, 10);

      await userModel.create({
        email,
        username,
        password: hashPassword
      });
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error); // Log for debugging
      if (error.code === 11000) { // MongoDB duplicate key error
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
      }
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
  }
);

// POST Login User
router.post(
  '/login',
  upload.none(),
  body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(err => err.msg).join(', ') });
    }

    const { username, password } = req.body;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'Lax'
    });

    res.status(200).json({ message: 'Login successful' });
  }
);

module.exports = router;