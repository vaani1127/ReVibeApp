const express = require('express');
const router = express.Router();
const salarySlipController = require('../controllers/salarySlipController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(authMiddleware);

// @route   GET /api/salary-slip/my-slips
// @desc    Get all salary slips for the logged-in employee
// @access  Private (Employee only)
router.get('/my-slips', salarySlipController.getMySlips);

// --- ADD THIS ROUTE ---
// @route   GET /api/salary-slip/all-slips
// @desc    Get all slips for all employees (for Admin)
// @access  Private (HR/Admin only)
router.get('/all-slips', salarySlipController.getAllSlips);

// --- ADD THIS ROUTE ---
// @route   GET /api/salary-slip/:employeeId/:slipId
// @desc    Get a specific salary slip (for Admin)
// @access  Private (HR/Admin only)
router.get('/:employeeId/:slipId', salarySlipController.getSlipDetails);

// @route   PUT /api/salary-slip/:employeeId/:slipId
// @desc    Update a specific salary slip (for HR/Admin)
// @access  Private (HR/Admin only)
router.put('/:employeeId/:slipId', salarySlipController.updateSalarySlip);

module.exports = router;