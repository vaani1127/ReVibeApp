const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- UNCOMMENTED

// All routes in this file are protected
router.use(authMiddleware); // <-- ADDED THIS LINE

// Define the route for running payroll
// POST /api/payroll/run
router.post('/run', payrollController.runPayroll);

// TODO: Add routes for salary slip management
// GET /api/payroll/slips
// GET /api/payroll/slips/:employeeId
// POST /api/payroll/slips/update

module.exports = router;