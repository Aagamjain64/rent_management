function maskMobile(mobile) {
  const digits = String(mobile || '').replace(/\D/g, '');
  if (digits.length < 2) return '—';
  return `${'X'.repeat(Math.max(0, digits.length - 2))}${digits.slice(-2)}`;
}

function maskGovernmentId(type, value) {
  const raw = String(value || '').replace(/\s/g, '');
  if (!raw) return '—';
  if (type === 'aadhaar') {
    const digits = raw.replace(/\D/g, '');
    const last4 = digits.slice(-4).padStart(4, '0');
    return `XXXX-XXXX-${last4}`;
  }
  if (type === 'pan') {
    const upper = raw.toUpperCase();
    if (upper.length < 4) return 'XXXX';
    return `${'X'.repeat(upper.length - 4)}${upper.slice(-4)}`;
  }
  if (raw.length <= 4) return 'XXXX';
  return `${'X'.repeat(raw.length - 4)}${raw.slice(-4)}`;
}

function validateGovernmentId(type, value) {
  const raw = String(value || '').trim();
  switch (type) {
    case 'aadhaar':
      return /^\d{12}$/.test(raw.replace(/\s/g, '')) ? null : 'Aadhaar must be 12 digits';
    case 'pan':
      return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(raw) ? null : 'PAN must match ABCDE1234F';
    case 'driving_licence':
      return /^[A-Za-z0-9]{8,16}$/.test(raw.replace(/[\s-]/g, ''))
        ? null
        : 'Driving licence must be 8-16 characters';
    case 'voter_id':
      return /^[A-Za-z0-9]{10}$/.test(raw) ? null : 'Voter ID must be 10 characters';
    case 'passport':
      return /^[A-Za-z0-9]{6,9}$/.test(raw) ? null : 'Passport number is invalid';
    case 'other':
      return raw.length >= 4 ? null : 'ID number must be at least 4 characters';
    default:
      return 'Select a government ID type';
  }
}

function monthRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    userId: user.userId,
    role: user.role,
    mobileNumber: user.mobileNumber,
    propertyName: user.propertyName || '',
    address: user.address || '',
    profileCompleted: Boolean(user.profileCompleted || user.role === 'admin'),
    createdAt: user.createdAt
  };
}

module.exports = {
  maskMobile,
  maskGovernmentId,
  validateGovernmentId,
  monthRange,
  currentMonthYear,
  publicUser
};
