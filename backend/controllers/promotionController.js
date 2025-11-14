const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../models/employeeModel');

/**
 * @desc    Process a promotion for an employee
 * @route   POST /api/promotion/:employeeId
 * @access  Private (HR/Admin only)
 */
exports.processPromotion = asyncHandler(async (req, res) => {
    // Only HR or Admin can process promotions
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
    }

    const { newDesignation, newPayScale, newBasicSalary } = req.body;

    // Validate input
    if (!newDesignation || !newPayScale || !newBasicSalary) {
        return res.status(400).json({ success: false, message: 'Please provide new designation, pay scale, and basic salary' });
    }

    const employee = await Employee.findOne({ employeeId: req.params.employeeId });

    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // --- Apply Promotion ---

    // 1. Update Job Profile
    employee.jobProfile.designation = newDesignation;
    
    // 2. Update Compensation
    employee.compensation.payScale = newPayScale;
    employee.compensation.basicSalary = newBasicSalary;
    
    // (In a real app, you might also update allowances here)

    // 3. (Optional) Add a record/log of this promotion, e.g., in a new 'jobHistory' array in the model.

    const updatedEmployee = await employee.save();

    res.status(200).json({ 
        success: true, 
        message: 'Promotion processed successfully',
        data: {
            jobProfile: updatedEmployee.jobProfile,
            compensation: updatedEmployee.compensation
        }
    });
});