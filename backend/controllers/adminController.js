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

// @desc    Create a custom sticker pack (admin only)
// @route   POST /api/admin/custom-pack
// @access  Private/Admin
exports.createCustomPack = async (req, res, next) => {
    const { name, cost, numStickers } = req.body;
    if (!name || !cost || !numStickers) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }
    try {
        const customPack = await StickerPack.create({
            name,
            cost,
            numStickers,
            isSpecialOffer: false
        });
        res.status(201).json({ success: true, data: customPack });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a custom sticker pack (admin only)
// @route   DELETE /api/admin/custom-pack/:packId
// @access  Private/Admin
exports.deleteCustomPack = async (req, res, next) => {
    try {
        const pack = await StickerPack.findById(req.params.packId);
        if (!pack) {
            return res.status(404).json({ success: false, message: 'Pack not found' });
        }
        await pack.deleteOne();
        res.status(200).json({ success: true, message: 'Pack deleted' });
    } catch (err) {
        next(err);
    }
};