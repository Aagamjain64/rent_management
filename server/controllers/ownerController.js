const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const ElectricityBill = require('../models/ElectricityBill');
const User = require('../models/User');
const { hashPin, isValidPin } = require('../utils/ensureAdmin');
const { removeTenant } = require('../utils/removeTenant');
const { currentMonthYear, maskGovernmentId, maskMobile, publicUser } = require('../utils/helpers');
const { monthSummary } = require('../utils/monthSummary');

function tenantCard(tenant, summary) {
  return {
    tenantId: tenant._id,
    userId: tenant.user?.userId,
    name: tenant.user?.name,
    mobileMasked: maskMobile(tenant.user?.mobileNumber),
    roomNumber: tenant.roomNumber,
    governmentIdType: tenant.governmentIdType,
    governmentIdMasked: maskGovernmentId(tenant.governmentIdType, tenant.governmentIdNumber),
    monthlyRent: tenant.monthlyRent || summary.monthlyRent,
    rentPaid: summary.rentPaid,
    remainingRent: summary.remainingRent,
    previousDue: summary.previousDue,
    remainingMonth: summary.remainingMonth,
    remainingElectricity: summary.remainingElectricity,
    startDate: tenant.startDate,
    openingBalance: tenant.openingBalance || 0,
    lightBill: summary.lightBill,
    electricityPaid: summary.electricityPaid,
    totalPaid: summary.totalPaid,
    totalDue: summary.totalDue,
    profileCompleted: tenant.profileCompleted
  };
}

async function getProfile(req, res) {
  const user = await User.findById(req.user._id);
  res.json({
    profileCompleted: Boolean(user.profileCompleted),
    name: user.name,
    mobileNumber: user.mobileNumber,
    propertyName: user.propertyName || '',
    address: user.address || ''
  });
}

async function setupProfile(req, res) {
  const user = await User.findById(req.user._id);
  if (user.profileCompleted) {
    return res.status(400).json({ message: 'Profile is already completed' });
  }
  const { fullName, mobileNumber, propertyName, address } = req.body;
  if (!fullName || !mobileNumber || !propertyName || !address) {
    return res.status(400).json({ message: 'All profile fields are required' });
  }
  if (!/^[6-9]\d{9}$/.test(String(mobileNumber).replace(/\s/g, ''))) {
    return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
  }
  user.name = String(fullName).trim();
  user.mobileNumber = String(mobileNumber).replace(/\s/g, '');
  user.propertyName = String(propertyName).trim();
  user.address = String(address).trim();
  user.profileCompleted = true;
  await user.save();
  res.json({ message: 'Profile saved', user: publicUser(user) });
}

async function dashboard(req, res) {
  const month = Number(req.query.month) || currentMonthYear().month;
  const year = Number(req.query.year) || currentMonthYear().year;
  const tenants = await Tenant.find({ owner: req.user._id }).populate(
    'user',
    'name userId mobileNumber'
  );
  const rows = [];
  for (const tenant of tenants) {
    const summary = await monthSummary(tenant, year, month);
    rows.push(tenantCard(tenant, summary));
  }
  const owner = await User.findById(req.user._id);
  res.json({
    month,
    year,
    profileCompleted: Boolean(owner.profileCompleted),
    owner: publicUser(owner),
    tenants: rows
  });
}

async function getTenant(req, res) {
  const tenant = await Tenant.findOne({ _id: req.params.id, owner: req.user._id }).populate(
    'user',
    'name userId mobileNumber'
  );
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  const month = Number(req.query.month) || currentMonthYear().month;
  const year = Number(req.query.year) || currentMonthYear().year;
  const summary = await monthSummary(tenant, year, month);
  const history = await Payment.find({ tenant: tenant._id }).sort({ paymentDate: -1, createdAt: -1 });
  res.json({
    tenant: {
      ...tenantCard(tenant, summary),
      ownerName: req.user.name
    },
    summary,
    payments: history
  });
}

