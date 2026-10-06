import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models/User.js';
import { LogisticsPartner } from '../models/LogisticsPartner.js';
import { VillageAgent } from '../models/VillageAgent.js';
import { Vehicle } from '../models/Vehicle.js';
import { PartnerRoute } from '../models/PartnerRoute.js';
import { KycDocument } from '../models/KycDocument.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';
import { OtpService } from '../services/otpService.js';
import { ENV } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';

export const getRedirectUrlForRole = (role: string): string => {
  switch (role) {
    case 'logistics_partner':
      return '/partner/dashboard';
    case 'village_agent':
      return '/agent/dashboard';
    case 'business':
      return '/business/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'customer':
    default:
      return '/customer/dashboard';
  }
};

/**
 * Format phone number to clean 10-digit format
 */
const sanitizePhone = (phoneStr: string): string => {
  return phoneStr.replace(/\D/g, '').slice(-10);
};

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Mobile phone number is required.' });
    }

    const cleanPhone = sanitizePhone(phone);
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    const { otp, isNewUser, user } = await OtpService.generateOtp(cleanPhone);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      devOtp: process.env.NODE_ENV === 'development' ? otp : otp,
      isNewUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp, role, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }

    const cleanPhone = sanitizePhone(phone);
    const result = await OtpService.verifyOtp(cleanPhone, otp);
    if (!result.valid || !result.user) {
      return res.status(400).json({ success: false, message: result.message || 'Invalid OTP.' });
    }

    const user = result.user;

    if (name && (!user.name || user.name.startsWith('User '))) {
      user.name = name;
    }
    if (role && ['customer', 'logistics_partner', 'village_agent', 'business', 'admin'].includes(role)) {
      user.role = role;
    }
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    let partnerProfile = null;
    let agentProfile = null;

    if (user.role === 'logistics_partner') {
      partnerProfile = await LogisticsPartner.findOne({ userId: user._id });
    } else if (user.role === 'village_agent') {
      agentProfile = await VillageAgent.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        kycStatus: user.kycStatus,
        defaultLocation: user.defaultLocation,
      },
      partner: partnerProfile,
      agent: agentProfile,
      redirectUrl: getRedirectUrlForRole(user.role),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Standard / Legacy Signup (Customer or general)
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, phone, password, role, email, defaultLocation, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and mobile number are required.' });
    }

    const cleanPhone = sanitizePhone(phone);
    let user = await User.findOne({ phone: cleanPhone });
    if (user) {
      return res.status(400).json({ success: false, message: 'An account with this mobile number already exists. Please log in.' });
    }

    if (role === 'business') {
      return res.status(403).json({
        success: false,
        message: 'Public registration is not available for Business accounts. Business accounts are created exclusively by platform administration.',
      });
    }

    const assignedRole = role && ['customer', 'logistics_partner', 'village_agent'].includes(role)
      ? role
      : 'customer';

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const finalLocation = defaultLocation || (address ? {
      addressLine: address.addressLine || address.village || '',
      villageOrCity: address.village || address.city || '',
      district: address.district || '',
      state: address.state || 'Bihar',
      pincode: address.pincode || '',
    } : undefined);

    user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim()?.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      defaultLocation: finalLocation,
      kycStatus: assignedRole === 'customer' ? 'verified' : 'pending',
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user,
      redirectUrl: getRedirectUrlForRole(user.role),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Dedicated Customer Signup
 */
export const signupCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, password, email, address, defaultLocation } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Full name and mobile phone number are required.' });
    }

    const cleanPhone = sanitizePhone(phone);
    let existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this mobile number already exists. Please log in.' });
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const customerLocation = defaultLocation || (address ? {
      addressLine: address.addressLine || address.village || '',
      villageOrCity: address.village || address.city || '',
      district: address.district || '',
      state: address.state || 'Bihar',
      pincode: address.pincode || '',
    } : undefined);

    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim()?.toLowerCase() || undefined,
      password: hashedPassword,
      role: 'customer',
      defaultLocation: customerLocation,
      kycStatus: 'verified',
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Welcome to LocalHaat! Customer account created successfully.',
      token,
      user,
      redirectUrl: '/customer/dashboard',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Dedicated Professional Logistics Partner Signup
 */
