const express = require('express');
const router = express.Router();
const jobProfileController = require('../controllers/jobProfileController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes in this file are protected and require a valid token
router.use(authMiddleware);

// @route   GET /api/job-profile/:employeeId
// @desc    Get an employee's job profile
// @access  Private (HR/Admin)
router.get('/:employeeId', jobProfileController.getJobProfile);

// @route   PUT /api/job-profile/:employeeId
// @desc    Update an employee's job profile (department, role, etc.)
// @access  Private (HR/Admin)
router.put('/:employeeId', jobProfileController.updateJobProfile);

module.exports = router;