const User = require('../models/User');
const Sticker = require('../models/Sticker');
const StickerPack = require('../models/StickerPack');
const { getRandomStickers } = require('../utils/Randomizer');

// @desc    Buy a sticker pack
// @route   POST /api/stickers/packs/buy/:packId
// @access  Private
exports.buyStickerPack = async (req, res, next) => {
    try {
        console.log('--- buyStickerPack Controller ---');
        console.log('Request Params:', req.params);
        console.log('Pack ID Received:', req.params.packId);
        console.log('Request Body:', req.body);
        console.log('DEBUG buyStickerPack req.body:', req.body);
        let rawQuantity = req.body.quantity;
        const quantity = parseInt(rawQuantity, 10) || 1;
        console.log('DEBUG buyStickerPack parsed quantity:', quantity);

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
        }

        const pack = await StickerPack.findById(req.params.packId);
        if (!pack) {
            return res.status(404).json({ success: false, message: 'Sticker pack not found' });
        }

        const user = await User.findById(req.user.id);
        const totalCost = pack.cost * quantity;

        if (user.credits < totalCost) {
            return res.status(400).json({ success: false, message: 'Not enough credits' });
        }

        // Deduct credits
        user.credits -= totalCost;

        // Get random stickers
        const totalStickersToGet = pack.numStickers * quantity;
        const newStickers = await getRandomStickers(totalStickersToGet);
        
        if (newStickers.length < totalStickersToGet) {
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
            message: `Successfully purchased ${quantity} sticker pack(s)!`,
            data: newStickers,
            newCredits: user.credits
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
        console.log('--- getStickerPacks Controller CALLED ---');
        const packs = await StickerPack.find({
          $or: [
            { isSpecialOffer: false },
            { isSpecialOffer: true, availableUntil: { $gt: new Date() } }
          ]
        });
        if (!packs || packs.length === 0) {
            console.log('No sticker packs found in the database!');
        } else {
            console.log('Available packs:', packs.map(p => ({ id: p._id, name: p.name })));
        }
        // Add isCustom: true for all packs that are not the standard pack and not special offer
        const packsWithCustomFlag = packs.map(pack => {
            // Standard pack: name === 'Standard Pack'
            // Custom pack: not special offer and not standard
            const isCustom = !pack.isSpecialOffer && pack.name !== 'Standard Pack';
            return {
                ...pack.toObject(),
                isCustom
            };
        });
        res.status(200).json({ success: true, data: packsWithCustomFlag });
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

// @desc    Get all unique stickers
// @route   GET /api/stickers/all
// @access  Public
exports.getAllStickers = async (req, res, next) => {
    try {
        const stickers = await Sticker.find().lean();
        res.status(200).json({ success: true, data: stickers });
    } catch (err) {
        next(err);
    }
};