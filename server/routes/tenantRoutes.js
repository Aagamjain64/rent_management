const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { dashboard, getProfile, setupProfile, history } = require('../controllers/tenantController');

const router = express.Router();
router.use(protect, authorize('tenant'));

router.get('/dashboard', dashboard);
router.get('/profile', getProfile);
router.post('/profile', setupProfile);
router.get('/history', history);

module.exports = router;
