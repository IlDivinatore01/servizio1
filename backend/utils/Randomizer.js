const Sticker = require('../models/Sticker');

// @desc    Get N random stickers from the database
// @param   count - The number of random stickers to retrieve
const getRandomStickers = async (count) => {
    try {
        // This is a simple way to get random documents.
        // For very large collections, this can be inefficient.
        const randomStickers = await Sticker.aggregate([
            { $sample: { size: count } }
        ]);
        return randomStickers;
    } catch (error) {
        console.error("Error fetching random stickers:", error);
        return [];
    }
};

module.exports = { getRandomStickers };