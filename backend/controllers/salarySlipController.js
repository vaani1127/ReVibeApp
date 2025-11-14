const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../models/employeeModel');

/**
 * @desc    Get all salary slips for the logged-in employee
 * @route   GET /api/salary-slip/my-slips
 * @access  Private (Employee)
 */
exports.getMySlips = asyncHandler(async (req, res) => {
    // req.user.employeeId comes from the authMiddleware
    const employee = await Employee.findOne({ employeeId: req.user.employeeId })
                                   .select('salarySlips'); // Only select the salarySlips array

    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    res.status(200).json({
        success: true,
        slips: employee.salarySlips || [] // Return the slips array, or an empty array
    });
});


/**
 * @desc    Update a specific salary slip
 * @route   PUT /api/salary-slip/:employeeId/:slipId
 * @access  Private (HR/Admin only)
 */
exports.updateSalarySlip = asyncHandler(async (req, res) => {
    // 1. Check if user is HR/Admin
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
    }

    const { employeeId, slipId } = req.params;
    const { basicSalary, allowances, deductions } = req.body;

    // 2. Find the employee
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // 3. Find the specific slip in the sub-array
    const slip = employee.salarySlips.id(slipId);
    if (!slip) {
        return res.status(404).json({ success: false, message: 'Salary slip not found' });
    }

    // 4. Update the slip
    slip.basicSalary = basicSalary || slip.basicSalary;
    slip.allowances = allowances || slip.allowances;
    slip.deductions = deductions || slip.deductions;

    // Recalculate net pay
    const totalAllowances = slip.allowances.reduce((acc, curr) => acc + curr.amount, 0);
    const totalDeductions = slip.deductions.reduce((acc, curr) => acc + curr.amount, 0);
    slip.netPay = (slip.basicSalary + totalAllowances) - totalDeductions;

    // 5. Save the parent employee document
    await employee.save();

    res.status(200).json({ 
        success: true, 
        message: 'Salary slip updated successfully', 
        data: slip 
    });
});