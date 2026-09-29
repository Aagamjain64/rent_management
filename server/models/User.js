const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    pinHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'owner', 'tenant'], required: true },
    mobileNumber: { type: String, trim: true, default: '' },
    propertyName: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    profileCompleted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('User', userSchema);
