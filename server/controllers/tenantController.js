const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const User = require('../models/User');
const {
  currentMonthYear,
  maskGovernmentId,
  maskMobile,
  validateGovernmentId
} = require('../utils/helpers');
const { monthSummary } = require('../utils/monthSummary');

async function getMyTenant(userId) {
  return Tenant.findOne({ user: userId }).populate('user', 'name userId mobileNumber').populate(
    'owner',
    'name userId'
  );
}

async function dashboard(req, res) {
  const tenant = await getMyTenant(req.user._id);
  if (!tenant) return res.status(404).json({ message: 'Tenant profile not found' });
  const month = Number(req.query.month) || currentMonthYear().month;
  const year = Number(req.query.year) || currentMonthYear().year;
  const summary = await monthSummary(tenant, year, month);
  const history = await Payment.find({ tenant: tenant._id })
    .sort({ paymentDate: -1, createdAt: -1 })
    .limit(20);
  res.json({
    profileCompleted: tenant.profileCompleted,
    profile: {
      name: tenant.user.name,
      mobileMasked: maskMobile(tenant.user.mobileNumber),
      roomNumber: tenant.roomNumber,
      governmentIdType: tenant.governmentIdType,
      governmentIdMasked: maskGovernmentId(tenant.governmentIdType, tenant.governmentIdNumber),
      ownerName: tenant.owner?.name
    },
    owner: {
      name: tenant.owner?.name,
      userId: tenant.owner?.userId
    },
    summary: {
      year: summary.year,
      month: summary.month,
      monthlyRent: summary.monthlyRent,
      rentPaid: summary.rentPaid,
      remainingRent: summary.remainingRent,
      previousDue: summary.previousDue,
      remainingElectricity: summary.remainingElectricity,
      remainingMonth: summary.remainingMonth,
      electricityPaid: summary.electricityPaid,
      lightBill: summary.lightBill,
      totalPaid: summary.totalPaid,
      totalDue: summary.totalDue
    },
    payments: history
  });
}

async function getProfile(req, res) {
  const tenant = await getMyTenant(req.user._id);
  if (!tenant) return res.status(404).json({ message: 'Tenant profile not found' });
  res.json({
    profileCompleted: tenant.profileCompleted,
    name: tenant.user.name,
    mobileNumber: tenant.user.mobileNumber,
    roomNumber: tenant.roomNumber,
    governmentIdType: tenant.governmentIdType,
    governmentIdMasked: maskGovernmentId(tenant.governmentIdType, tenant.governmentIdNumber),
    monthlyRent: tenant.monthlyRent
  });
}

async function setupProfile(req, res) {
  const tenant = await getMyTenant(req.user._id);
  if (!tenant) return res.status(404).json({ message: 'Tenant profile not found' });
  if (tenant.profileCompleted) {
    return res.status(400).json({ message: 'Profile is already completed' });
  }
  const { fullName, mobileNumber, governmentIdType, governmentIdNumber } = req.body;
  if (!fullName || !mobileNumber || !governmentIdType || !governmentIdNumber) {
    return res.status(400).json({ message: 'All profile fields are required' });
  }
  if (!/^[6-9]\d{9}$/.test(String(mobileNumber).replace(/\s/g, ''))) {
    return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
  }
  const idError = validateGovernmentId(governmentIdType, governmentIdNumber);
  if (idError) return res.status(400).json({ message: idError });
  const user = await User.findById(req.user._id);
  user.name = fullName.trim();
  user.mobileNumber = String(mobileNumber).replace(/\s/g, '');
  user.profileCompleted = true;
  await user.save();
  tenant.governmentIdType = governmentIdType;
  tenant.governmentIdNumber = String(governmentIdNumber).trim().toUpperCase();
  tenant.profileCompleted = true;
  await tenant.save();
  res.json({ message: 'Profile saved' });
}

async function history(req, res) {
  const tenant = await getMyTenant(req.user._id);
  if (!tenant) return res.status(404).json({ message: 'Tenant profile not found' });
  const payments = await Payment.find({ tenant: tenant._id }).sort({
    paymentDate: -1,
    createdAt: -1
  });
  res.json({ payments });
}

module.exports = { dashboard, getProfile, setupProfile, history };
