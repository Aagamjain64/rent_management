const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomNumber: { type: String, trim: true, default: '' },
    governmentIdType: {
      type: String,
      enum: ['aadhaar', 'pan', 'driving_licence', 'voter_id', 'passport', 'other', ''],
      default: ''
    },
    governmentIdNumber: { type: String, trim: true, default: '' },
    monthlyRent: { type: Number, default: 0, min: 0 },
    startDate: { type: Date },
    openingBalance: { type: Number, default: 0, min: 0 },
    profileCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', tenantSchema);
