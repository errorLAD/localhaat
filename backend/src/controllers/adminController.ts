import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Parcel } from '../models/Parcel.js';
import { Shipment } from '../models/Shipment.js';
import { LogisticsPartner } from '../models/LogisticsPartner.js';
import { VillageAgent } from '../models/VillageAgent.js';
import { BusinessAccount } from '../models/BusinessAccount.js';
import { KycDocument } from '../models/KycDocument.js';
import { Payout } from '../models/Payout.js';
import { Earning } from '../models/Earning.js';
import { NotificationService } from '../services/notificationService.js';
import bcrypt from 'bcryptjs';

export const getPlatformStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalParcels = await Parcel.countDocuments();
    const activeShipments = await Shipment.countDocuments({ status: { $ne: 'completed' } });
    const totalPartners = await LogisticsPartner.countDocuments();
    const totalAgents = await VillageAgent.countDocuments();
    const totalBusinesses = await BusinessAccount.countDocuments();
    const pendingKycCount = await KycDocument.countDocuments({ verificationStatus: 'PENDING' });
    const pendingPayoutsCount = await Payout.countDocuments({ status: 'pending' });

    const orders = await Order.find({ paymentStatus: 'paid' });
    const grossMerchandiseValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalParcels,
        activeShipments,
        totalPartners,
        totalAgents,
        totalBusinesses,
        pendingKycCount,
        pendingPayoutsCount,
        grossMerchandiseValue,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, search } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { phone: { $regex: String(search), $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getKycDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter = status ? { verificationStatus: status } : {};
    const docs = await KycDocument.find(filter).populate('userId', 'name phone role').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: docs.length, documents: docs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyKycDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be VERIFIED or REJECTED.' });
    }

    const doc = await KycDocument.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'KYC Document not found.' });

    doc.verificationStatus = status;
    doc.rejectionReason = rejectionReason;
    doc.verifiedBy = req.user?._id as any;
    doc.verifiedAt = new Date();
    await doc.save();

    // Update user KYC status
    await User.findByIdAndUpdate(doc.userId, {
      kycStatus: status === 'VERIFIED' ? 'verified' : 'rejected',
    });

    await NotificationService.sendNotification({
      userId: doc.userId.toString(),
      title: `KYC Document ${status === 'VERIFIED' ? 'Approved ✅' : 'Rejected ❌'}`,
      message:
        status === 'VERIFIED'
          ? 'Your identification document has been verified. You now have full operational privileges.'
          : `Your document verification was rejected: ${rejectionReason || 'Details unclear'}. Please re-upload.`,
      type: 'IN_APP',
    });

    return res.status(200).json({ success: true, message: `KYC marked as ${status}`, document: doc });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPayouts = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const payouts = await Payout.find(filter).populate('actorId', 'name phone role').sort({ requestedAt: -1 });
    return res.status(200).json({ success: true, count: payouts.length, payouts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processPayout = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, transactionRef, rejectionReason } = req.body;

    const payout = await Payout.findById(id);
    if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

    payout.status = status;
    payout.transactionRef = transactionRef || `TXN-UPI-${Date.now()}`;
    payout.rejectionReason = rejectionReason;
    payout.processedAt = new Date();
    payout.processedBy = req.user?._id as any;
    await payout.save();

    if (status === 'processed') {
      // Mark corresponding earnings as paid
      await Earning.updateMany({ actorId: payout.actorId, status: 'available' }, { status: 'paid' });
    }

    await NotificationService.sendNotification({
      userId: payout.actorId.toString(),
      title: status === 'processed' ? 'Payout Disbursed! 💸' : 'Payout Update',
      message:
        status === 'processed'
          ? `₹${payout.amount} has been transferred to your account via ${payout.paymentMode}. Ref: ${payout.transactionRef}`
          : `Payout request of ₹${payout.amount} is ${status}.`,
      type: 'IN_APP',
    });

    return res.status(200).json({ success: true, message: `Payout status updated to ${status}`, payout });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// BUSINESS ACCOUNTS MANAGEMENT (ADMIN ONLY)
// ==========================================

export const getAdminBusinessAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { businessName: { $regex: String(search), $options: 'i' } },
        { contactPerson: { $regex: String(search), $options: 'i' } },
        { contactPhone: { $regex: String(search), $options: 'i' } },
      ];
    }

    const accounts = await BusinessAccount.find(filter)
      .populate('userId', 'name phone email isActive createdAt')
      .sort({ createdAt: -1 });

    // Attach live shipment count for each business
    const populated = await Promise.all(
      accounts.map(async (acc) => {
        const userId = (acc.userId as any)?._id || acc.userId;
        const shipmentCount = await Parcel.countDocuments({
          $or: [{ businessAccountId: acc._id }, { senderUserId: userId }],
        });
        const activeCount = await Parcel.countDocuments({
          $or: [{ businessAccountId: acc._id }, { senderUserId: userId }],
          status: { $in: ['CREATED', 'PARTNER_ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'ready_for_pickup'] },
        });
        return {
          ...acc.toObject(),
          totalShipments: shipmentCount,
          activeShipments: activeCount,
        };
      })
    );

    return res.status(200).json({ success: true, count: populated.length, businesses: populated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminBusinessAccount = async (req: AuthRequest, res: Response) => {
  try {
    const {
      businessName,
      contactPerson,
      phone,
      email,
      address,
      pickupLocations,
      password,
      status,
      gstin,
      businessType,
      creditLimit,
    } = req.body;

    if (!businessName || !phone || !contactPerson) {
      return res.status(400).json({
        success: false,
        message: 'Business Name, Contact Person, and Mobile Phone are required.',
      });
    }

    const cleanPhone = String(phone).trim();
    let user = await User.findOne({ phone: cleanPhone });

    if (user && user.role !== 'business') {
      return res.status(400).json({
        success: false,
        message: `A user with mobile ${cleanPhone} already exists with role: ${user.role}. Please use a distinct business mobile number.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password || 'business123', 10);

    const defaultAddress = address || {
      addressLine: 'Industrial Area Phase 1',
      villageOrCity: 'Varanasi',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221001',
      contactPerson,
      contactPhone: cleanPhone,
    };

    if (!user) {
      user = await User.create({
        name: contactPerson,
        phone: cleanPhone,
        email: email?.trim(),
        password: hashedPassword,
        role: 'business',
        isActive: status !== 'inactive' && status !== 'suspended',
        defaultLocation: defaultAddress,
        kycStatus: 'verified',
      });
    } else {
      user.password = hashedPassword;
      user.role = 'business';
      user.isActive = status !== 'inactive' && status !== 'suspended';
      await user.save();
    }

    const business = await BusinessAccount.create({
      userId: user._id,
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: cleanPhone,
      contactEmail: email?.trim(),
      businessType: businessType || 'enterprise_shipper',
      gstin: gstin?.trim(),
      registeredAddress: defaultAddress,
      pickupLocations: pickupLocations && pickupLocations.length > 0 ? pickupLocations : [defaultAddress],
      status: status || 'active',
      creditLimit: Number(creditLimit) || 25000,
    });

    user.businessAccountId = business._id as any;
    await user.save();

    return res.status(201).json({
      success: true,
      message: `Business Account "${businessName}" created successfully! Login username: ${cleanPhone}`,
      business,
      loginCredentials: {
        phone: cleanPhone,
        temporaryPassword: password || 'business123',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminBusinessAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      businessName,
      contactPerson,
      contactEmail,
      status,
      address,
      pickupLocations,
      creditLimit,
      gstin,
    } = req.body;

    const business = await BusinessAccount.findById(id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business Account not found.' });
    }

    if (businessName) business.businessName = businessName.trim();
    if (contactPerson) business.contactPerson = contactPerson.trim();
    if (contactEmail !== undefined) business.contactEmail = contactEmail.trim();
    if (status) business.status = status;
    if (address) business.registeredAddress = address;
    if (pickupLocations) business.pickupLocations = pickupLocations;
    if (creditLimit !== undefined) business.creditLimit = Number(creditLimit);
    if (gstin !== undefined) business.gstin = gstin.trim();

    await business.save();

    if (status) {
      await User.findByIdAndUpdate(business.userId, {
        isActive: status === 'active',
      });
    }

    return res.status(200).json({ success: true, message: 'Business Account updated successfully.', business });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetAdminBusinessPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const business = await BusinessAccount.findById(id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business Account not found.' });
    }

    const passwordToSet = newPassword || 'localhaat' + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);

    await User.findByIdAndUpdate(business.userId, {
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${business.businessName}.`,
      phone: business.contactPhone,
      newPassword: passwordToSet,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminBusinessShipments = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const business = await BusinessAccount.findById(id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business Account not found.' });
    }

    const shipments = await Parcel.find({
      $or: [{ businessAccountId: business._id }, { senderUserId: business.userId }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: shipments.length, shipments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

