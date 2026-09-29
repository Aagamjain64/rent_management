const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createTenant,
  deleteTenant,
  updateTenant,
  getProfile,
  setupProfile,
  dashboard,
  getTenant,
  addPayment,
  updatePayment,
  upsertElectricity
} = require('../controllers/ownerController');

const router = express.Router();
router.use(protect, authorize('owner'));

router.get('/profile', getProfile);
router.post('/profile', setupProfile);
router.get('/dashboard', dashboard);
router.post('/tenants', createTenant);
router.get('/tenants/:id', getTenant);
router.put('/tenants/:id', updateTenant);
router.delete('/tenants/:id', deleteTenant);
router.post('/tenants/:id/payments', addPayment);
router.put('/payments/:paymentId', updatePayment);
router.put('/tenants/:id/electricity', upsertElectricity);

module.exports = router;
