const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../models/employeeModel');
const mongoose = require('mongoose');

/**
 * @desc    Run payroll for all employees
 * @route   POST /api/payroll/run
 * @access  Private (HR/Admin only)
 */
exports.runPayroll = asyncHandler(async (req, res) => {
    // 1. Check if user is HR or Admin
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to perform this action' });
    }

    const { payPeriod } = req.body; // e.g., "2025-11"
    if (!payPeriod) {
        return res.status(400).json({ success: false, message: 'Pay period is required.' });
    }

    // Use a session for transactions
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Find all employees
        const employees = await Employee.find().session(session);

        if (!employees || employees.length === 0) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'No employees found to process.' });
        }

        let processedCount = 0;

        // 3. Loop through each employee and generate a slip
        for (const employee of employees) {
            // Check if slip for this period already exists
            const slipExists = employee.salarySlips.some(slip => slip.payPeriod === payPeriod);
            
            if (slipExists) {
                continue; // Skip if slip already exists for this month
            }

            // --- 4. Simple Salary Calculation ---
            const basic = employee.compensation.basicSalary;
            // Example Allowance: 10% of basic
            const allowanceAmount = basic * 0.10;
            const allowances = [{ name: 'Special Allowance', amount: allowanceAmount }];
            // Example Deduction: 5% of basic
            const deductionAmount = basic * 0.05;
            const deductions = [{ name: 'Tax', amount: deductionAmount }];

            const netPay = (basic + allowanceAmount) - deductionAmount;
            // --- End Calculation ---

            const newSlip = {
                payPeriod,
                basicSalary: basic,
                allowances,
                deductions,
                netPay,
                generatedAt: new Date()
            };

            // 5. Add the new slip to the employee's document
            employee.salarySlips.push(newSlip);
            await employee.save({ session });
            processedCount++;
        }

        // 6. Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ 
            success: true, 
            message: `Payroll processed successfully for ${processedCount} employees.` 
        });

    } catch (error) {
        // If anything fails, roll back
        await session.abortTransaction();
        session.endSession();
        console.error('Payroll Run Error:', error);
        res.status(500).json({ success: false, message: 'Server error during payroll processing.', error: error.message });
    }
});