async function addPayment(req, res) {
  const tenant = await Tenant.findOne({ _id: req.params.id, owner: req.user._id });
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  const { amount, paymentDate, paymentMethod, paymentType, notes } = req.body;
  const value = Number(amount);
  if (!value || value <= 0) {
    return res.status(400).json({ message: 'Enter a valid amount' });
  }
  if (!['rent', 'electricity'].includes(paymentType)) {
    return res.status(400).json({ message: 'Payment type must be rent or electricity' });
  }
  const methods = ['cash', 'upi', 'bank_transfer', 'other'];
  if (paymentMethod && !methods.includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }
  const payment = await Payment.create({
    tenant: tenant._id,
    owner: req.user._id,
    amount: value,
    paymentType,
    paymentMethod: paymentMethod || 'cash',
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    notes: String(notes || '').trim()
  });
  res.status(201).json({ payment });
}

async function updatePayment(req, res) {
  const payment = await Payment.findOne({ _id: req.params.paymentId, owner: req.user._id });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  if (req.body.amount !== undefined) {
    const value = Number(req.body.amount);
    if (!value || value <= 0) return res.status(400).json({ message: 'Enter a valid amount' });
    payment.amount = value;
  }
  if (req.body.paymentDate) payment.paymentDate = new Date(req.body.paymentDate);
  if (req.body.paymentMethod) payment.paymentMethod = req.body.paymentMethod;
  if (req.body.paymentType) payment.paymentType = req.body.paymentType;
  if (req.body.notes !== undefined) payment.notes = String(req.body.notes).trim();
  await payment.save();
  res.json({ payment });
}

async function upsertElectricity(req, res) {
  const tenant = await Tenant.findOne({ _id: req.params.id, owner: req.user._id });
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  const month = Number(req.body.month) || currentMonthYear().month;
  const year = Number(req.body.year) || currentMonthYear().year;
  const amount = Number(req.body.amount);
  if (Number.isNaN(amount) || amount < 0) {
    return res.status(400).json({ message: 'Enter a valid electricity amount' });
  }
  const bill = await ElectricityBill.findOneAndUpdate(
    { tenant: tenant._id, month, year },
    { tenant: tenant._id, owner: req.user._id, month, year, amount },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ bill });
}

async function createTenant(req, res) {
  const { name, userId, pin, mobileNumber, roomNumber, monthlyRent, startDate, openingBalance } =
    req.body;
  if (!name || !userId || !pin) {
    return res.status(400).json({ message: 'Name, User ID and PIN are required' });
  }
  if (!isValidPin(pin)) return res.status(400).json({ message: 'PIN must be 4 to 6 digits' });
  const rent = Number(monthlyRent);
  if (!rent || rent <= 0) return res.status(400).json({ message: 'Enter a valid monthly rent' });
  const id = String(userId).trim().toUpperCase();
  if (await User.findOne({ userId: id })) {
    return res.status(400).json({ message: 'User ID already exists' });
  }
  const user = await User.create({
    name: String(name).trim(),
    userId: id,
    pinHash: await hashPin(pin),
    role: 'tenant',
    mobileNumber: String(mobileNumber || '').trim()
  });
  const tenant = await Tenant.create({
    user: user._id,
    owner: req.user._id,
    roomNumber: String(roomNumber || '').trim(),
    monthlyRent: rent,
    startDate: startDate ? new Date(startDate) : new Date(),
    openingBalance: Number(openingBalance) > 0 ? Number(openingBalance) : 0
  });
  res.status(201).json({ tenantId: tenant._id });
}

async function deleteTenant(req, res) {
  const tenant = await Tenant.findOne({ _id: req.params.id, owner: req.user._id });
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  await removeTenant(tenant);
  res.json({ message: 'Tenant removed' });
}

async function updateTenant(req, res) {
  const tenant = await Tenant.findOne({ _id: req.params.id, owner: req.user._id });
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  const { roomNumber, monthlyRent, startDate, openingBalance } = req.body;
  if (monthlyRent !== undefined) {
    const rent = Number(monthlyRent);
    if (!rent || rent <= 0) return res.status(400).json({ message: 'Enter a valid monthly rent' });
    tenant.monthlyRent = rent;
  }
  if (roomNumber !== undefined) tenant.roomNumber = String(roomNumber).trim();
  if (startDate) tenant.startDate = new Date(startDate);
  if (openingBalance !== undefined) {
    const ob = Number(openingBalance);
    if (Number.isNaN(ob) || ob < 0) return res.status(400).json({ message: 'Enter a valid balance' });
    tenant.openingBalance = ob;
  }
  await tenant.save();
  res.json({ message: 'Saved' });
}

module.exports = {
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
};
