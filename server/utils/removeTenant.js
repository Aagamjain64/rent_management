const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const ElectricityBill = require('../models/ElectricityBill');
const PinResetRequest = require('../models/PinResetRequest');

// Tenant, uska login, payments, light bills aur PIN requests sab hata deta hai
async function removeTenant(tenant) {
  await Payment.deleteMany({ tenant: tenant._id });
  await ElectricityBill.deleteMany({ tenant: tenant._id });
  await PinResetRequest.deleteMany({ user: tenant.user });
  await User.deleteOne({ _id: tenant.user, role: 'tenant' });
  await Tenant.deleteOne({ _id: tenant._id });
}

module.exports = { removeTenant };
