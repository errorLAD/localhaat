import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { VillageAgent } from '../models/VillageAgent.js';
import { User } from '../models/User.js';
import { Parcel } from '../models/Parcel.js';
import { ShipmentLeg } from '../models/ShipmentLeg.js';
import { Earning } from '../models/Earning.js';
import { HandoverRecord } from '../models/HandoverRecord.js';
import { ParcelEvent } from '../models/ParcelEvent.js';
import { TrackingEvent } from '../models/TrackingEvent.js';
import { hashCode } from '../services/handoverVerificationService.js';
import { emitToParcel, emitToAll } from '../services/socketService.js';

export const getAgentDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Resiliently resolve Village Agent profile
    let agent = await VillageAgent.findOne({ userId: req.user._id });
    if (!agent && req.user.villageAgentId) {
      agent = await VillageAgent.findById(req.user.villageAgentId);
    }
    if (!agent) {
      return res.status(200).json({
        success: true,
        agent: null,
        inventory: [],
        pendingHandovers: [],
        outForDelivery: [],
        deliveredHistory: [],
        stats: {},
      });
    }

    // Build query matching parcels assigned to this agent hub
    const agentMatch: any = {
      $or: [
        { currentAgentId: agent._id },
        { agentId: agent._id },
        { agentSelected: true, currentAgentId: { $in: [null, undefined, agent._id] } },
      ],
    };

    // Query all parcels associated with this village agent hub
    const allParcels = await Parcel.find(agentMatch)
      .sort({ updatedAt: -1 })
      .populate('orderId')
      .populate('currentPartnerId', 'businessName partnerType vehicleType name phone');

    // Ensure all parcels have strictly 4-digit OTP codes and synchronized verificationCodes
    for (const p of allParcels) {
      let needsSave = false;

      // 1. Strictly 4-digit agentCode & handoverCode
      let rawAgent = (p.verificationCodes?.agentHandover?.code || p.verificationCodes?.agent?.code || p.agentCode || p.handoverCode || '').toString().trim();
      let agentCode = rawAgent.replace(/\D/g, '').slice(0, 4);
      if (!agentCode || agentCode.length < 4) {
        agentCode = Math.floor(1000 + Math.random() * 9000).toString();
      }

      // 2. Strictly 4-digit deliveryPin
      let rawDelivery = (p.verificationCodes?.delivery?.code || p.deliveryPin || '').toString().trim();
      let deliveryPin = rawDelivery.replace(/\D/g, '').slice(0, 4);
      if (!deliveryPin || deliveryPin.length < 4) {
        deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
      }

      // 3. Strictly 4-digit pickupCode
      let rawPickup = (p.verificationCodes?.pickup?.code || p.pickupCode || '').toString().trim();
      let pickupCode = rawPickup.replace(/\D/g, '').slice(0, 4);
      if (!pickupCode || pickupCode.length < 4) {
        pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
      }

      // Guarantee all 3 are distinct
      while (deliveryPin === agentCode || deliveryPin === pickupCode) {
        deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
      }
      while (agentCode === pickupCode || agentCode === deliveryPin) {
        agentCode = Math.floor(1000 + Math.random() * 9000).toString();
      }

      if (p.agentCode !== agentCode || p.handoverCode !== agentCode) {
        p.agentCode = agentCode;
        p.handoverCode = agentCode;
        needsSave = true;
      }
      if (p.deliveryPin !== deliveryPin) {
        p.deliveryPin = deliveryPin;
        needsSave = true;
      }
      if (p.pickupCode !== pickupCode) {
        p.pickupCode = pickupCode;
        needsSave = true;
      }

      // VerificationCodes Object Sync
      const isDelivered = ['DELIVERED', 'delivered'].includes(p.status) || p.verificationCodes?.delivery?.status === 'VERIFIED';
      const isAgentHandoverVerified =
        p.verificationCodes?.agentHandover?.status === 'VERIFIED' ||
        p.verificationCodes?.agent?.status === 'VERIFIED' ||
        ['AT_AGENT', 'RECEIVED_BY_AGENT', 'arrived_at_village_hub', 'OUT_FOR_DELIVERY', 'out_for_delivery', 'DELIVERED', 'delivered'].includes(p.status);

      const currentAgentStatus = isAgentHandoverVerified ? 'VERIFIED' : 'PENDING';
      const currentAgentVerifiedAt = p.verificationCodes?.agentHandover?.verifiedAt || p.verificationCodes?.agent?.verifiedAt || (isAgentHandoverVerified ? p.updatedAt : undefined);
      const currentAgentVerifiedBy = p.verificationCodes?.agentHandover?.verifiedBy || p.verificationCodes?.agent?.verifiedBy;

      const currentDeliveryStatus = isDelivered ? 'VERIFIED' : 'PENDING';
      const currentDeliveryVerifiedAt = p.verificationCodes?.delivery?.verifiedAt || (isDelivered ? p.updatedAt : undefined);
      const currentDeliveryVerifiedBy = p.verificationCodes?.delivery?.verifiedBy;

      const currentPickupStatus = p.verificationCodes?.pickup?.status || (!['REQUESTED', 'LOOKING_FOR_DRIVER'].includes(p.status) ? 'VERIFIED' : 'PENDING');

      if (!p.verificationCodes || p.verificationCodes.agentHandover?.status !== currentAgentStatus || p.verificationCodes.delivery?.status !== currentDeliveryStatus) {
        p.verificationCodes = {
          pickup: {
            code: pickupCode,
            codeHash: hashCode(pickupCode),
            status: currentPickupStatus,
            verifiedAt: p.verificationCodes?.pickup?.verifiedAt,
            verifiedBy: p.verificationCodes?.pickup?.verifiedBy,
          },
          agentHandover: {
            code: agentCode,
            codeHash: hashCode(agentCode),
            status: currentAgentStatus,
            verifiedAt: currentAgentVerifiedAt,
            verifiedBy: currentAgentVerifiedBy,
          },
          agent: {
            code: agentCode,
            codeHash: hashCode(agentCode),
            status: currentAgentStatus,
            verifiedAt: currentAgentVerifiedAt,
            verifiedBy: currentAgentVerifiedBy,
          },
          delivery: {
            code: deliveryPin,
            codeHash: hashCode(deliveryPin),
            status: currentDeliveryStatus,
            verifiedAt: currentDeliveryVerifiedAt,
            verifiedBy: currentDeliveryVerifiedBy,
          },
        };
        needsSave = true;
      }

      if (needsSave) {
        await p.save();
      }
    }

    // Partition parcels strictly into distinct lifecycle categories
    const deliveredParcels = allParcels.filter((p) => {
      return ['DELIVERED', 'delivered'].includes(p.status) || p.verificationCodes?.delivery?.status === 'VERIFIED';
    });

    const hubParcels = allParcels.filter((p) => {
      const isDelivered = ['DELIVERED', 'delivered'].includes(p.status) || p.verificationCodes?.delivery?.status === 'VERIFIED';
      if (isDelivered) return false;
      const isReceived =
        p.verificationCodes?.agentHandover?.status === 'VERIFIED' ||
        p.verificationCodes?.agent?.status === 'VERIFIED' ||
        ['AT_AGENT', 'RECEIVED_BY_AGENT', 'arrived_at_village_hub', 'OUT_FOR_DELIVERY', 'out_for_delivery'].includes(p.status);
      return isReceived;
    });

    const incomingParcels = allParcels.filter((p) => {
      const isDelivered = ['DELIVERED', 'delivered'].includes(p.status) || p.verificationCodes?.delivery?.status === 'VERIFIED';
      const isReceived =
        p.verificationCodes?.agentHandover?.status === 'VERIFIED' ||
        p.verificationCodes?.agent?.status === 'VERIFIED' ||
        ['AT_AGENT', 'RECEIVED_BY_AGENT', 'arrived_at_village_hub', 'OUT_FOR_DELIVERY', 'out_for_delivery'].includes(p.status);
      return !isDelivered && !isReceived;
    });

    // 4. Fetch complete handover history records
    const handoverHistory = await HandoverRecord.find({
      $or: [
        { toActorId: req.user._id },
        { fromActorId: req.user._id },
        { toActorType: 'AGENT' },
        { fromActorType: 'AGENT' },
      ],
    })
      .sort({ verifiedAt: -1 })
      .limit(40)
      .populate('parcelId')
      .populate('fromActorId', 'name phone role')
      .populate('toActorId', 'name phone role');

    // Total agent commissions earned
    const earnings = await Earning.find({ actorId: req.user._id, actorType: 'AGENT' });
    const totalEarnings = earnings.length > 0
      ? earnings.reduce((sum, e) => sum + e.netAmount, 0)
      : deliveredParcels.length * (agent.commissionPerDelivery || 30);

    return res.status(200).json({
      success: true,
      agent,
      stats: {
        totalHubInventory: hubParcels.length,
        incomingCount: incomingParcels.length,
        readyForDeliveryCount: hubParcels.length,
        totalDelivered: deliveredParcels.length,
        totalEarnings,
        cashInHand: agent.cashInHand || 0,
      },
      incomingParcels,
      hubParcels,
      readyForDeliveryParcels: hubParcels,
      deliveredParcels,
      handoverHistory,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAgentProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let agent = await VillageAgent.findOne({ userId: req.user._id });
    if (!agent && req.user.villageAgentId) {
      agent = await VillageAgent.findById(req.user.villageAgentId);
    }
    if (!agent) {
      agent = await VillageAgent.findOne();
    }
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'No Village Agent profile registered for this account.',
      });
    }

    const user = await User.findById(req.user._id).select('-password');

    return res.status(200).json({
      success: true,
      agent,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAgentProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let agent = await VillageAgent.findOne({ userId: req.user._id });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Village Agent profile not found. Please contact admin to provision your agent hub.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const {
      name,
      email,
      villageName,
      hubCode,
      servingVillages,
      workingHours,
      commissionPerDelivery,
      isAvailable,
      hubAddress,
    } = req.body;

    // Update user info
    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }
    if (email !== undefined) {
      user.email = email ? email.trim() : undefined;
    }

    // Update village agent info
    if (villageName && typeof villageName === 'string' && villageName.trim()) {
      agent.villageName = villageName.trim();
    }

    if (hubCode && typeof hubCode === 'string' && hubCode.trim()) {
      const formattedCode = hubCode.trim().toUpperCase();
      // Check if another agent already uses this hubCode
      const existing = await VillageAgent.findOne({ hubCode: formattedCode, _id: { $ne: agent._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Hub Code ${formattedCode} is already assigned to another hub.` });
      }
      agent.hubCode = formattedCode;
    }

    if (workingHours && typeof workingHours === 'string' && workingHours.trim()) {
      agent.workingHours = workingHours.trim();
    }

    if (commissionPerDelivery !== undefined && !isNaN(Number(commissionPerDelivery))) {
      agent.commissionPerDelivery = Number(commissionPerDelivery);
    }

    if (isAvailable !== undefined) {
      agent.isAvailable = Boolean(isAvailable);
    }

    if (servingVillages !== undefined) {
      if (Array.isArray(servingVillages)) {
        agent.servingVillages = servingVillages.map((v: string) => String(v).trim()).filter(Boolean);
      } else if (typeof servingVillages === 'string') {
        agent.servingVillages = servingVillages
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean);
      }
    }

    if (hubAddress && typeof hubAddress === 'object') {
      agent.hubAddress = {
        addressLine: hubAddress.addressLine !== undefined ? String(hubAddress.addressLine).trim() : (agent.hubAddress?.addressLine || ''),
        villageOrCity: hubAddress.villageOrCity !== undefined ? String(hubAddress.villageOrCity).trim() : (agent.hubAddress?.villageOrCity || ''),
        district: hubAddress.district !== undefined ? String(hubAddress.district).trim() : (agent.hubAddress?.district || ''),
        state: hubAddress.state !== undefined ? String(hubAddress.state).trim() : (agent.hubAddress?.state || ''),
        pincode: hubAddress.pincode !== undefined ? String(hubAddress.pincode).trim() : (agent.hubAddress?.pincode || ''),
        landmark: hubAddress.landmark !== undefined ? String(hubAddress.landmark).trim() : (agent.hubAddress?.landmark || ''),
        contactPerson: hubAddress.contactPerson !== undefined ? String(hubAddress.contactPerson).trim() : (agent.hubAddress?.contactPerson || user.name),
        contactPhone: hubAddress.contactPhone !== undefined ? String(hubAddress.contactPhone).trim() : (agent.hubAddress?.contactPhone || user.phone),
        latitude: hubAddress.latitude !== undefined && !isNaN(Number(hubAddress.latitude)) ? Number(hubAddress.latitude) : (agent.hubAddress?.latitude || 28.6139),
        longitude: hubAddress.longitude !== undefined && !isNaN(Number(hubAddress.longitude)) ? Number(hubAddress.longitude) : (agent.hubAddress?.longitude || 77.2090),
      };

      // Sync default location to user account
      user.defaultLocation = agent.hubAddress;
    }

    await agent.save();
    user.villageAgentId = agent._id as any;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Village Agent profile updated successfully in database.',
      agent,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        defaultLocation: user.defaultLocation,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleAgentStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let agent = await VillageAgent.findOne({ userId: req.user._id });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    const { isAvailable } = req.body;
    agent.isAvailable = isAvailable !== undefined ? Boolean(isAvailable) : !agent.isAvailable;
    await agent.save();

    return res.status(200).json({
      success: true,
      message: `Hub status changed to ${agent.isAvailable ? 'Open (Accepting)' : 'Closed (Paused)'}.`,
      isAvailable: agent.isAvailable,
      agent,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recordCashCollection = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, parcelId } = req.body;
    const agent = await VillageAgent.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { cashInHand: Number(amount) } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Recorded cash collection of ₹${amount}.`,
      cashInHand: agent?.cashInHand,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * MANUAL AGENT HANDOVER FALLBACK CONFIRMATION (Section 16)
 * Authorized fallback when transporter app is offline or has technical difficulties.
 * Requires reason, records audit trail and emits realtime update.
 */
export const confirmManualAgentHandover = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, locationName } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid reason for manual handover confirmation is required (e.g. Partner device offline / network down).',
      });
    }

    const parcel = await Parcel.findOne({
      $or: [
        { parcelTrackingNumber: id },
        { parcelId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []),
      ],
    });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    if (
      parcel.verificationCodes?.agentHandover?.status === 'VERIFIED' ||
      parcel.status === 'AT_AGENT' ||
      parcel.status === 'RECEIVED_BY_AGENT' ||
      parcel.status === 'DELIVERED'
    ) {
      return res.status(200).json({
        success: true,
        status: 'ALREADY_VERIFIED',
        message: 'Agent Handover was already verified.',
        parcel,
      });
    }

    const verifiedDate = new Date();
    const loc = locationName || parcel.deliveryLocation || 'Village Drop Point Hub';
    const actorUserId = req.user?._id?.toString() || 'default_agent';
    const partnerUserId = parcel.currentPartnerId?.toString() || actorUserId;

    parcel.status = 'AT_AGENT';
    parcel.currentLegIndex = 2;
    if (!parcel.verificationCodes) {
      parcel.verificationCodes = {} as any;
    }
    const cleanCode = (parcel.handoverCode || parcel.agentCode || '0000').slice(0, 4);
    parcel.verificationCodes!.agentHandover = {
      code: cleanCode,
      codeHash: hashCode(cleanCode),
      status: 'VERIFIED',
      verifiedAt: verifiedDate,
      verifiedBy: actorUserId as any,
      verificationLocation: loc,
    };
    parcel.verificationCodes!.agent = {
      code: cleanCode,
      codeHash: hashCode(cleanCode),
      status: 'VERIFIED',
      verifiedAt: verifiedDate,
      verifiedBy: actorUserId as any,
      verificationLocation: loc,
    };
    await parcel.save();

    await HandoverRecord.create({
      parcelId: parcel._id,
      fromActorType: 'PARTNER',
      fromActorId: partnerUserId,
      toActorType: 'AGENT',
      toActorId: actorUserId,
      handoverCodeUsed: 'MANUAL_OVERRIDE',
      codeType: 'MANUAL_AGENT_HANDOVER',
      status: 'VERIFIED',
      verifiedAt: verifiedDate,
      locationName: loc,
      notes: `Manual Handover Confirmed by Agent: ${reason.trim()}`,
    });

    const event = await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'MANUAL_AGENT_HANDOVER_CONFIRMED',
      locationName: loc,
      description: `Manual Transporter handover confirmed at Village Hub. Reason: ${reason.trim()}`,
      actorRole: 'Village Agent',
    });

    await TrackingEvent.create({
      trackingCode: parcel.parcelTrackingNumber,
      parcelId: parcel._id,
      status: 'AT_AGENT',
      locationName: loc,
      note: 'Parcel safely received at Village Hub (Manual Agent Confirmation).',
    });

    const updatePayload = {
      parcelId: parcel.parcelId,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      status: parcel.status,
      verificationStatus: 'VERIFIED',
      verifiedAt: verifiedDate,
      nextStatus: 'RECEIVED_BY_AGENT',
      parcel,
      event,
    };

    emitToParcel(parcel.parcelTrackingNumber, 'parcel:agent_handover_verified', updatePayload);
    emitToParcel(parcel.parcelTrackingNumber, 'parcel:agent-handover-verified', updatePayload);
    emitToParcel(parcel.parcelTrackingNumber, 'parcel:status_change', {
      status: parcel.status,
      currentLegIndex: parcel.currentLegIndex,
      event,
    });
    emitToAll('parcel:agent_handover_verified', updatePayload);
    emitToAll('parcel:agent-handover-verified', updatePayload);

    return res.status(200).json({
      success: true,
      status: 'VERIFIED',
      message: 'Manual handover recorded. Parcel is now stored in hub inventory.',
      parcel,
      event,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

