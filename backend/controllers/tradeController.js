const TradeOffer = require('../models/TradeOffer');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to validate proposer's items
const validateStickerItem = (user, item) => {
    const ownedSticker = user.ownedStickers.find(s => s.sticker._id.equals(item.sticker));
    if (!ownedSticker) {
        return 'Validation failed: You do not own the sticker you are offering.';
    }
    if (ownedSticker.quantity < (item.quantity || 1)) {
        return 'Validation failed: Not enough quantity for the offered sticker.';
    }
    // Allow trading last copy (frontend will warn)
    // if (ownedSticker.quantity <= 1) {
    //     return 'Validation failed: You cannot trade your last copy of a sticker.';
    // }
    return null;
};

const validateCreditItem = (user, item) => {
    if (user.credits < item.amount) {
        return 'Validation failed: Insufficient credits.';
    }
    return null;
};

const validateProposerItems = (user, proposerItems) => {
    for (const item of proposerItems) {
        let error = null;
        if (item.sticker) {
            error = validateStickerItem(user, item);
        } else if (item.isCredit) {
            error = validateCreditItem(user, item);
        }

        if (error) {
            return error;
        }
    }
    return null; // No error
};

// Helper function to validate requested items
// (Allow requesting stickers the user already owns; frontend will warn and confirm)
const validateRequestedItems = (user, requestedItems) => {
    // No validation: allow requesting duplicates
    return null;
};

// @desc    Create a trade offer
// @route   POST /api/trades
// @access  Private
exports.createTrade = async (req, res, next) => {
    const { proposerItems, requestedItems } = req.body;
    const proposerId = req.user.id;

    try {
        const user = await User.findById(proposerId).populate('ownedStickers.sticker');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const proposerValidationError = validateProposerItems(user, proposerItems);
        if (proposerValidationError) {
            return res.status(400).json({ success: false, message: proposerValidationError });
        }

        const requestedValidationError = validateRequestedItems(user, requestedItems);
        if (requestedValidationError) {
            return res.status(400).json({ success: false, message: requestedValidationError });
        }

        const trade = await TradeOffer.create({
            proposerId,
            proposerItems,
            requestedItems,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: trade });
    } catch (err) {
        console.error('Error creating trade:', err);
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
        if (item.sticker) { // Use item.sticker to match the schema
            const owned = user.ownedStickers.find(s => s.sticker.equals(item.sticker));
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
        if (item.sticker) { // Use item.sticker to match the schema
            // Remove from fromUser
            let stickerInFrom = fromUser.ownedStickers.find(s => s.sticker.equals(item.sticker));
            stickerInFrom.quantity -= item.quantity;
            // Add to toUser
            let stickerInTo = toUser.ownedStickers.find(s => s.sticker.equals(item.sticker));
            if (stickerInTo) {
                stickerInTo.quantity += item.quantity;
            } else {
                const stickerData = await mongoose.model('Sticker').findById(item.sticker).lean();
                toUser.ownedStickers.push({ sticker: item.sticker, characterId: stickerData.characterId, quantity: item.quantity });
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

        // Integrity check for proposer (prevents double-spending)
        const proposerCheck = await hasRequiredItems(proposer, trade.proposerItems);
        if (!proposerCheck.success) {
            // Mark trade as cancelled (invalid)
            trade.status = 'cancelled';
            await trade.save({ session });
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Trade invalid: proposer no longer owns the required sticker(s) or credits.' });
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

// @desc    Cancel a trade offer
// @route   DELETE /api/trades/:id
// @access  Private
exports.cancelTrade = async (req, res, next) => {
    try {
        const trade = await TradeOffer.findById(req.params.id);

        if (!trade) {
            return res.status(404).json({ success: false, message: 'Trade not found.' });
        }

        // Make sure the user is the one who proposed the trade
        if (trade.proposerId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to cancel this trade.' });
        }

        // Can only cancel pending trades
        if (trade.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot cancel a trade that is already ${trade.status}.` });
        }

        trade.status = 'cancelled';
        await trade.save();

        res.status(200).json({ success: true, message: 'Trade cancelled successfully.' });
    } catch (err) {
        next(err);
    }
};