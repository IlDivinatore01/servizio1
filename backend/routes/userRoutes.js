const express = require('express');
const {
    getMe,
    updateDetails,
    deleteMe,
    purchaseCredits
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// The 'protect' middleware is applied to all routes in this file
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.delete('/me', deleteMe);
router.post('/credits/purchase', purchaseCredits);

// Make sure this line is at the end of the file
module.exports = router;