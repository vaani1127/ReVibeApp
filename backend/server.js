// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// // --- Configuration ---
// // Load environment variables from .env file
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// const app = express();
// const PORT = process.env.PORT || 3001;

// // --- Database Connection ---
// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);
//         console.log(`[Server] MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`[Server] Error connecting to MongoDB: ${error.message}`);
//         process.exit(1); // Exit process with failure
//     }
// };

// connectDB();

// // --- Middleware ---
// // 1. Enable CORS for all routes
// app.use(cors());

// // 2. Body Parser: Allow the server to accept JSON data
// app.use(express.json());

// // 3. Serve Static Files:
// // This serves all your frontend HTML, CSS, JS, and images.
// const frontendPath = path.join(__dirname, '../../revibeapp/frontend/public');
// app.use(express.static(frontendPath));

// // --- API Routes ---
// // This imports and uses your main API router from backend/routes/index.js
// const apiRoutes = require('./routes/index');
// app.use('/api', apiRoutes);

// // --- Frontend Catch-all Route ---
// // This is the key! It serves your HTML pages for any route that is NOT an API route.
// // This allows your single-page app (SPA) routing to work.
// app.get('*', (req, res) => {
//     // Check if the request is for an API route
//     if (req.originalUrl.startsWith('/api')) {
//         return res.status(404).json({ message: 'API route not found' });
//     }
//     // Otherwise, send the main index.html file for all other routes
//     res.sendFile(path.join(frontendPath, 'index.html'));
// });


// // --- Global Error Handler ---
// // This middleware will catch any errors passed by asyncHandler
// app.use((err, req, res, next) => {
//     console.error(`[Server Error] ${err.stack}`);
    
//     // Check for Mongoose CastError (e.g., invalid ObjectId)
//     if (err.name === 'CastError') {
//         return res.status(400).json({ success: false, message: 'Invalid ID format' });
//     }
    
//     // Default to a 500 server error
//     res.status(500).json({ 
//         success: false, 
//         message: 'Internal Server Error' 
//     });
// });


// // --- Start Server ---
// app.listen(PORT, () => {
//     console.log(`[Server] Server is running on http://localhost:${PORT}`);
// });


// --- Imports ---
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// --- Load Environment Variables ---
// Load .env file from the root directory
// We go up one level ('../') from 'backend' to the root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// --- App Initialization ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Connection ---
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in your .env file');
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[Server] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Server Error] MongoDB Connection Failed: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};
connectDB();

// --- Middleware ---
// Enable CORS for all routes (allows frontend to talk to backend)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// --- Serve Static Frontend Files ---
// This is the correct path:
// __dirname is '.../backend'
// We go up one level to '.../'
// Then down into 'frontend/public'
const frontendPath = path.resolve(__dirname, '../frontend/public');
console.log(`[Server] Serving static files from: ${frontendPath}`);
app.use(express.static(frontendPath));

// 'express.static' will now correctly find:
// /index.html (or /)
// /pages/register.html
// /scripts/auth.js
// /style.css

// --- API Routes ---
// All API requests starting with /api will be handled by this router
const mainApiRouter = require('./routes'); // This imports ./routes/index.js
app.use('/api', mainApiRouter);

// --- Error Handling Middleware ---
// Not Found (404) Error Handler
app.use((req, res, next) => {
    // This will catch any request that doesn't match a static file or an API route
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// General Error Handler
// This catches all errors passed by 'next(error)'
app.use((err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle Mongoose CastError (e.g., invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    console.error(`[Server Error] ${err.stack}`); // Log the full error stack

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`[Server] Server is running on http://localhost:${PORT}`);
});