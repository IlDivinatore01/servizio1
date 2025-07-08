const Sticker = require('../models/Sticker');

// @desc    Get all character names
// @route   GET /api/characters/names
// @access  Public
exports.getCharacterNames = async (req, res) => {
    try {
        const stickers = await Sticker.find({}, 'name').lean();
        const names = stickers.map(s => s.name).filter(Boolean);
        res.json(names);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch character names' });
    }
};
