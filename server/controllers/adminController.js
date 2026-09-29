const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const PinResetRequest = require('../models/PinResetRequest');
const { hashPin, isValidPin } = require('../utils/ensureAdmin');
const { publicUser, currentMonthYear } = require('../utils/helpers');
const { monthSummary } = require('../utils/monthSummary');
const { removeTenant } = require('../utils/removeTenant');

async function listOwners(_req, res) {
  const owners = await User.find({ role: 'owner' }).select('-pinHash').sort({ createdAt: -1 });
  res.json({ owners: owners.map(publicUser) });
}

async function createOwner(req, res) {
  const { name, userId, pin, mobileNumber } = req.body;
  if (!name || !userId || !pin) {
    return res.status(400).json({ message: 'Name, User ID and PIN are required' });
  }
  if (!isValidPin(pin)) {
    return res.status(400).json({ message: 'PIN must be 4 to 6 digits' });
  }
  const id = String(userId).trim().toUpperCase();
  if (await User.findOne({ userId: id })) {
    return res.status(400).json({ message: 'User ID already exists' });
  }
  const owner = await User.create({
    name: name.trim(),
    userId: id,
    pinHash: await hashPin(pin),
    role: 'owner',
    mobileNumber: String(mobileNumber || '').trim(),
    profileCompleted: false
  });
  res.status(201).json({ owner: publicUser(owner) });
}

async function updateOwner(req, res) {
  const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
  if (!owner) return res.status(404).json({ message: 'Owner not found' });
  if (req.body.name) owner.name = req.body.name.trim();
  if (req.body.mobileNumber !== undefined) owner.mobileNumber = String(req.body.mobileNumber).trim();
  await owner.save();
  res.json({ owner: publicUser(owner) });
}

async function listTenants(_req, res) {
  const tenants = await Tenant.find()
    .populate('user', 'name userId mobileNumber role createdAt')
    .populate('owner', 'name userId mobileNumber')
    .sort({ createdAt: -1 });
  res.json({ tenants });
}

async function createTenant(req, res) {
  const { name, userId, pin, mobileNumber, ownerId, roomNumber, monthlyRent } = req.body;
  if (!name || !userId || !pin || !ownerId) {
    return res.status(400).json({ message: 'Name, User ID, PIN and owner are required' });
  }
  if (!isValidPin(pin)) {
    return res.status(400).json({ message: 'PIN must be 4 to 6 digits' });
  }
  const owner = await User.findOne({ _id: ownerId, role: 'owner' });
  if (!owner) return res.status(400).json({ message: 'Owner not found' });
  const id = String(userId).trim().toUpperCase();
  if (await User.findOne({ userId: id })) {
    return res.status(400).json({ message: 'User ID already exists' });
  }
  const user = await User.create({
    name: name.trim(),
    userId: id,
    pinHash: await hashPin(pin),
    role: 'tenant',
    mobileNumber: String(mobileNumber || '').trim(),
    profileCompleted: false
  });
  const tenant = await Tenant.create({
    user: user._id,
    owner: owner._id,
    roomNumber: String(roomNumber || '').trim(),
    monthlyRent: Number(monthlyRent) > 0 ? Number(monthlyRent) : 0
  });
  const populated = await Tenant.findById(tenant._id)
    .populate('user', 'name userId mobileNumber role')
    .populate('owner', 'name userId');
  res.status(201).json({ tenant: populated });
}

async function updateTenant(req, res) {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  if (req.body.ownerId) {
    const owner = await User.findOne({ _id: req.body.ownerId, role: 'owner' });
    if (!owner) return res.status(400).json({ message: 'Owner not found' });
    tenant.owner = owner._id;
    await tenant.save();
  }
  if (req.body.name || req.body.mobileNumber !== undefined) {
    const user = await User.findById(tenant.user);
    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.mobileNumber !== undefined) user.mobileNumber = String(req.body.mobileNumber).trim();
    await user.save();
  }
  const populated = await Tenant.findById(tenant._id)
    .populate('user', 'name userId mobileNumber role')
    .populate('owner', 'name userId');
  res.json({ tenant: populated });
}

async function removeOwner(req, res) {
  const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
  if (!owner) return res.status(404).json({ message: 'Owner not found' });
  if (await Tenant.exists({ owner: owner._id })) {
    return res.status(400).json({ message: 'OWNER_HAS_TENANTS' });
  }
  await PinResetRequest.deleteMany({ user: owner._id });
  await User.deleteOne({ _id: owner._id });
  res.json({ message: 'Owner removed' });
}

async function removeTenantByAdmin(req, res) {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  await removeTenant(tenant);
  res.json({ message: 'Tenant removed' });
}

async function resetPin(req, res) {
  const { userId, newPin, confirmPin, requestId } = req.body;
  if (!isValidPin(newPin)) {
    return res.status(400).json({ message: 'PIN must be 4 to 6 digits' });
  }
  if (newPin !== confirmPin) {
    return res.status(400).json({ message: 'New PIN and confirm PIN do not match' });
  }
  const user = await User.findOne({ userId: String(userId || '').trim().toUpperCase() });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.pinHash = await hashPin(newPin);
  await user.save();
  if (requestId) {
    await PinResetRequest.findByIdAndUpdate(requestId, { status: 'resolved' });
  } else {
    await PinResetRequest.updateMany({ user: user._id, status: 'pending' }, { status: 'resolved' });
  }
  res.json({ message: 'PIN reset successfully' });
}

async function listResetRequests(_req, res) {
  const requests = await PinResetRequest.find()
    .populate('user', 'name userId role')
    .sort({ createdAt: -1 });
  res.json({ requests });
}

async function rejectReset(req, res) {
  const request = await PinResetRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  );
  if (!request) return res.status(404).json({ message: 'Request not found' });
  res.json({ request });
}

async function paymentsOverview(_req, res) {
  const { month, year } = currentMonthYear();
  const tenants = await Tenant.find()
    .populate('user', 'name userId')
    .populate('owner', 'name userId');
  const rows = [];
  for (const tenant of tenants) {
    const summary = await monthSummary(tenant, year, month);
    rows.push({
      tenantId: tenant._id,
      tenantName: tenant.user?.name,
      ownerName: tenant.owner?.name,
      roomNumber: tenant.roomNumber,
      monthlyRent: summary.monthlyRent,
      rentPaid: summary.rentPaid,
      remainingRent: summary.remainingRent,
      previousDue: summary.previousDue,
      remainingMonth: summary.remainingMonth,
      remainingElectricity: summary.remainingElectricity,
      totalPaid: summary.totalPaid,
      lightBill: summary.lightBill,
      totalDue: summary.totalDue
    });
  }
  const recentPayments = await Payment.find()
    .populate({ path: 'tenant', populate: { path: 'user', select: 'name' } })
    .sort({ paymentDate: -1 })
    .limit(20);
  res.json({ month, year, rows, recentPayments });
}

module.exports = {
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
};
