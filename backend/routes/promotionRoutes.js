const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(authMiddleware);

// @route   POST /api/promotion/:employeeId
// @desc    Process a promotion for an employee (new designation, pay scale)
// @access  Private (HR/Admin)
router.post('/:employeeId', promotionController.processPromotion);

module.exports = router;