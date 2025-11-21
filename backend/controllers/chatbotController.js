const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../models/employeeModel');

/**
 * @desc    Handle chatbot query using Gemini API
 * @route   POST /api/chatbot/query
 * @access  Private
 */
exports.handleQuery = asyncHandler(async (req, res) => {
    const { query } = req.body;
    const { employeeId } = req.user; // Get the user's ID from the auth token

    if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required.' });
    }

    // --- 1. Fetch Employee Data for Context ---
    // Get the employee's data to give context to the AI
    const employee = await Employee.findOne({ employeeId: employeeId })
        .select('personalInfo jobProfile leaveBalance');
    
    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    // --- 2. Construct a System Prompt for the AI ---
    // This is crucial for getting good, relevant answers.
    const systemPrompt = `
        You are a professional HR assistant chatbot for a government organization.
        You must be polite, concise, and helpful.
        You will answer questions based *only* on the employee context provided below.
        If the answer is not in the context, politely say you don't have that information.
        
        Employee Context:
        - Name: ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}
        - Designation: ${employee.jobProfile.designation}
        - Department: ${employee.jobProfile.department}
        - Available Casual Leave: ${employee.leaveBalance.casualLeave} days
        - Available Sick Leave: ${employee.leaveBalance.sickLeave} days
    `;

    // --- 3. Call the Gemini API ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[Chatbot] GEMINI_API_KEY is not set.');
        return res.status(500).json({ success: false, message: 'Chatbot service is not configured.' });
    }

    // --- UPDATED THIS LINE ---
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: query }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('[Chatbot] Gemini API Error:', errorData);
            throw new Error('Failed to get response from AI service.');
        }

        const result = await apiResponse.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const botReply = candidate.content.parts[0].text;
            res.status(200).json({ success: true, reply: botReply });
        } else {
            throw new Error('Invalid response structure from AI service.');
        }

    } catch (error) {
        console.error('[Chatbot] API call failed:', error.message);
        res.status(500).json({ success: false, message: 'Sorry, I am unable to process your request right now.' });
    }
});