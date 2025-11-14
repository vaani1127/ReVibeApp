const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // This ID links the login data (User) to the HR data (Employee)
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6 // Enforce a minimum password length
    },
    role: {
        type: String,
        enum: ['employee', 'hr', 'admin'], // Define allowed roles
        default: 'employee'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// --- Mongoose Middleware ---

// This function runs *before* a User document is saved to the database
userSchema.pre('save', async function (next) {
    // Only hash the password if it's being modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    // Generate a 'salt' to add randomness to the hash
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Mongoose Methods ---

// Add a custom method to the User model to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this.password' is the hashed password from the database
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;