const express = require('express');
const router = express.Router();
const salarySlipController = require('../controllers/salarySlipController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(authMiddleware);

// @route   GET /api/salary-slip/:employeeId
// @desc    Get all salary slips for an employee
// @access  Private
router.get('/:employeeId', salarySlipController.getEmployeeSlips);

// @route   PUT /api/salary-slip/update/:slipId
// @desc    Update a specific salary slip (e.g., add bonus, correct deduction)
// @access  Private (HR/Admin)
router.put('/update/:slipId', salarySlipController.updateSalarySlip);

module.exports = router;