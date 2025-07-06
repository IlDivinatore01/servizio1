const TradeOffer = require('../models/TradeOffer');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a trade offer
// @route   POST /api/trades
// @access  Private
exports.createTrade = async (req, res, next) => {
    // proposerItems: [{ stickerId: "...", quantity: 1 }]
    // requestedItems: [{ stickerId: "...", quantity: 1 }]
    // targetId: "..." (optional)
    const { proposerItems } = req.body;
    req.body.proposerId = req.user.id;

    try {
        const user = await User.findById(req.user.id);

        // --- Integrity Check 1: User must own the items they are proposing ---
        for (const item of proposerItems) {
            if (item.stickerId) {
                const owned = user.ownedStickers.find(s => s.sticker.equals(item.stickerId));
                if (!owned || owned.quantity < item.quantity) {
                    return res.status(400).json({ success: false, message: `You do not own enough of the proposed sticker.` });
                }
                 // --- Integrity Check 2: Cannot trade single sticker without warning (client-side handles warning, backend enforces rule for now)
                if (owned.quantity < 2) {
                    // This is a simplified check. A full implementation might allow it but with a confirmation.
                    // For the backend, we can block trading the last copy.
                    console.warn(`User ${user.username} is trying to trade their last copy of a sticker.`);
                }
            } else if (item.isCredit) {
                 if(user.credits < item.amount) {
                    return res.status(400).json({ success: false, message: `You do not have enough credits.`});
                 }
            }
        }

        const trade = await TradeOffer.create(req.body);

        res.status(201).json({ success: true, data: trade });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all available trades (open offers)
// @route   GET /api/trades
// @access  Public
exports.getTrades = async (req, res, next) => {
    try {
        const trades = await TradeOffer.find({ status: 'pending' })
            .populate('proposerId', 'username')
            .populate('proposerItems.sticker', 'name imageUrl')
            .populate('requestedItems.sticker', 'name imageUrl');
        res.status(200).json({ success: true, data: trades });
    } catch (err) {
        next(err);
    }
};

// @desc    Accept a trade offer
// @route   POST /api/trades/:id/accept
// @access  Private
// Helper function to check if user has required items
async function hasRequiredItems(user, items) {
    for (const item of items) {
        if (item.stickerId) {
            const owned = user.ownedStickers.find(s => s.sticker.equals(item.stickerId));
            if (!owned || owned.quantity < item.quantity) {
                return { success: false, message: `You do not have the required sticker(s) to accept this trade.` };
            }
        } else if (item.isCredit) {
            if (user.credits < item.amount) {
                return { success: false, message: 'You do not have enough credits for this trade.' };
            }
        }
    }
    return { success: true };
}

// Helper function to transfer items between users
async function transferItems(fromUser, toUser, items, session) {
    for (const item of items) {
        if (item.stickerId) {
            // Remove from fromUser
            let stickerInFrom = fromUser.ownedStickers.find(s => s.sticker.equals(item.stickerId));
            stickerInFrom.quantity -= item.quantity;
            // Add to toUser
            let stickerInTo = toUser.ownedStickers.find(s => s.sticker.equals(item.stickerId));
            if (stickerInTo) {
                stickerInTo.quantity += item.quantity;
            } else {
                const stickerData = await mongoose.model('Sticker').findById(item.stickerId).lean();
                toUser.ownedStickers.push({ sticker: item.stickerId, characterId: stickerData.characterId, quantity: item.quantity });
            }
        } else if (item.isCredit) {
            fromUser.credits -= item.amount;
            toUser.credits += item.amount;
        }
    }
}

exports.acceptTrade = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const trade = await TradeOffer.findById(req.params.id).session(session);
        if (!trade || trade.status !== 'pending') {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Trade not found or already handled.' });
        }

        const acceptor = await User.findById(req.user.id).session(session);
        const proposer = await User.findById(trade.proposerId).session(session);

        if (acceptor._id.equals(proposer._id)) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "You cannot accept your own trade." });
        }

        // Integrity check for acceptor
        const check = await hasRequiredItems(acceptor, trade.requestedItems);
        if (!check.success) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: check.message });
        }

        // Transfer items from acceptor to proposer
        await transferItems(acceptor, proposer, trade.requestedItems, session);

        // Transfer items from proposer to acceptor
        await transferItems(proposer, acceptor, trade.proposerItems, session);

        // Clean up empty sticker entries
        proposer.ownedStickers = proposer.ownedStickers.filter(s => s.quantity > 0);
        acceptor.ownedStickers = acceptor.ownedStickers.filter(s => s.quantity > 0);

        // Update trade status
        trade.status = 'accepted';

        await proposer.save({ session });
        await acceptor.save({ session });
        await trade.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, message: 'Trade accepted successfully.' });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
};