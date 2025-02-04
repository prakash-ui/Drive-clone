const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// GET Register Page
router.get('/register', (req, res) => {
    res.render('register', { errorMessage: null });
});

// POST Register User
router.post('/register',
    body('email').trim().isEmail().withMessage('Invalid email format'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('register', {
                errorMessage: errors.array().map(err => err.msg).join(', ')
            });
        }

        const { email, username, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        try {
            await userModel.create({
                email,
                username,
                password: hashPassword
            });
            res.redirect('/user/login');  // Redirect to login after successful registration
        } catch (error) {
            res.render('register', { errorMessage: "Server error. Please try again." });
        }
    }
);

// GET Login Page
router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

// POST Login User
router.post('/login',
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('login', {
                errorMessage: errors.array().map(err => err.msg).join(', ')
            });
        }

        const { username, password } = req.body;

        const user = await userModel.findOne({ username });

        if (!user) {
            return res.render('login', { errorMessage: 'Username or password is incorrect' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', { errorMessage: 'Username or password is incorrect' });
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            username: user.username,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token);
        res.redirect('/home');  // Redirect to the dashboard after successful login
    }
);

module.exports = router;
