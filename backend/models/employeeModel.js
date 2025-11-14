const mongoose = require('mongoose');

// --- Sub-schema for historical salary slips ---
// This will be an array nested inside the Employee model
const salarySlipSchema = new mongoose.Schema({
    payPeriod: { // e.g., "2025-11"
        type: String,
        required: true
    },
    basicSalary: { type: Number, required: true },
    allowances: [{
        name: String, // e.g., "HRA", "DA"
        amount: Number
    }],
    deductions: [{
        name: String, // e.g., "TDS", "PF"
        amount: Number
    }],
    netPay: { type: Number, required: true },
    generatedOn: { type: Date, default: Date.now }
});

// --- Main Employee Schema ---
const employeeSchema = new mongoose.Schema({
    // Link to the User model (for login)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The same ID used for login, for easy searching
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // --- Personal Details ---
    personalInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: { type: String },
        address: { type: String },
        dateOfBirth: { type: Date }
    },

    // --- Job Profile (Feature 3 & 4) ---
    jobProfile: {
        designation: { type: String }, // e.g., "Senior Developer"
        department: { type: String }, // e.g., "IT Services"
        reportingManager: { type: String }, // Can be an ID or just a name
        joinDate: { type: Date, default: Date.now }
    },

    // --- Compensation (Feature 4) ---
    compensation: {
        payScale: { type: String }, // e.g., "Level 10"
        basicSalary: { type: Number, default: 0 },
        // Current allowances
        allowances: [{
            name: String,
            amount: Number
        }]
    },

    // --- For Chatbot (Feature 5) ---
    leaveBalance: {
        casualLeave: { type: Number, default: 12 },
        sickLeave: { type: Number, default: 5 }
    },

    // --- Payroll History (Feature 1 & 2) ---
    // An array of all past salary slips
    salarySlips: [salarySlipSchema]

}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Create and export the model
const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;