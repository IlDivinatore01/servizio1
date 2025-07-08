const express = require('express');
const { getCharacterNames } = require('../controllers/characterController');

const router = express.Router();

router.get('/names', getCharacterNames);

module.exports = router;
