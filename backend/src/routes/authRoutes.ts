import { Router } from 'express';
import {
  requestOtp,
  verifyOtp,
  signup,
  signupCustomer,
  signupLogisticsPartner,
  signupTravellingPartner,
  signupVillageAgent,
  login,
  demoLogin,
  switchRole,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// General & Legacy Auth
router.post('/signup', signup);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

// Role-Specific Onboarding
router.post('/signup/customer', signupCustomer);
router.post('/signup/partner/logistics', signupLogisticsPartner);
router.post('/signup/partner/travelling', signupTravellingPartner);
router.post('/signup/agent', signupVillageAgent);

// Protected Auth Routes
router.post('/switch-role', authenticate as any, switchRole as any);
router.get('/profile', authenticate as any, getProfile as any);
router.get('/me', authenticate as any, getProfile as any);
router.put('/profile', authenticate as any, updateProfile as any);

export default router;
