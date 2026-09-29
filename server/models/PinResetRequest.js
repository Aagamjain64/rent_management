const mongoose = require('mongoose');

const pinResetRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: String, required: true, uppercase: true },
    status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PinResetRequest', pinResetRequestSchema);
