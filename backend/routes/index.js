const express = require('express');
const router = express.Router();

// 1. Import all your individual route files
const authRoutes = require('./authRoutes');
const payrollRoutes = require('./payrollRoutes');
const chatbotRoutes = require('./chatbotRoutes');
// --- ADDED MISSING IMPORTS ---
const jobProfileRoutes = require('./jobProfileRoutes');
const promotionRoutes = require('./promotionRoutes');
const salarySlipRoutes = require('./salarySlipRoutes');

// 2. Mount the routes onto the main router
// All routes in 'authRoutes' will be prefixed with /api/auth
router.use('/auth', authRoutes);

// All routes in 'payrollRoutes' will be prefixed with /api/payroll
router.use('/payroll', payrollRoutes);

// All routes in 'chatbotRoutes' will be prefixed with /api/chatbot
router.use('/chatbot', chatbotRoutes);

// --- ADDED MISSING ROUTES ---

// All routes in 'jobProfileRoutes' will be prefixed with /api/job-profile
router.use('/job-profile', jobProfileRoutes);

// All routes in 'promotionRoutes' will be prefixed with /api/promotion
router.use('/promotion', promotionRoutes);

// All routes in 'salarySlipRoutes' will be prefixed with /api/salary-slip
router.use('/salary-slip', salarySlipRoutes);


// 3. Add a default/test route for /api
router.get('/', (req, res) => {
    res.json({ message: 'EHRMS API is running successfully.' });
});

module.exports = router;