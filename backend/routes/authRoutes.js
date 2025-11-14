const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (for now)
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user (login)
// @access  Public
router.post('/login', authController.loginUser);

// @route   GET /api/auth/me
// @desc    Get current user's details (example of a protected route)
// @access  Private
router.get('/me', authMiddleware, (req, res) => {
    // req.user is attached by the authMiddleware
    res.json({ success: true, data: req.user });
});

module.exports = router;