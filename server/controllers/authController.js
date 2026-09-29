const User = require('../models/User');
const PinResetRequest = require('../models/PinResetRequest');
const { hashPin, verifyPin, signToken, isValidPin } = require('../utils/ensureAdmin');
const { publicUser } = require('../utils/helpers');

async function login(req, res) {
  const userId = String(req.body.userId || '').trim().toUpperCase();
  const pin = String(req.body.pin || '');
  const role = String(req.body.role || '').trim().toLowerCase();
  if (!userId || !pin) {
    return res.status(400).json({ message: 'User ID and PIN are required' });
  }
  if (!['admin', 'owner', 'tenant'].includes(role)) {
    return res.status(400).json({ message: 'Select a role first' });
  }
  const user = await User.findOne({ userId });
  if (!user || !(await verifyPin(pin, user.pinHash))) {
    return res.status(401).json({ message: 'Invalid User ID or PIN' });
  }
  if (user.role !== 'admin' && user.role !== role) {
    return res.status(403).json({ message: 'ROLE_MISMATCH' });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
}

async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

async function changePin(req, res) {
  const { currentPin, newPin, confirmPin } = req.body;
  if (!isValidPin(newPin)) {
    return res.status(400).json({ message: 'PIN must be 4 to 6 digits' });
  }
  if (newPin !== confirmPin) {
    return res.status(400).json({ message: 'New PIN and confirm PIN do not match' });
  }
  const user = await User.findById(req.user._id);
  if (!(await verifyPin(currentPin, user.pinHash))) {
    return res.status(400).json({ message: 'Current PIN is incorrect' });
  }
  user.pinHash = await hashPin(newPin);
  await user.save();
  res.json({ message: 'PIN updated' });
}

async function forgotPin(req, res) {
  const userId = String(req.body.userId || '').trim().toUpperCase();
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  const user = await User.findOne({ userId });
  if (!user) {
    return res.json({ message: 'If this User ID exists, a reset request was created' });
  }
  const existing = await PinResetRequest.findOne({ user: user._id, status: 'pending' });
  if (!existing) {
    await PinResetRequest.create({ user: user._id, userId: user.userId, status: 'pending' });
  }
  res.json({ message: 'If this User ID exists, a reset request was created' });
}

module.exports = { login, me, changePin, forgotPin };
