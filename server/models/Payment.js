const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentType: { type: String, enum: ['rent', 'electricity'], required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'other'],
      default: 'cash'
    },
    paymentDate: { type: Date, required: true },
    notes: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
