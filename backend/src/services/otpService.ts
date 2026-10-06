import { User, IUserDocument } from '../models/User.js';

export class OtpService {
  /**
   * Generates a 6-digit OTP code, sets expiration (10 min), and saves to user document
   */
  static async generateOtp(phone: string): Promise<{ otp: string; isNewUser: boolean; user: IUserDocument }> {
    const cleanPhone = phone.trim();
    let user = await User.findOne({ phone: cleanPhone });
    const isNewUser = !user;

    // Standard dev OTP or random 6-digit code
    const otp = process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!user) {
      user = new User({
        name: `User ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        role: 'customer',
        otpCode: otp,
        otpExpiresAt: expiresAt,
        isActive: true,
      });
    } else {
      user.otpCode = otp;
      user.otpExpiresAt = expiresAt;
    }

    await user.save();

    console.log(`[OTP Service] Generated OTP for ${cleanPhone}: ${otp} (Expires: ${expiresAt.toLocaleTimeString()})`);
    return { otp, isNewUser, user };
  }

  /**
   * Validates OTP for given phone number
   */
  static async verifyOtp(phone: string, inputOtp: string): Promise<{ valid: boolean; user?: IUserDocument; message?: string }> {
    const cleanPhone = phone.trim();
    const user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      return { valid: false, message: 'User not found with this phone number.' };
    }

    // If master dev code 123456 is used in development mode, allow instant authentication
    if (process.env.NODE_ENV === 'development' && inputOtp === '123456') {
      user.otpCode = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return { valid: true, user };
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return { valid: false, message: 'No active OTP request found. Please request a new OTP.' };
    }

    if (new Date() > user.otpExpiresAt) {
      return { valid: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    const isMatch = user.otpCode === inputOtp;

    if (!isMatch) {
      return { valid: false, message: 'Invalid OTP code entered.' };
    }

    // Clear OTP after successful verification
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return { valid: true, user };
  }
}
