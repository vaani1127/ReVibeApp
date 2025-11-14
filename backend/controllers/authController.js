const User = require('../models/userModel');
const Employee = require('../models/employeeModel'); // We need this to link User and Employee
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

// Helper function to generate a JWT token
const generateToken = (res, userId, role, employeeId) => {
    const token = jwt.sign(
        { userId, role, employeeId }, // Payload
        process.env.JWT_SECRET,        // Secret
        { expiresIn: '1d' }           // Expires in 1 day
    );
    return token;
};

/**
 * @desc    Register a new user (and create a linked Employee profile)
 * @route   POST /api/auth/register
 * @access  Public (or Admin-only in a real app)
 */
exports.registerUser = asyncHandler(async (req, res) => {
    const { employeeId, password, role, firstName, lastName, email, designation, department } = req.body;

    // 1. Check if user (based on employeeId or email) already exists
    const userExists = await User.findOne({ employeeId });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this Employee ID already exists' });
    }

    const emailExists = await Employee.findOne({ 'personalInfo.email': email });
    if (emailExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // 2. Create the new User (for login)
    const user = new User({
        employeeId,
        password, // The 'pre-save' hook in userModel will hash this
        role
    });

    // 3. Create the new Employee (for HR data)
    const employee = new Employee({
        user: user._id, // Link to the User document
        employeeId,
        personalInfo: {
            firstName,
            lastName,
            email
        },
        jobProfile: {
            designation,
            department
        }
        // Add other fields as needed (e.g., compensation)
    });

    // 4. Save both to the database
    // We can use a transaction here for safety, but for simplicity:
    await user.save();
    await employee.save();

    // 5. Generate token and send response
    const token = generateToken(res, user._id, user.role, user.employeeId);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
            _id: user._id,
            employeeId: user.employeeId,
            role: user.role
        }
    });
});


/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = asyncHandler(async (req, res) => {
    const { employeeId, password } = req.body;

    // 1. Find the user by their employeeId
    const user = await User.findOne({ employeeId });

    // 2. Check if user exists AND if passwords match
    if (user && (await user.matchPassword(password))) {
        // 3. Generate token and send response
        const token = generateToken(res, user._id, user.role, user.employeeId);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                employeeId: user.employeeId,
                role: user.role
            }
        });
    } else {
        // 4. If login fails
        res.status(401).json({ success: false, message: 'Invalid employee ID or password' });
    }
});