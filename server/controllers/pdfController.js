const Tenant = require('../models/Tenant');
const { currentMonthYear } = require('../utils/helpers');
const { monthSummary } = require('../utils/monthSummary');
const { writeHistoryPdf } = require('../utils/pdf');

async function ownerPdf(req, res) {
  const tenant = await Tenant.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('user', 'name')
    .populate('owner', 'name');
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  const month = Number(req.query.month) || currentMonthYear().month;
  const year = Number(req.query.year) || currentMonthYear().year;
  const summary = await monthSummary(tenant, year, month);
  writeHistoryPdf(res, {
    tenantName: tenant.user.name,
    ownerName: req.user.name,
    roomNumber: tenant.roomNumber,
    month,
    year,
    monthlyRent: summary.monthlyRent,
    lightBill: summary.lightBill,
    totalPaid: summary.totalPaid,
    remainingRent: summary.remainingRent,
    previousDue: summary.previousDue,
    electricityPaid: summary.electricityPaid,
    remainingElectricity: summary.remainingElectricity,
    totalDue: summary.totalDue,
    payments: summary.payments
  });
}

async function tenantPdf(req, res) {
  const tenant = await Tenant.findOne({ user: req.user._id })
    .populate('user', 'name')
    .populate('owner', 'name');
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  const month = Number(req.query.month) || currentMonthYear().month;
  const year = Number(req.query.year) || currentMonthYear().year;
  const summary = await monthSummary(tenant, year, month);
  writeHistoryPdf(res, {
    tenantName: tenant.user.name,
    ownerName: tenant.owner?.name || '—',
    roomNumber: tenant.roomNumber,
    month,
    year,
    monthlyRent: summary.monthlyRent,
    lightBill: summary.lightBill,
    totalPaid: summary.totalPaid,
    remainingRent: summary.remainingRent,
    previousDue: summary.previousDue,
    electricityPaid: summary.electricityPaid,
    remainingElectricity: summary.remainingElectricity,
    totalDue: summary.totalDue,
    payments: summary.payments
  });
}

module.exports = { ownerPdf, tenantPdf };
