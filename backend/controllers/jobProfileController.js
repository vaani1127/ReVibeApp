const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../models/employeeModel');

/**
 * @desc    Get an employee's job profile
 * @route   GET /api/job-profile/:employeeId
 * @access  Private
 */
exports.getJobProfile = asyncHandler(async (req, res) => {
    const requestedEmployeeId = req.params.employeeId;
    const authenticatedUser = req.user; // from authMiddleware

    // Check if user is HR/Admin OR if they are requesting their own profile
    if (authenticatedUser.role !== 'hr' && 
        authenticatedUser.role !== 'admin' &&
        authenticatedUser.employeeId !== requestedEmployeeId) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    const employee = await Employee.findOne({ employeeId: requestedEmployeeId })
                                   .select('employeeId personalInfo jobProfile compensation'); // Select specific fields

    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
});


/**
 * @desc    Update an employee's job profile (role, dept, manager)
 * @route   PUT /api/job-profile/:employeeId
 * @access  Private (HR/Admin only)
 */
exports.updateJobProfile = asyncHandler(async (req, res) => {
    // Only HR or Admin can update a job profile
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
    }

    const { department, designation, reportingManager } = req.body;

    const employee = await Employee.findOne({ employeeId: req.params.employeeId });

    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Update the jobProfile fields
    employee.jobProfile.department = department || employee.jobProfile.department;
    employee.jobProfile.designation = designation || employee.jobProfile.designation;
    employee.jobProfile.reportingManager = reportingManager || employee.jobProfile.reportingManager;

    const updatedEmployee = await employee.save();

    res.status(200).json({ 
        success: true, 
        message: 'Job profile updated successfully',
        data: updatedEmployee.jobProfile 
    });
});