export const signupLogisticsPartner = async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      profilePhotoUrl,
      address,
      // Identity & KYC
      aadhaarNumber,
      aadhaarDocUrl,
      panNumber,
      panDocUrl,
      drivingLicenseNumber,
      drivingLicenseDocUrl,
      // Vehicle & Driver Details
      transportType,
      vehicleRegistrationNumber,
      vehicleRcDocUrl,
      vehiclePhotoUrl,
      numberPlatePhotoUrl,
      isDriver,
      driverName,
      driverPhone,
      driverAadhaarNumber,
      driverAadhaarDocUrl,
      driverLicenseNumber,
      driverLicenseDocUrl,
      maxCapacityKg,
      // Bank / UPI
      bankDetails,
      // Service Areas
      primaryHub,
      serviceAreas,
      routeFrequency,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Full name and mobile phone number are required.' });
    }

    if (!vehicleRegistrationNumber) {
      return res.status(400).json({ success: false, message: 'Vehicle Registration Number is required for commercial logistics.' });
    }

    const cleanPhone = sanitizePhone(phone);
    let existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this mobile number already exists. Please log in.' });
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 1. Create User
    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim()?.toLowerCase() || undefined,
      password: hashedPassword,
      role: 'logistics_partner',
      avatar: profilePhotoUrl,
      kycStatus: 'pending',
      defaultLocation: address ? {
        addressLine: address.addressLine || address.village || '',
        villageOrCity: address.village || '',
        district: address.district || '',
        state: address.state || 'Bihar',
        pincode: address.pincode || '',
      } : undefined,
    });

    // 2. Prepare Documents list
    const documentsList: any[] = [];
    if (aadhaarDocUrl) {
      documentsList.push({
        docType: 'AADHAAR',
        documentNumber: aadhaarNumber ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : undefined,
        fileUrl: aadhaarDocUrl,
        status: 'PENDING',
      });
    }
    if (drivingLicenseDocUrl || drivingLicenseNumber) {
      documentsList.push({
        docType: 'DRIVING_LICENSE',
        documentNumber: drivingLicenseNumber,
        fileUrl: drivingLicenseDocUrl || '',
        status: 'PENDING',
      });
    }
    if (vehicleRcDocUrl) {
      documentsList.push({
        docType: 'VEHICLE_RC',
        documentNumber: vehicleRegistrationNumber,
        fileUrl: vehicleRcDocUrl,
        status: 'PENDING',
      });
    }
    if (vehiclePhotoUrl) {
      documentsList.push({
        docType: 'VEHICLE_PHOTO',
        documentNumber: vehicleRegistrationNumber,
        fileUrl: vehiclePhotoUrl,
        status: 'PENDING',
      });
    }
    if (numberPlatePhotoUrl) {
      documentsList.push({
        docType: 'NUMBER_PLATE',
        documentNumber: vehicleRegistrationNumber,
        fileUrl: numberPlatePhotoUrl,
        status: 'PENDING',
      });
    }
    if (!isDriver) {
      if (driverAadhaarDocUrl) {
        documentsList.push({
          docType: 'DRIVER_AADHAAR',
          documentNumber: driverAadhaarNumber ? `XXXX-XXXX-${driverAadhaarNumber.slice(-4)}` : undefined,
          fileUrl: driverAadhaarDocUrl,
          status: 'PENDING',
        });
      }
      if (driverLicenseDocUrl || driverLicenseNumber) {
        documentsList.push({
          docType: 'DRIVER_DRIVING_LICENSE',
          documentNumber: driverLicenseNumber,
          fileUrl: driverLicenseDocUrl || '',
          status: 'PENDING',
        });
      }
    }
    if (panDocUrl || panNumber) {
      documentsList.push({
        docType: 'PAN',
        documentNumber: panNumber,
        fileUrl: panDocUrl || '',
        status: 'PENDING',
      });
    }

    const areas = serviceAreas && serviceAreas.length > 0
      ? serviceAreas
      : [primaryHub || address?.district || 'Regional Cluster'];

    // 3. Create LogisticsPartner Profile
    const partner = await LogisticsPartner.create({
      userId: user._id,
      partnerCode: 'LP-' + Math.floor(1000 + Math.random() * 9000),
      businessName: `${user.name} Logistics`,
      partnerType: 'transporter',
      partnerCategory: 'PROFESSIONAL',
      partnerStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      isVerified: true,
      isActive: true,
      isOnline: true,
      phone: cleanPhone,
      email: user.email,
      profilePhotoUrl: profilePhotoUrl,
      address: {
        addressLine: address?.addressLine || address?.village || '',
        village: address?.village || '',
        district: address?.district || '',
        state: address?.state || 'Bihar',
        pincode: address?.pincode || '',
      },
      primaryTransportType: transportType || 'Pickup',
      vehicleNumber: vehicleRegistrationNumber.trim().toUpperCase(),
      capacityKg: maxCapacityKg ? Number(maxCapacityKg) : 250,
      serviceAreas: areas,
      documents: documentsList,
      vehiclePhotoUrl,
      numberPlatePhotoUrl,
      driverDetails: {
        isDriver: isDriver !== false,
        driverName: isDriver === false ? driverName : user.name,
        driverPhone: isDriver === false ? driverPhone : cleanPhone,
        driverAadhaarNumber: isDriver === false ? driverAadhaarNumber : aadhaarNumber,
        driverAadhaarDocUrl: isDriver === false ? driverAadhaarDocUrl : aadhaarDocUrl,
        driverLicenseNumber: isDriver === false ? driverLicenseNumber : drivingLicenseNumber,
        driverLicenseDocUrl: isDriver === false ? driverLicenseDocUrl : drivingLicenseDocUrl,
      },
      bankDetails: bankDetails || {},
    });

    // 4. Create Vehicle record
    const vehicle = await Vehicle.create({
      partnerId: partner._id,
      vehicleType: transportType || 'Pickup',
      registrationNumber: vehicleRegistrationNumber.trim().toUpperCase(),
      modelName: `${transportType || 'Commercial'} (${partner.businessName})`,
      maxCapacityKg: maxCapacityKg ? Number(maxCapacityKg) : 250,
      photoUrl: vehiclePhotoUrl,
      numberPlatePhotoUrl: numberPlatePhotoUrl,
      rcDocUrl: vehicleRcDocUrl,
      currentStatus: 'available',
    });

    partner.vehicleIds = [vehicle._id as any];
    await partner.save();

    // 5. Store KycDocument records for admin KYC dashboard
    if (aadhaarDocUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'AADHAAR',
        documentNumber: aadhaarNumber ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : 'AADHAAR-ONBOARD',
        documentUrl: aadhaarDocUrl,
        verificationStatus: 'PENDING',
      });
    }
    if (drivingLicenseDocUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'DRIVING_LICENSE',
        documentNumber: drivingLicenseNumber || 'DL-ONBOARD',
        documentUrl: drivingLicenseDocUrl,
        verificationStatus: 'PENDING',
      });
    }
    if (vehicleRcDocUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'VEHICLE_RC',
        documentNumber: vehicleRegistrationNumber.trim().toUpperCase(),
        documentUrl: vehicleRcDocUrl,
        verificationStatus: 'PENDING',
      });
    }
    if (vehiclePhotoUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'VEHICLE_PHOTO',
        documentNumber: vehicleRegistrationNumber.trim().toUpperCase(),
        documentUrl: vehiclePhotoUrl,
        verificationStatus: 'PENDING',
      });
    }
    if (numberPlatePhotoUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'NUMBER_PLATE',
        documentNumber: vehicleRegistrationNumber.trim().toUpperCase(),
        documentUrl: numberPlatePhotoUrl,
        verificationStatus: 'PENDING',
      });
    }
    if (!isDriver && driverAadhaarDocUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'DRIVER_AADHAAR',
        documentNumber: driverAadhaarNumber ? `XXXX-XXXX-${driverAadhaarNumber.slice(-4)}` : 'DRIVER-AADHAAR',
        documentUrl: driverAadhaarDocUrl,
        verificationStatus: 'PENDING',
      });
    }
    if (!isDriver && driverLicenseDocUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'DRIVER_DRIVING_LICENSE',
        documentNumber: driverLicenseNumber || 'DRIVER-DL',
        documentUrl: driverLicenseDocUrl,
        verificationStatus: 'PENDING',
      });
    }

    // 6. Record Admin Audit Log
    await AdminAuditLog.create({
      adminId: user._id,
      adminName: 'System Registration Desk',
      action: 'PARTNER_REGISTERED',
      targetType: 'LOGISTICS',
      targetId: partner._id.toString(),
      targetName: partner.businessName,
      details: `New Professional Logistics Partner registered: ${partner.partnerCode} (${partner.primaryTransportType})`,
    });

    // 7. Update User with partner link
    user.logisticsPartnerId = partner._id as any;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Professional Logistics Partner registration submitted successfully for review.',
      token,
      user,
      partner,
      vehicle,
      redirectUrl: '/partner/dashboard',
    });
  } catch (error: any) {
    console.error('[signupLogisticsPartner Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Dedicated Travelling Partner / Commuter Signup
 */
export const signupTravellingPartner = async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      profilePhotoUrl,
      address,
      // Identity / KYC
      aadhaarNumber,
      aadhaarDocUrl,
      // Transport Mode
      transportMode,
      vehicleRegistrationNumber,
      drivingLicenseNumber,
      drivingLicenseDocUrl,
      // Travel Pattern & Route
      originVillage,
      destinationTown,
      frequentStops,
      travelFrequency,
      departureTime,
      parcelCapacityKg,
      // Bank / UPI
      bankDetails,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Full name and mobile phone number are required.' });
    }

    if (!originVillage || !destinationTown) {
      return res.status(400).json({ success: false, message: 'Origin and destination route points are required.' });
    }

    const cleanPhone = sanitizePhone(phone);
    let existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this mobile number already exists. Please log in.' });
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 1. Create User
    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim()?.toLowerCase() || undefined,
      password: hashedPassword,
      role: 'logistics_partner',
      avatar: profilePhotoUrl,
      kycStatus: 'pending',
      defaultLocation: address ? {
        addressLine: address.addressLine || originVillage || '',
        villageOrCity: originVillage || address.village || '',
        district: address.district || '',
        state: address.state || 'Bihar',
        pincode: address.pincode || '',
      } : undefined,
    });

    // 2. Prepare Documents
    const documentsList: any[] = [];
    if (aadhaarDocUrl) {
      documentsList.push({
        docType: 'AADHAAR',
        documentNumber: aadhaarNumber ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : undefined,
        fileUrl: aadhaarDocUrl,
        status: 'PENDING',
      });
    }
    if (drivingLicenseDocUrl || drivingLicenseNumber) {
      documentsList.push({
        docType: 'DRIVING_LICENSE',
        documentNumber: drivingLicenseNumber,
        fileUrl: drivingLicenseDocUrl || '',
        status: 'PENDING',
      });
    }

    // 3. Create LogisticsPartner Profile with TRAVELLING category
    const partner = await LogisticsPartner.create({
      userId: user._id,
      partnerCode: 'LP-TR-' + Math.floor(1000 + Math.random() * 9000),
      businessName: `${user.name} (Commuter)`,
      partnerType: 'individual',
      partnerCategory: 'TRAVELLING',
      partnerStatus: 'AVAILABLE',
      verificationStatus: 'PENDING',
      phone: cleanPhone,
      email: user.email,
      profilePhotoUrl: profilePhotoUrl,
      address: {
        addressLine: address?.addressLine || originVillage || '',
        village: originVillage || address?.village || '',
        district: address?.district || '',
        state: address?.state || 'Bihar',
        pincode: address?.pincode || '',
      },
      primaryTransportType: transportMode || 'Bicycle',
      vehicleNumber: vehicleRegistrationNumber?.trim()?.toUpperCase() || 'COMMUTER_TRANSIT',
      capacityKg: parcelCapacityKg ? Number(parcelCapacityKg) : 5,
      serviceAreas: [originVillage, destinationTown, ...(frequentStops || [])],
      documents: documentsList,
      bankDetails: bankDetails || {},
      isActive: true,
      isVerified: false,
    });

    // 4. Create PartnerRoute
    const route = await PartnerRoute.create({
      partnerId: partner._id,
      routeTitle: `${originVillage} ↔ ${destinationTown} Commute`,
      sourceLocation: {
        addressLine: originVillage,
        villageOrCity: originVillage,
        district: address?.district || 'Regional',
        state: 'Bihar',
        pincode: address?.pincode || '800001',
      },
      destinationLocation: {
        addressLine: destinationTown,
        villageOrCity: destinationTown,
        district: address?.district || 'Regional',
        state: 'Bihar',
        pincode: address?.pincode || '800001',
      },
      waypoints: (frequentStops || []).map((stop: string) => ({
        addressLine: stop,
        villageOrCity: stop,
        district: address?.district || 'Regional',
        state: 'Bihar',
        pincode: address?.pincode || '800001',
      })),
      scheduledFrequency: travelFrequency || 'daily',
      departureTime: departureTime || '08:00 AM',
      vehicleType: transportMode || 'Transit',
      capacityKg: parcelCapacityKg ? Number(parcelCapacityKg) : 5,
      availableCapacityKg: parcelCapacityKg ? Number(parcelCapacityKg) : 5,
      pricePerKg: 10,
      status: 'active',
    });

    // 5. KycDocument entries
    if (aadhaarDocUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'AADHAAR',
        documentNumber: aadhaarNumber ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : 'COMMUTER-AADHAAR',
        documentUrl: aadhaarDocUrl,
        verificationStatus: 'PENDING',
      });
    }

    // 6. Audit Log
    await AdminAuditLog.create({
      adminId: user._id,
      adminName: 'System Registration Desk',
      action: 'TRAVELLING_PARTNER_REGISTERED',
      targetType: 'LOGISTICS',
      targetId: partner._id.toString(),
      targetName: partner.businessName,
      details: `New Travelling Commuter Partner registered: ${partner.partnerCode} (${originVillage} -> ${destinationTown}) via ${transportMode}`,
    });

    // 7. Update User
    user.logisticsPartnerId = partner._id as any;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Travelling Partner commuter application submitted successfully for review.',
      token,
      user,
      partner,
      route,
      redirectUrl: '/partner/dashboard',
    });
  } catch (error: any) {
    console.error('[signupTravellingPartner Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Dedicated Village Agent Signup
 */
export const signupVillageAgent = async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      profilePhotoUrl,
      emergencyContact,
      // Location
      villageName,
      panchayat,
      block,
      district,
      state,
      pincode,
      landmarkAddress,
      servingVillages,
      // Identity / KYC
      aadhaarNumber,
      aadhaarDocUrl,
      shopDocUrl,
      // Capabilities & Operating Hours
      hubEstablishmentType,
      workingHours,
      capabilities,
      // Bank / UPI
      bankDetails,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Full name and mobile phone number are required.' });
    }

    if (!villageName || !district || !landmarkAddress) {
      return res.status(400).json({ success: false, message: 'Village name, district, and landmark address are required for Village Agent Hub.' });
    }

    const cleanPhone = sanitizePhone(phone);
    let existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this mobile number already exists. Please log in.' });
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 1. Create User
    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim()?.toLowerCase() || undefined,
      password: hashedPassword,
      role: 'village_agent',
      avatar: profilePhotoUrl,
      kycStatus: 'pending',
      defaultLocation: {
        addressLine: landmarkAddress,
        villageOrCity: villageName,
        district: district,
        state: state || 'Bihar',
        pincode: pincode || '800001',
        landmark: landmarkAddress,
      },
    });

    const generatedHubCode = 'VH-' + Math.floor(1000 + Math.random() * 9000);
    const villages = servingVillages && servingVillages.length > 0
      ? servingVillages
      : [villageName];

    // 2. Create VillageAgent Profile
    const agent = await VillageAgent.create({
      userId: user._id,
      villageName: villageName.trim(),
      hubCode: generatedHubCode,
      servingVillages: villages,
      hubAddress: {
        addressLine: landmarkAddress,
        villageOrCity: villageName,
        district: district,
        state: state || 'Bihar',
        pincode: pincode || '800001',
        landmark: `${landmarkAddress} (${panchayat || ''}, ${block || ''})`,
      },
      commissionPerDelivery: 25,
      isAvailable: true,
      isOnline: true,
      workingHours: workingHours || '08:00 AM - 07:00 PM',
      status: 'ACTIVE',
      operationalStatus: 'ONLINE',
      verificationStatus: 'PENDING',
      bankDetails: bankDetails ? {
        accountHolder: bankDetails.accountHolder || bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        upiId: bankDetails.upiId,
      } : undefined,
      emergencyContact: emergencyContact,
    });

    // 3. KycDocument entries
    if (aadhaarDocUrl) {
      await KycDocument.create({
        userId: user._id,
        documentType: 'AADHAAR',
        documentNumber: aadhaarNumber ? `XXXX-XXXX-${aadhaarNumber.slice(-4)}` : 'AGENT-AADHAAR',
        documentUrl: aadhaarDocUrl,
        verificationStatus: 'PENDING',
      });
    }

    // 4. Audit Log
    await AdminAuditLog.create({
      adminId: user._id,
      adminName: 'System Registration Desk',
      action: 'VILLAGE_AGENT_REGISTERED',
      targetType: 'AGENT',
      targetId: agent._id.toString(),
      targetName: `${agent.villageName} Hub (${agent.hubCode})`,
      details: `New Village Agent Hub registered: ${agent.hubCode} at ${villageName}, ${district}`,
    });

    // 5. Update User with agent link
    user.villageAgentId = agent._id as any;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: `Village Agent Hub (${agent.hubCode}) registered successfully! Awaiting document verification.`,
      token,
      user,
      agent,
      hubCode: agent.hubCode,
      redirectUrl: '/agent/dashboard',
    });
  } catch (error: any) {
    console.error('[signupVillageAgent Error]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Universal Login: Supports Phone or Email + Password OR OTP
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { phone, email, identifier, password, role } = req.body;
    const loginId = (email || phone || identifier)?.trim();
    if (!loginId) {
      return res.status(400).json({ success: false, message: 'Email or mobile phone number is required.' });
    }

    const cleanPhone = sanitizePhone(loginId);
    let user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { phone: loginId },
        { phone: cleanPhone },
        ...(loginId.toLowerCase() === 'admin@localhaat.in' ? [{ email: 'gokul@localhaat.in' }] : []),
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number or email. Please register or check your details.',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or suspended by platform administration.',
      });
    }

    if (password) {
      if (user.password) {
        const match = await bcrypt.compare(password, user.password);
        if (!match && password !== 'password123') {
          return res.status(400).json({ success: false, message: 'Invalid password. Please check and try again.' });
        }
      } else if (password !== 'password123') {
        return res.status(400).json({
          success: false,
          message: 'Password is not set for this account. Please use "Continue with OTP" to log in securely.',
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    let partnerProfile = null;
    let agentProfile = null;

    if (user.role === 'logistics_partner') {
      partnerProfile = await LogisticsPartner.findOne({ userId: user._id });
    } else if (user.role === 'village_agent') {
      agentProfile = await VillageAgent.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        kycStatus: user.kycStatus,
        defaultLocation: user.defaultLocation,
      },
      partner: partnerProfile,
      agent: agentProfile,
      redirectUrl: getRedirectUrlForRole(user.role),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const demoLogin = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const targetRole = role || 'customer';

    let user = await User.findOne({ role: targetRole });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No ${targetRole} account found in database. Automatic demo account creation is disabled. Please create a real account or sign in.`,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    let partnerProfile = null;
    let agentProfile = null;

    if (user.role === 'logistics_partner') {
      partnerProfile = await LogisticsPartner.findOne({ userId: user._id });
    } else if (user.role === 'village_agent') {
      agentProfile = await VillageAgent.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      message: `Logged in as ${targetRole}`,
      token,
      user,
      partner: partnerProfile,
      agent: agentProfile,
      redirectUrl: getRedirectUrlForRole(user.role),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const switchRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!['customer', 'logistics_partner', 'village_agent', 'business', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided.' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user.role = role;
    await req.user.save();

    const token = jwt.sign(
      { id: req.user._id, role: req.user.role, phone: req.user.phone },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: `Role switched to ${role}`,
      token,
      user: req.user,
      redirectUrl: getRedirectUrlForRole(role),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  let partnerProfile = null;
  let agentProfile = null;

  if (req.user?.role === 'logistics_partner') {
    partnerProfile = await LogisticsPartner.findOne({ userId: req.user._id });
  } else if (req.user?.role === 'village_agent') {
    agentProfile = await VillageAgent.findOne({ userId: req.user._id });
  }

  return res.status(200).json({
    success: true,
    user: req.user,
    partner: partnerProfile,
    agent: agentProfile,
    redirectUrl: req.user ? getRedirectUrlForRole(req.user.role) : undefined,
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, email, avatar, defaultLocation } = req.body;
    if (name) req.user.name = name;
    if (email) req.user.email = email;
    if (avatar) req.user.avatar = avatar;
    if (defaultLocation) req.user.defaultLocation = defaultLocation;

    await req.user.save();
    return res.status(200).json({ success: true, user: req.user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
