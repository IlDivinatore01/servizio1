const express = require('express');
const { createTrade, getTrades, acceptTrade } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, createTrade)
    .get(getTrades);

router.post('/:id/accept', protect, acceptTrade);

// Make sure this line is at the end of the file
module.exports = router;