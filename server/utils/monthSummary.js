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

  // Pichle mahino ka baaki: hisaab billingStart wale mahine se shuru hota hai
  // (jab tenant app me add hua ya opening balance last set hua). Usse pehle ka sab
  // opening balance me hi shamil hai.
  const created = new Date(tenant.billingStart || tenant.createdAt || start);
  const billingMonthStart = new Date(created.getFullYear(), created.getMonth(), 1);
  const billingIdx = created.getFullYear() * 12 + created.getMonth() + 1;
  const selectedIdx = year * 12 + month;
  const monthsBefore = Math.max(0, selectedIdx - billingIdx);
  const opening = selectedIdx >= billingIdx ? tenant.openingBalance || 0 : 0;
  const allBills = await ElectricityBill.find({ tenant: tenant._id });
  const billsBefore = allBills
    .filter((b) => b.year * 12 + b.month >= billingIdx && b.year * 12 + b.month < selectedIdx)
    .reduce((sum, b) => sum + b.amount, 0);
  const paidBeforeAgg = await Payment.aggregate([
    {
      $match: {
        tenant: tenant._id,
        paymentDate: { $gte: billingMonthStart, $lt: start }
      }
    },
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
