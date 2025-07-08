require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const path = require('path');

const dbUser = process.env.MONGO_USER;
const dbPass = process.env.MONGO_PASSWORD;
const dbCluster = process.env.MONGO_CLUSTER;
const dbName = 'hp';

const mongoUri = `mongodb+srv://${dbUser}:${dbPass}@${dbCluster}${dbName}?retryWrites=true&w=majority`;

// Models
const User = require('../models/User');
const Sticker = require('../models/Sticker');

async function processUserStickers(user) {
  let changed = false;
  const missing = [];
  for (const owned of user.ownedStickers) {
    if (!owned.sticker && owned.characterId) {
      const stickerDoc = await Sticker.findOne({ characterId: owned.characterId });
      if (stickerDoc) {
        owned.sticker = stickerDoc._id;
        changed = true;
      } else {
        missing.push(owned.characterId);
        owned.sticker = undefined;
      }
    }
  }
  if (missing.length > 0) {
    console.log(`User ${user.username} missing stickers for characterIds:`, missing);
  }
  // Remove any ownedStickers where sticker is still null/undefined
  const before = user.ownedStickers.length;
  user.ownedStickers = user.ownedStickers.filter(os => os.sticker);
  const after = user.ownedStickers.length;
  if (changed || before !== after) {
    await user.save();
    console.log(`Updated user ${user.username} (${user._id}): ${before} -> ${after} stickers`);
    return true;
  }
  return false;
}

async function migrateUserStickers() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const users = await User.find({});
  const stickers = await Sticker.find({});
  console.log(`Found ${users.length} users, ${stickers.length} stickers.`);
  console.log('Example sticker characterIds:', stickers.slice(0, 5).map(s => s.characterId));
  if (users.length > 0) {
    const ownedIds = users[0].ownedStickers.map(os => os.characterId);
    console.log('Example user ownedStickers characterIds:', ownedIds.slice(0, 5));
  }

  let totalUpdated = 0;
  for (const user of users) {
    if (await processUserStickers(user)) {
      totalUpdated++;
    }
  }
  console.log(`Migration complete. Users updated: ${totalUpdated}`);
  await mongoose.disconnect();
}

migrateUserStickers().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
