const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- UNCOMMENTED

// All routes in this file are protected
router.use(authMiddleware); // <-- ADDED THIS LINE

// Define the route for sending a query to the chatbot
// POST /api/chatbot/query
router.post('/query', chatbotController.handleQuery);

module.exports = router;