import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import { ENV } from '../config/env.js';
import { User } from '../models/User.js';

async function testLogin() {
  console.log('[Test] Connecting to database...');
  await mongoose.connect(ENV.MONGODB_URI);

  const testEmail = 'gokul@localhaat.in';
  const testPassword = 'gokul@1996';

  console.log(`[Test] Looking up admin with email: ${testEmail}...`);
  const user = await User.findOne({
    $or: [
      { email: testEmail.toLowerCase() },
      { phone: testEmail },
    ],
  });

  if (!user) {
    throw new Error(`Admin user with email ${testEmail} not found!`);
  }

  console.log('[Test] Admin found:', {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    kycStatus: user.kycStatus,
  });

  if (user.role !== 'admin') {
    throw new Error(`Expected role 'admin', but got '${user.role}'`);
  }

  if (!user.password) {
    throw new Error('User has no password set!');
  }

  const isPasswordMatch = await bcrypt.compare(testPassword, user.password);
  console.log(`[Test] Verifying password "${testPassword}":`, isPasswordMatch ? 'SUCCESS (MATCH)' : 'FAILED');

  if (!isPasswordMatch) {
    throw new Error('Password mismatch!');
  }

  // Test JWT token generation
  const token = jwt.sign(
    { id: user._id, role: user.role, phone: user.phone },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
  console.log('[Test] JWT Token generated & verified:', {
    id: decoded.id,
    role: decoded.role,
    phone: decoded.phone,
  });

  // Test authController.login endpoint handler
  const { login } = await import('../controllers/authController.js');
  let resStatus = 200;
  let resData: any = {};
  const mockReq: any = {
    body: {
      identifier: 'gokul@localhaat.in',
      password: 'gokul@1996',
    },
  };
  const mockRes: any = {
    status(code: number) {
      resStatus = code;
      return this;
    },
    json(data: any) {
      resData = data;
      return this;
    },
  };

  await login(mockReq, mockRes);
  console.log('[Test] authController.login status:', resStatus);
  console.log('[Test] authController.login success:', resData.success);
  console.log('[Test] authController.login redirectUrl:', resData.redirectUrl);
  console.log('[Test] authController.login user role:', resData.user?.role);

  if (resStatus !== 200 || !resData.success || resData.redirectUrl !== '/admin/dashboard' || resData.user?.role !== 'admin') {
    throw new Error('authController.login failed!');
  }

  console.log('\n[Test] ALL ADMIN CREDENTIAL AND CONTROLLER CHECKS PASSED SUCCESSFULLY!');
  await mongoose.disconnect();
}

testLogin().catch((err) => {
  console.error('[Test Failed]:', err);
  process.exit(1);
});
