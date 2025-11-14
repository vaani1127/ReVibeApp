const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/userModel');

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Check for the Authorization header and format (Bearer TOKEN)
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            // 2. Get the token from the header
            token = authHeader.split(' ')[1];

            // 3. Verify the token using the secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user from the token's payload (decoded.userId)
            // We attach this 'user' object to the request (req.user)
            // This 'req.user' will be available in all protected routes
            req.user = {
                userId: decoded.userId,
                role: decoded.role,
                employeeId: decoded.employeeId
            };
            
            // 5. Call the next middleware or controller
            next();

        } catch (error) {
            console.error('[Auth Middleware] Token verification failed:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
});

module.exports = authMiddleware;