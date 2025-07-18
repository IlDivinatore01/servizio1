const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sticker = require('../models/Sticker');
const StickerPack = require('../models/StickerPack');
const { fetchCharactersFromAPI } = require('../utils/apiFetcher');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to DB
const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}`;
mongoose.connect(mongoURI);

console.log('MONGO_USER:', process.env.MONGO_USER);
console.log('MONGO_CLUSTER:', process.env.MONGO_CLUSTER);

const importData = async () => {
    try {
        console.log('--- Cleaning previous data ---');
        await Sticker.deleteMany();
        await StickerPack.deleteMany();

        console.log('--- Fetching characters from API ---');
        const stickersToImport = await fetchCharactersFromAPI();
        
        if(stickersToImport.length > 0) {
            await Sticker.insertMany(stickersToImport);
            console.log('Stickers Imported!');
        } else {
            console.log('No stickers to import. Check API fetcher.');
        }

        console.log('--- Creating standard sticker pack ---');
        await StickerPack.create({
            name: 'Standard Pack',
            cost: 1,
            numStickers: 5,
            isSpecialOffer: false,
        });
        console.log('Standard Pack Created!');

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await Sticker.deleteMany();
        await StickerPack.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    deleteData();
} else {
    importData();
}