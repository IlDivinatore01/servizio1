const User = require('../models/User');
const Sticker = require('../models/Sticker');
const StickerPack = require('../models/StickerPack');
const { getRandomStickers } = require('../utils/Randomizer');

// @desc    Buy a sticker pack
// @route   POST /api/stickers/packs/buy/:packId
// @access  Private
exports.buyStickerPack = async (req, res, next) => {
    try {
        const pack = await StickerPack.findById(req.params.packId);
        if (!pack) {
            return res.status(404).json({ success: false, message: 'Sticker pack not found' });
        }

        const user = await User.findById(req.user.id);

        if (user.credits < pack.cost) {
            return res.status(400).json({ success: false, message: 'Not enough credits' });
        }

        // Deduct credits
        user.credits -= pack.cost;

        // Get random stickers
        const newStickers = await getRandomStickers(pack.numStickers);
        if (newStickers.length < pack.numStickers) {
            return res.status(500).json({ success: false, message: 'Could not generate a full sticker pack. Not enough unique stickers in the system.'});
        }

        // Add stickers to user's collection
        newStickers.forEach(sticker => {
            const existingSticker = user.ownedStickers.find(s => s.sticker.equals(sticker._id));
            if (existingSticker) {
                existingSticker.quantity += 1;
            } else {
                user.ownedStickers.push({
                    sticker: sticker._id,
                    characterId: sticker.characterId,
                    quantity: 1,
                });
            }
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Sticker pack purchased successfully!',
            data: newStickers.map(s => s.name),
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all available sticker packs
// @route   GET /api/stickers/packs
// @access  Public
exports.getStickerPacks = async (req, res, next) => {
    try {
        const packs = await StickerPack.find({
          $or: [
            { isSpecialOffer: false },
            { isSpecialOffer: true, availableUntil: { $gt: new Date() } }
          ]
        });
        res.status(200).json({ success: true, data: packs });
    } catch (err) {
        next(err);
    }
};

// @desc    Sell a duplicate sticker for credits [cite: 465]
// @route   POST /api/stickers/sell
// @access  Private
exports.sellSticker = async (req, res, next) => {
    const { stickerId } = req.body;
    const SELL_PRICE = 0.2; // 20% of the standard pack cost (1 credit / 5 stickers)

    try {
        const user = await User.findById(req.user.id);
        const stickerToSell = user.ownedStickers.find(s => s.sticker.equals(stickerId));

        if (!stickerToSell) {
            return res.status(404).json({ success: false, message: 'Sticker not found in your collection.' });
        }

        if (stickerToSell.quantity < 2) {
            return res.status(400).json({ success: false, message: 'You can only sell duplicate stickers (quantity > 1).' });
        }

        // Decrease sticker quantity
        stickerToSell.quantity -= 1;

        // Add credits to user
        user.credits += SELL_PRICE;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Sticker sold successfully.',
            data: {
                credits: user.credits,
                stickerId: stickerId,
                newQuantity: stickerToSell.quantity
            }
        });
    } catch (err) {
        next(err);
    }
};