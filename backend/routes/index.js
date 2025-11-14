const express = require('express');
const router = express.Router();

// 1. Import all your individual route files
const authRoutes = require('./authRoutes');
const payrollRoutes = require('./payrollRoutes');
const chatbotRoutes = require('./chatbotRoutes');
// Import routes for profile management, promotion, etc. as you create them

// 2. Mount the routes onto the main router
// All routes in 'authRoutes' will be prefixed with /api/auth
router.use('/auth', authRoutes);

// All routes in 'payrollRoutes' will be prefixed with /api/payroll
router.use('/payroll', payrollRoutes);

// All routes in 'chatbotRoutes' will be prefixed with /api/chatbot
router.use('/chatbot', chatbotRoutes);

// 3. Add a default/test route for /api
router.get('/', (req, res) => {
    res.json({ message: 'EHRMS API is running successfully.' });
});

module.exports = router;