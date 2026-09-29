const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { ownerPdf, tenantPdf } = require('../controllers/pdfController');

const router = express.Router();

router.get('/owner/tenants/:id', protect, authorize('owner'), ownerPdf);
router.get('/tenant', protect, authorize('tenant'), tenantPdf);

module.exports = router;
