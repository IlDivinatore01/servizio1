const StickerPack = require('../models/StickerPack');

// @desc    Create a special offer sticker pack [cite: 466]
// @route   POST /api/admin/offers
// @access  Private/Admin
exports.createSpecialOffer = async (req, res, next) => {
    const { name, cost, numStickers, availableUntil } = req.body;

    if (!name || !cost || !numStickers || !availableUntil) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields for the special offer.' });
    }

    try {
        const specialOffer = await StickerPack.create({
            name,
            cost,
            numStickers,
            availableUntil,
            isSpecialOffer: true
        });

        res.status(201).json({ success: true, data: specialOffer });

    } catch (err) {
        next(err);
    }
};