const Payment = require('../models/Payment');
const ElectricityBill = require('../models/ElectricityBill');
const { monthRange } = require('./helpers');

async function monthSummary(tenant, year, month) {
  const { start, end } = monthRange(year, month);
  const payments = await Payment.find({
    tenant: tenant._id,
    paymentDate: { $gte: start, $lt: end }
  }).sort({ paymentDate: 1, createdAt: 1 });

  const rentPaid = payments
    .filter((p) => p.paymentType === 'rent')
    .reduce((sum, p) => sum + p.amount, 0);
  const electricityPaid = payments
    .filter((p) => p.paymentType === 'electricity')
    .reduce((sum, p) => sum + p.amount, 0);

  const bill = await ElectricityBill.findOne({ tenant: tenant._id, year, month });
  const lightBill = bill ? bill.amount : 0;
  const monthlyRent = tenant.monthlyRent || 0;
  const remainingRent = Math.max(0, monthlyRent - rentPaid);
  const remainingElectricity = Math.max(0, lightBill - electricityPaid);

  // Pichle mahino ka baaki (carry-forward): tenant ke pehle mahine se is mahine tak
  const created = new Date(tenant.startDate || tenant.createdAt || start);
  const monthsBefore = Math.max(
    0,
    (year - created.getFullYear()) * 12 + (month - 1 - created.getMonth())
  );
  const started = (year - created.getFullYear()) * 12 + (month - 1 - created.getMonth()) >= 0;
  const opening = started ? tenant.openingBalance || 0 : 0;
  const allBills = await ElectricityBill.find({ tenant: tenant._id });
  const billsBefore = allBills
    .filter((b) => b.year * 12 + b.month < year * 12 + month)
    .reduce((sum, b) => sum + b.amount, 0);
  const paidBeforeAgg = await Payment.aggregate([
    { $match: { tenant: tenant._id, paymentDate: { $lt: start } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const paidBefore = paidBeforeAgg[0]?.total || 0;
  const chargedBefore = monthsBefore * monthlyRent + billsBefore + opening;
  const previousDue = Math.max(0, chargedBefore - paidBefore);
  const totalDue = Math.max(
    0,
    chargedBefore + monthlyRent + lightBill - paidBefore - (rentPaid + electricityPaid)
  );

  return {
    year,
    month,
    monthlyRent,
    rentPaid,
    remainingRent,
    lightBill,
    electricityPaid,
    remainingElectricity,
    remainingMonth: remainingRent + remainingElectricity,
    previousDue,
    totalPaid: rentPaid + electricityPaid,
    totalDue,
    payments
  };
}

module.exports = { monthSummary };
