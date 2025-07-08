const express = require('express');
const { createSpecialOffer, createCustomPack, deleteCustomPack } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

// All routes in this file are protected and require admin role
router.use(protect, authorizeAdmin);

router.post('/offers', createSpecialOffer);
router.post('/custom-pack', createCustomPack);
router.delete('/custom-pack/:packId', deleteCustomPack);

// Make sure this line is at the end of the file
module.exports = router;