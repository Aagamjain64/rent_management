const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function hashPin(pin) {
  return bcrypt.hash(String(pin), 10);
}

async function verifyPin(pin, pinHash) {
  return bcrypt.compare(String(pin), pinHash);
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, userId: user.userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function isValidPin(pin) {
  return /^\d{4,6}$/.test(String(pin || ''));
}

async function ensureAdmin() {
  const userId = (process.env.ADMIN_USER_ID || 'ADMIN001').toUpperCase();
  const existing = await User.findOne({ userId });
  if (existing) return;
  const pinHash = await hashPin(process.env.ADMIN_PIN || '1234');
  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    userId,
    pinHash,
    role: 'admin',
    mobileNumber: '',
    profileCompleted: true
  });
  console.log(`Default admin created: ${userId}`);
}

module.exports = { hashPin, verifyPin, signToken, isValidPin, ensureAdmin };
