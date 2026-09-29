require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Tenant = require('./models/Tenant');
const Payment = require('./models/Payment');
const ElectricityBill = require('./models/ElectricityBill');
const { hashPin } = require('./utils/ensureAdmin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const pinHash = await hashPin('1234');

  let admin = await User.findOne({ userId: 'ADMIN001' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      userId: 'ADMIN001',
      pinHash,
      role: 'admin',
      profileCompleted: true
    });
  }

  let owner = await User.findOne({ userId: 'OWNER001' });
  if (!owner) {
    owner = await User.create({
      name: 'Ramesh Malik',
      userId: 'OWNER001',
      pinHash,
      role: 'owner',
      mobileNumber: '9876543210',
      propertyName: 'Green Residency',
      address: 'Station Road, Ward 4',
      profileCompleted: true
    });
  } else {
    owner.propertyName = owner.propertyName || 'Green Residency';
    owner.address = owner.address || 'Station Road, Ward 4';
    owner.profileCompleted = true;
    await owner.save();
  }

  let tenantUser = await User.findOne({ userId: 'TENANT001' });
  if (!tenantUser) {
    tenantUser = await User.create({
      name: 'Rahul',
      userId: 'TENANT001',
      pinHash,
      role: 'tenant',
      mobileNumber: '9123456789',
      profileCompleted: true
    });
  }

  let tenant = await Tenant.findOne({ user: tenantUser._id });
  if (!tenant) {
    tenant = await Tenant.create({
      user: tenantUser._id,
      owner: owner._id,
      roomNumber: '204',
      governmentIdType: 'aadhaar',
      governmentIdNumber: '123456789012',
      monthlyRent: 8000,
      profileCompleted: true
    });
  }

  let amitUser = await User.findOne({ userId: 'TENANT002' });
  if (!amitUser) {
    amitUser = await User.create({
      name: 'Amit',
      userId: 'TENANT002',
      pinHash,
      role: 'tenant',
      mobileNumber: '9988776655',
      profileCompleted: true
    });
  }
  let amit = await Tenant.findOne({ user: amitUser._id });
  if (!amit) {
    amit = await Tenant.create({
      user: amitUser._id,
      owner: owner._id,
      roomNumber: '105',
      governmentIdType: 'pan',
      governmentIdNumber: 'ABCDE1234F',
      monthlyRent: 7000,
      profileCompleted: true
    });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if ((await Payment.countDocuments({ tenant: tenant._id })) === 0) {
    await Payment.create([
      {
        tenant: tenant._id,
        owner: owner._id,
        amount: 3000,
        paymentType: 'rent',
        paymentMethod: 'upi',
        paymentDate: new Date(year, month, 5),
        notes: 'First installment'
      },
      {
        tenant: tenant._id,
        owner: owner._id,
        amount: 2000,
        paymentType: 'rent',
        paymentMethod: 'cash',
        paymentDate: new Date(year, month, 15),
        notes: 'Second installment'
      }
    ]);
  }

  if ((await Payment.countDocuments({ tenant: amit._id })) === 0) {
    await Payment.create({
      tenant: amit._id,
      owner: owner._id,
      amount: 7000,
      paymentType: 'rent',
      paymentMethod: 'bank_transfer',
      paymentDate: new Date(year, month, 3),
      notes: 'Full rent'
    });
  }

  await ElectricityBill.findOneAndUpdate(
    { tenant: tenant._id, month: month + 1, year },
    { tenant: tenant._id, owner: owner._id, month: month + 1, year, amount: 800 },
    { upsert: true }
  );
  await ElectricityBill.findOneAndUpdate(
    { tenant: amit._id, month: month + 1, year },
    { tenant: amit._id, owner: owner._id, month: month + 1, year, amount: 600 },
    { upsert: true }
  );

  console.log('Seed complete. Demo logins (PIN 1234): ADMIN001, OWNER001, TENANT001, TENANT002');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
