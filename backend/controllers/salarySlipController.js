const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../models/employeeModel');

/**
 * @desc    Get all salary slips for an employee
 * @route   GET /api/salary-slip/:employeeId
 * @access  Private
 */
exports.getEmployeeSlips = asyncHandler(async (req, res) => {
    const requestedEmployeeId = req.params.employeeId;
    const authenticatedUser = req.user;

    // Allow HR/Admin or the employee themselves to see the slips
    if (authenticatedUser.role !== 'hr' && 
        authenticatedUser.role !== 'admin' &&
        authenticatedUser.employeeId !== requestedEmployeeId) {
        return res.status(403).json({ success: false, message: 'Not authorized to view salary slips' });
    }

    const employee = await Employee.findOne({ employeeId: requestedEmployeeId })
                                   .select('employeeId salarySlips'); // Only get the slips

    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee.salarySlips });
});


/**
 * @desc    Update a specific salary slip
 * @route   PUT /api/salary-slip/update/:slipId
 * @access  Private (HR/Admin only)
 */
exports.updateSalarySlip = asyncHandler(async (req, res) => {
    // Only HR or Admin can update a slip
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
    }

    const { slipId } = req.params;
    const { basicSalary, allowances, deductions } = req.body; // The fields to update

    // Find the employee who has this slip
    const employee = await Employee.findOne({ "salarySlips._id": slipId });

    if (!employee) {
        return res.status(404).json({ success: false, message: 'Salary slip not found' });
    }

    // Get the specific slip from the employee's array
    const slip = employee.salarySlips.id(slipId);

    if (!slip) {
        return res.status(404).json({ success: false, message: 'Salary slip sub-document not found' });
    }

    // Update the slip's fields
    slip.basicSalary = basicSalary !== undefined ? basicSalary : slip.basicSalary;
    slip.allowances = allowances !== undefined ? allowances : slip.allowances;
    slip.deductions = deductions !== undefined ? deductions : slip.deductions;

    // Recalculate Net Pay
    const totalAllowances = slip.allowances.reduce((acc, item) => acc + item.amount, 0);
    const totalDeductions = slip.deductions.reduce((acc, item) => acc + item.amount, 0);
    slip.netPay = (slip.basicSalary + totalAllowances) - totalDeductions;

    // Save the parent employee document
    await employee.save();

    res.status(200).json({
        success: true,
        message: 'Salary slip updated successfully',
        data: slip
    });
});