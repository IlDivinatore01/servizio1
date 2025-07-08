const express = require('express');
const { getStickerPacks, buyStickerPack, sellSticker, getAllStickers } = require('../controllers/stickerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/all', getAllStickers); // Add this new route
router.get('/packs', getStickerPacks);
router.post('/packs/buy/:packId', protect, buyStickerPack);
router.post('/sell', protect, sellSticker);

// Make sure this line is at the end of the file
module.exports = router;