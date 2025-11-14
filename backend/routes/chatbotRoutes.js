const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
// const authMiddleware = require('../middleware/authMiddleware'); // We'll add this later

// Define the route for sending a query to the chatbot
// POST /api/chatbot/query
router.post('/query', chatbotController.handleQuery);

module.exports = router;