const mongoose = require('mongoose');

const electricityBillSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

electricityBillSchema.index({ tenant: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('ElectricityBill', electricityBillSchema);
