const express = require('express');
const { createTrade, getTrades, acceptTrade, cancelTrade } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, createTrade)
    .get(getTrades);

router.route('/:id')
    .delete(protect, cancelTrade);

router.post('/:id/accept', protect, acceptTrade);

// Make sure this line is at the end of the file
module.exports = router;