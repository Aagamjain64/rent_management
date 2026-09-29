const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  removeOwner,
  removeTenantByAdmin,
  listOwners,
  createOwner,
  updateOwner,
  listTenants,
  createTenant,
  updateTenant,
  resetPin,
  listResetRequests,
  rejectReset,
  paymentsOverview
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/owners', listOwners);
router.post('/owners', createOwner);
router.put('/owners/:id', updateOwner);
router.delete('/owners/:id', removeOwner);
router.delete('/tenants/:id', removeTenantByAdmin);
router.get('/tenants', listTenants);
router.post('/tenants', createTenant);
router.put('/tenants/:id', updateTenant);
router.post('/reset-pin', resetPin);
router.get('/pin-requests', listResetRequests);
router.post('/pin-requests/:id/reject', rejectReset);
router.get('/payments', paymentsOverview);

module.exports = router;
