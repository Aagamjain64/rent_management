const express = require('express');
const { protect } = require('../middleware/auth');
const { login, me, changePin, forgotPin } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/forgot-pin', forgotPin);
router.get('/me', protect, me);
router.post('/change-pin', protect, changePin);

module.exports = router;
