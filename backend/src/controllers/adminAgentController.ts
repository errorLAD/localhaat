import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  VillageAgent,
  User,
  Parcel,
  Earning,
  Payout,
  KycDocument,
  AgentReview,
  AgentComplaint,
  AgentActivity,
  AdminAuditLog,
  AgentSetting,
} from '../models/index.js';
import { emitAgentUpdate, emitToAll } from '../services/socketService.js';

// Helper to get or create settings singleton
const getOrCreateSettings = async () => {
  let settings = await AgentSetting.findOne();
  if (!settings) {
    settings = await AgentSetting.create({
      commissionReceivedPackage: 15,
      commissionDeliveredPackage: 25,
      cashCollectionBonusRate: 2,
      maxActiveParcelsPerAgent: 50,
      maxCashInHandAllowed: 10000,
      overdueStorageHours: 48,
      minPayoutThreshold: 500,
      autoVerifyThresholdRating: 4.8,
      smsAlertsEnabled: true,
      emailAlertsEnabled: true,
      autoAssignEnabled: true,
    });
  }
  return settings;
};

// 1. DASHBOARD STATS
export const getAgentDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalAgents,
      activeAgents,
      offlineAgents,
      suspendedAgents,
      blockedAgents,
      pendingVerificationAgents,
      verifiedAgents,
      onlineAgents,
      onDeliveryAgents,
      waitingAgents,
      agentsWithCash,
    ] = await Promise.all([
      VillageAgent.countDocuments(),
      VillageAgent.countDocuments({ status: 'ACTIVE' }),
      VillageAgent.countDocuments({ status: 'OFFLINE' }),
      VillageAgent.countDocuments({ status: 'SUSPENDED' }),
      VillageAgent.countDocuments({ status: 'BLOCKED' }),
      VillageAgent.countDocuments({ verificationStatus: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
      VillageAgent.countDocuments({ verificationStatus: 'VERIFIED' }),
      VillageAgent.countDocuments({ isOnline: true }),
      VillageAgent.countDocuments({ operationalStatus: 'ON_DELIVERY' }),
      VillageAgent.countDocuments({ operationalStatus: 'WAITING' }),
      VillageAgent.aggregate([
        { $group: { _id: null, totalCash: { $sum: '$cashInHand' }, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    // Package stats related to agents
    const [storedParcels, outForDeliveryParcels, deliveredParcels, failedParcels] = await Promise.all([
      Parcel.countDocuments({
        status: { $in: ['RECEIVED_BY_AGENT', 'arrived_at_village_hub'] },
      }),
      Parcel.countDocuments({
        status: { $in: ['OUT_FOR_DELIVERY', 'out_for_delivery'] },
      }),
      Parcel.countDocuments({
        status: { $in: ['DELIVERED', 'delivered'] },
      }),
      Parcel.countDocuments({
        status: { $in: ['FAILED_DELIVERY', 'RETURNED', 'returned'] },
      }),
    ]);

    // Calculate overdue packages (stored longer than 48 hours)
    const overdueCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const overdueParcels = await Parcel.countDocuments({
      status: { $in: ['RECEIVED_BY_AGENT', 'arrived_at_village_hub'] },
      updatedAt: { $lt: overdueCutoff },
    });

    // Financial ledger
    const [earningsAgg, payoutsAgg, pendingPayoutsAgg] = await Promise.all([
      Earning.aggregate([
        { $match: { actorType: 'AGENT' } },
        { $group: { _id: null, total: { $sum: '$netAmount' } } },
      ]),
      Payout.aggregate([
        { $match: { actorType: 'AGENT', status: 'processed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payout.aggregate([
        { $match: { actorType: 'AGENT', status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    // Reviews & Complaints
    const [totalReviews, pendingComplaints, pendingKycDocs] = await Promise.all([
      AgentReview.countDocuments(),
      AgentComplaint.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } }),
      KycDocument.countDocuments({ verificationStatus: 'PENDING' }),
    ]);

    // Registration trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRegistrations = await VillageAgent.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top districts coverage
    const districtCoverage = await VillageAgent.aggregate([
      {
        $group: {
          _id: '$hubAddress.district',
          state: { $first: '$hubAddress.state' },
          count: { $sum: 1 },
          totalDelivered: { $sum: '$totalDelivered' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    return res.json({
      success: true,
      data: {
        agents: {
          total: totalAgents,
          active: activeAgents,
          offline: offlineAgents,
          suspended: suspendedAgents,
          blocked: blockedAgents,
          pendingVerification: pendingVerificationAgents,
          verified: verifiedAgents,
          liveOnline: onlineAgents,
          onDelivery: onDeliveryAgents,
          waiting: waitingAgents,
          avgRating: agentsWithCash[0]?.avgRating ? Number(agentsWithCash[0].avgRating.toFixed(2)) : 4.85,
        },
        packages: {
          stored: storedParcels,
          outForDelivery: outForDeliveryParcels,
          delivered: deliveredParcels,
          failed: failedParcels,
          overdue: overdueParcels,
          totalHandled: storedParcels + outForDeliveryParcels + deliveredParcels,
        },
        finances: {
          totalEarnings: earningsAgg[0]?.total || 0,
          totalPayoutsDisbursed: payoutsAgg[0]?.total || 0,
          pendingPayoutsAmount: pendingPayoutsAgg[0]?.total || 0,
          pendingPayoutsCount: pendingPayoutsAgg[0]?.count || 0,
          totalCashInHand: agentsWithCash[0]?.totalCash || 0,
        },
        moderation: {
          totalReviews,
          pendingComplaints,
          pendingKycDocs,
        },
        charts: {
          monthlyRegistrations,
          districtCoverage: districtCoverage.map((d) => ({
            district: d._id || 'Unassigned',
            state: d.state || 'India',
            agentsCount: d.count,
            totalDelivered: d.totalDelivered,
          })),
        },
      },
    });
  } catch (error: any) {
    console.error('getAgentDashboardStats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET ALL AGENTS (SEARCH, FILTER, PAGINATION)
export const getAllAgents = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      verificationStatus,
      operationalStatus,
      district,
      state,
      page = '1',
      limit = '15',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (verificationStatus && verificationStatus !== 'ALL') {
      query.verificationStatus = verificationStatus;
    }
    if (operationalStatus && operationalStatus !== 'ALL') {
      query.operationalStatus = operationalStatus;
    }
    if (district) {
      query['hubAddress.district'] = new RegExp(district as string, 'i');
    }
    if (state) {
      query['hubAddress.state'] = new RegExp(state as string, 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { villageName: searchRegex },
        { hubCode: searchRegex },
        { servingVillages: searchRegex },
        { userId: { $in: userIds } },
      ];
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [agents, total] = await Promise.all([
      VillageAgent.find(query)
        .populate('userId', 'name phone email avatar role defaultLocation createdAt')
        .populate('currentPackageId', 'parcelId parcelTrackingNumber status')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      VillageAgent.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: agents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAllAgents error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET LIVE AGENTS
export const getLiveAgents = async (req: Request, res: Response) => {
  try {
    const liveAgents = await VillageAgent.find({
      $or: [{ isOnline: true }, { operationalStatus: { $ne: 'OFFLINE' } }],
    })
      .populate('userId', 'name phone email avatar')
      .populate('currentPackageId', 'parcelId parcelTrackingNumber status receiverName receiverMobile')
      .lean();

    return res.json({
      success: true,
      data: liveAgents,
      count: liveAgents.length,
    });
  } catch (error: any) {
    console.error('getLiveAgents error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET AGENT BY ID (FULL 360-DEGREE PROFILE)
export const getAgentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const agent = await VillageAgent.findOne({
      $or: [
        mongoose.isValidObjectId(id) ? { _id: id } : { _id: new mongoose.Types.ObjectId() },
        { hubCode: id.toUpperCase() },
      ],
    }).populate('userId', 'name phone email avatar role defaultLocation kycStatus createdAt');

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Village Agent not found' });
    }

    const userId = (agent.userId as any)?._id || agent.userId;

    const [packages, earnings, payouts, kycDocs, reviews, complaints, activities, auditLogs] =
      await Promise.all([
        Parcel.find({ currentAgentId: agent._id })
          .sort({ updatedAt: -1 })
          .limit(30)
          .lean(),
        userId ? Earning.find({ actorId: userId }).sort({ createdAt: -1 }).limit(25).lean() : [],
        userId ? Payout.find({ actorId: userId }).sort({ requestedAt: -1 }).limit(15).lean() : [],
        userId ? KycDocument.find({ userId }).sort({ createdAt: -1 }).lean() : [],
        AgentReview.find({ agentId: agent._id })
          .populate('customerId', 'name phone avatar')
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
        AgentComplaint.find({ agentId: agent._id })
          .populate('customerId', 'name phone avatar')
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
        AgentActivity.find({ agentId: agent._id }).sort({ createdAt: -1 }).limit(25).lean(),
        AdminAuditLog.find({ targetId: agent._id.toString() })
          .populate('adminId', 'name email')
          .sort({ createdAt: -1 })
          .limit(25)
          .lean(),
      ]);

    return res.json({
      success: true,
      data: {
        agent,
        packages,
        earnings,
        payouts,
        kycDocs,
        reviews,
        complaints,
        activities,
        auditLogs,
      },
    });
  } catch (error: any) {
    console.error('getAgentById error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. UPDATE AGENT STATUS (VERIFY, SUSPEND, BLOCK, ACTIVATE, DEACTIVATE)
export const updateAgentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason, durationDays } = req.body;
    const adminUser = (req as any).user;

    const agent = await VillageAgent.findById(id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Village Agent not found' });
    }

    const previousStatus = agent.status;
    let newStatus = agent.status;
    let newOperational = agent.operationalStatus;
    let newVerification = agent.verificationStatus;

    if (action === 'SUSPEND') {
      if (!reason) {
        return res.status(400).json({ success: false, message: 'Suspension reason is mandatory.' });
      }
      newStatus = 'SUSPENDED';
      newOperational = 'SUSPENDED';
      agent.status = 'SUSPENDED';
      agent.operationalStatus = 'SUSPENDED';
      agent.isOnline = false;
      agent.suspensionReason = reason;
      agent.suspensionDuration = durationDays ? `${durationDays} Days` : 'Indefinite';
      if (durationDays) {
        agent.suspensionEndDate = new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000);
      }
    } else if (action === 'UNSUSPEND' || action === 'ACTIVATE') {
      newStatus = 'ACTIVE';
      newOperational = 'ONLINE';
      agent.status = 'ACTIVE';
      agent.operationalStatus = 'ONLINE';
      agent.isOnline = true;
      agent.suspensionReason = undefined;
      agent.suspensionEndDate = undefined;
      agent.suspensionDuration = undefined;
    } else if (action === 'BLOCK') {
      if (!reason) {
        return res.status(400).json({ success: false, message: 'Block reason is mandatory.' });
      }
      newStatus = 'BLOCKED';
      newOperational = 'BLOCKED';
      agent.status = 'BLOCKED';
      agent.operationalStatus = 'BLOCKED';
      agent.isOnline = false;
      agent.blockedReason = reason;
    } else if (action === 'UNBLOCK') {
      newStatus = 'ACTIVE';
      newOperational = 'ONLINE';
      agent.status = 'ACTIVE';
      agent.operationalStatus = 'ONLINE';
      agent.isOnline = true;
      agent.blockedReason = undefined;
    } else if (action === 'DEACTIVATE') {
      newStatus = 'DEACTIVATED';
      newOperational = 'OFFLINE';
      agent.status = 'DEACTIVATED';
      agent.operationalStatus = 'OFFLINE';
      agent.isOnline = false;
      agent.deactivatedAt = new Date();
      agent.deactivatedReason = reason || 'Admin deactivated';
    } else if (action === 'VERIFY_KYC') {
      newVerification = 'VERIFIED';
      agent.verificationStatus = 'VERIFIED';
      agent.status = 'ACTIVE';
      if (agent.userId) {
        await User.findByIdAndUpdate(agent.userId, { kycStatus: 'verified' });
        await KycDocument.updateMany({ userId: agent.userId }, { verificationStatus: 'VERIFIED', verifiedAt: new Date(), verifiedBy: adminUser?.id });
      }
    } else if (action === 'REJECT_KYC') {
      if (!reason) {
        return res.status(400).json({ success: false, message: 'Rejection reason is mandatory.' });
      }
      newVerification = 'REJECTED';
      agent.verificationStatus = 'REJECTED';
      if (agent.userId) {
        await User.findByIdAndUpdate(agent.userId, { kycStatus: 'rejected' });
        await KycDocument.updateMany(
          { userId: agent.userId, verificationStatus: 'PENDING' },
          { verificationStatus: 'REJECTED', rejectionReason: reason, verifiedAt: new Date(), verifiedBy: adminUser?.id }
        );
      }
    } else {
      return res.status(400).json({ success: false, message: `Unknown action: ${action}` });
    }

    await agent.save();

    // Create Audit Log
    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: `AGENT_${action}`,
      targetType: 'AGENT',
      targetId: agent._id.toString(),
      reason: reason || `Status changed from ${previousStatus} to ${newStatus}`,
      details: {
        previousStatus,
        newStatus,
        newOperational,
        newVerification,
        hubCode: agent.hubCode,
      },
    });

    // Create Activity Log
    await AgentActivity.create({
      agentId: agent._id,
      userId: agent.userId as any,
      activityType: 'STATUS_CHANGE',
      title: `Admin Action: ${action}`,
      description: reason || `Agent status modified to ${newStatus}`,
      metadata: { action, adminName: adminUser?.name },
    });

    // Real-time broadcast
    emitAgentUpdate(agent._id.toString(), 'agent:status_update', {
      status: agent.status,
      operationalStatus: agent.operationalStatus,
      verificationStatus: agent.verificationStatus,
    });

    return res.json({
      success: true,
      message: `Agent ${action} completed successfully.`,
      data: agent,
    });
  } catch (error: any) {
    console.error('updateAgentStatus error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. UPDATE AGENT PROFILE CONFIG (COMMISSION, SERVING VILLAGES, BANK DETAILS, NOTES)
export const updateAgentProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      commissionPerDelivery,
      servingVillages,
      workingHours,
      internalNotes,
      emergencyContact,
      bankDetails,
      villageName,
    } = req.body;
    const adminUser = (req as any).user;

    const agent = await VillageAgent.findById(id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Village Agent not found' });
    }

    if (commissionPerDelivery !== undefined) agent.commissionPerDelivery = Number(commissionPerDelivery);
    if (servingVillages !== undefined) {
      agent.servingVillages = Array.isArray(servingVillages)
        ? servingVillages
        : servingVillages.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (workingHours !== undefined) agent.workingHours = workingHours;
    if (internalNotes !== undefined) agent.internalNotes = internalNotes;
    if (villageName !== undefined) agent.villageName = villageName;
    if (emergencyContact !== undefined) agent.emergencyContact = emergencyContact;
    if (bankDetails !== undefined) agent.bankDetails = bankDetails;

    await agent.save();

    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: 'AGENT_PROFILE_UPDATE',
      targetType: 'AGENT',
      targetId: agent._id.toString(),
      reason: 'Admin updated profile/commercial settings',
      details: { commissionPerDelivery, servingVillages, workingHours },
    });

    return res.json({
      success: true,
      message: 'Agent profile updated successfully.',
      data: agent,
    });
  } catch (error: any) {
    console.error('updateAgentProfile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. GET AGENT PACKAGES / INVENTORY
export const getAgentPackages = async (req: Request, res: Response) => {
  try {
    const { agentId, status, search, overdueOnly, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (agentId && agentId !== 'ALL') {
      if (mongoose.isValidObjectId(agentId)) {
        query.$or = [{ currentAgentId: agentId }, { agentId: agentId }];
      }
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (overdueOnly === 'true') {
      const overdueCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
      query.updatedAt = { $lt: overdueCutoff };
      query.status = { $in: ['RECEIVED_BY_AGENT', 'arrived_at_village_hub'] };
    }

    if (search) {
      const s = new RegExp(search as string, 'i');
      query.$or = [
        { parcelId: s },
        { parcelTrackingNumber: s },
        { receiverName: s },
        { receiverMobile: s },
        { deliveryLocation: s },
      ];
    }

    const [packages, total] = await Promise.all([
      Parcel.find(query)
        .populate('currentAgentId', 'villageName hubCode rating')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Parcel.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: packages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAgentPackages error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GET AGENT EARNINGS
export const getAgentEarnings = async (req: Request, res: Response) => {
  try {
    const { agentUserId, status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query: any = { actorType: 'AGENT' };

    if (agentUserId && agentUserId !== 'ALL') {
      query.actorId = agentUserId;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const [earnings, total] = await Promise.all([
      Earning.find(query)
        .populate('actorId', 'name phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Earning.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: earnings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAgentEarnings error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 9. GET AGENT PAYOUTS
export const getAgentPayouts = async (req: Request, res: Response) => {
  try {
    const { agentUserId, status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query: any = { actorType: 'AGENT' };

    if (agentUserId && agentUserId !== 'ALL') {
      query.actorId = agentUserId;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .populate('actorId', 'name phone email')
        .populate('processedBy', 'name email')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Payout.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: payouts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAgentPayouts error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 10. PROCESS AGENT PAYOUT (APPROVE, PROCESS/PAID, REJECT)
export const processAgentPayoutAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, transactionRef, rejectionReason } = req.body;
    const adminUser = (req as any).user;

    const payout = await Payout.findById(id);
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout record not found' });
    }

    const prevStatus = payout.status;

    if (action === 'APPROVE') {
      payout.status = 'approved';
    } else if (action === 'PROCESS') {
      payout.status = 'processed';
      payout.processedAt = new Date();
      payout.processedBy = adminUser?.id;
      payout.transactionRef = transactionRef || `TXN-LH-${Date.now().toString(36).toUpperCase()}`;

      // Mark associated earnings as paid
      await Earning.updateMany(
        { actorId: payout.actorId, status: { $in: ['available', 'requested'] } },
        { status: 'paid', clearedAt: new Date() }
      );
    } else if (action === 'REJECT') {
      if (!rejectionReason) {
        return res.status(400).json({ success: false, message: 'Rejection reason is mandatory.' });
      }
      payout.status = 'rejected';
      payout.rejectionReason = rejectionReason;
    } else {
      return res.status(400).json({ success: false, message: `Unknown action: ${action}` });
    }

    await payout.save();

    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: `PAYOUT_${action}`,
      targetType: 'PAYOUT',
      targetId: payout._id.toString(),
      reason: rejectionReason || `Payout updated to ${payout.status}`,
      details: { amount: payout.amount, prevStatus, newStatus: payout.status, transactionRef },
    });

    return res.json({
      success: true,
      message: `Payout successfully marked as ${payout.status}`,
      data: payout,
    });
  } catch (error: any) {
    console.error('processAgentPayoutAction error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 11. AGENT REVIEWS (LIST & MODERATE)
export const getAgentReviews = async (req: Request, res: Response) => {
  try {
    const { agentId, status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (agentId && agentId !== 'ALL') query.agentId = agentId;
    if (status && status !== 'ALL') query.status = status;

    const [reviews, total] = await Promise.all([
      AgentReview.find(query)
        .populate('agentId', 'villageName hubCode')
        .populate('customerId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AgentReview.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAgentReviews error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const moderateAgentReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, hiddenReason } = req.body; // 'APPROVED' or 'HIDDEN'
    const adminUser = (req as any).user;

    const review = await AgentReview.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = status;
    if (status === 'HIDDEN') {
      review.hiddenReason = hiddenReason || 'Flagged by Admin Moderation';
    }
    review.moderatedBy = adminUser?.id;
    review.moderatedAt = new Date();
    await review.save();

    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: `REVIEW_${status}`,
      targetType: 'REVIEW',
      targetId: review._id.toString(),
      reason: hiddenReason || `Review moderated to ${status}`,
    });

    return res.json({
      success: true,
      message: `Review updated to ${status}`,
      data: review,
    });
  } catch (error: any) {
    console.error('moderateAgentReview error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 12. AGENT COMPLAINTS (LIST & RESOLVE)
export const getAgentComplaints = async (req: Request, res: Response) => {
  try {
    const { agentId, status, priority, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (agentId && agentId !== 'ALL') query.agentId = agentId;
    if (status && status !== 'ALL') query.status = status;
    if (priority && priority !== 'ALL') query.priority = priority;

    const [complaints, total] = await Promise.all([
      AgentComplaint.find(query)
        .populate('agentId', 'villageName hubCode')
        .populate('customerId', 'name phone email')
        .populate('resolvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AgentComplaint.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: complaints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAgentComplaints error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveAgentComplaint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body; // 'RESOLVED', 'REJECTED', 'UNDER_REVIEW'
    const adminUser = (req as any).user;

    const complaint = await AgentComplaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    complaint.resolutionNotes = resolutionNotes || complaint.resolutionNotes;
    if (status === 'RESOLVED' || status === 'REJECTED') {
      complaint.resolvedBy = adminUser?.id;
      complaint.resolvedAt = new Date();
    }
    await complaint.save();

    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: `COMPLAINT_${status}`,
      targetType: 'COMPLAINT',
      targetId: complaint._id.toString(),
      reason: resolutionNotes || `Complaint marked as ${status}`,
    });

    return res.json({
      success: true,
      message: `Complaint ticket marked as ${status}`,
      data: complaint,
    });
  } catch (error: any) {
    console.error('resolveAgentComplaint error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 13. AGENT DOCUMENTS & KYC VERIFICATION
export const getAgentDocuments = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Filter agents' userIds directly from VillageAgent
    const agents = await VillageAgent.find().select('userId');
    const agentUserIds = agents.map((a) => a.userId).filter(Boolean);

    const query: any = { userId: { $in: agentUserIds } };
    if (status && status !== 'ALL') query.verificationStatus = status;

    const [docs, total] = await Promise.all([
      KycDocument.find(query)
        .populate('userId', 'name phone email defaultLocation')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      KycDocument.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: docs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAgentDocuments error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAgentDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // 'VERIFIED' | 'REJECTED'
    const adminUser = (req as any).user;

    const doc = await KycDocument.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.verificationStatus = status;
    doc.verifiedBy = adminUser?.id;
    doc.verifiedAt = new Date();
    if (status === 'REJECTED') {
      doc.rejectionReason = rejectionReason || 'Document unreadable or invalid';
    }
    await doc.save();

    // Check if all docs for this agent user are verified
    const allAgentDocs = await KycDocument.find({ userId: doc.userId });
    const anyRejected = allAgentDocs.some((d) => d.verificationStatus === 'REJECTED');
    const allVerified = allAgentDocs.length > 0 && allAgentDocs.every((d) => d.verificationStatus === 'VERIFIED');

    const agent = await VillageAgent.findOne({ userId: doc.userId });
    if (agent) {
      if (allVerified) {
        agent.verificationStatus = 'VERIFIED';
        await agent.save();
        await User.findByIdAndUpdate(doc.userId, { kycStatus: 'verified' });
      } else if (anyRejected) {
        agent.verificationStatus = 'REJECTED';
        await agent.save();
        await User.findByIdAndUpdate(doc.userId, { kycStatus: 'rejected' });
      }
    }

    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: `DOC_${status}`,
      targetType: 'KYC',
      targetId: doc._id.toString(),
      reason: rejectionReason || `Document status updated to ${status}`,
    });

    return res.json({
      success: true,
      message: `Document status updated to ${status}`,
      data: doc,
    });
  } catch (error: any) {
    console.error('verifyAgentDocument error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 14. AGENT ACTIVITY LOGS
export const getAgentActivityLogs = async (req: Request, res: Response) => {
  try {
    const { agentId, activityType, page = '1', limit = '25' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (agentId && agentId !== 'ALL') query.agentId = agentId;
    if (activityType && activityType !== 'ALL') query.activityType = activityType;

    const [logs, total] = await Promise.all([
      AgentActivity.find(query)
        .populate('agentId', 'villageName hubCode')
        .populate('parcelId', 'parcelId parcelTrackingNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AgentActivity.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAgentActivityLogs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 15. ADMIN AUDIT LOGS
export const getAdminAuditLogs = async (req: Request, res: Response) => {
  try {
    const { targetType, targetId, page = '1', limit = '25' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (targetType && targetType !== 'ALL') query.targetType = targetType;
    if (targetId) query.targetId = targetId;

    const [logs, total] = await Promise.all([
      AdminAuditLog.find(query)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AdminAuditLog.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAdminAuditLogs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 16. AGENT SETTINGS
export const getAgentSettings = async (req: Request, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('getAgentSettings error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAgentSettings = async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user;
    let settings = await getOrCreateSettings();

    const allowedFields = [
      'commissionReceivedPackage',
      'commissionDeliveredPackage',
      'cashCollectionBonusRate',
      'maxActiveParcelsPerAgent',
      'maxCashInHandAllowed',
      'overdueStorageHours',
      'minPayoutThreshold',
      'autoVerifyThresholdRating',
      'smsAlertsEnabled',
      'emailAlertsEnabled',
      'autoAssignEnabled',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (settings as any)[field] = req.body[field];
      }
    });

    settings.updatedBy = adminUser?.id;
    await settings.save();

    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: 'SETTINGS_UPDATE',
      targetType: 'SETTING',
      targetId: settings._id.toString(),
      reason: 'Admin updated agent global operation settings',
      details: req.body,
    });

    return res.json({
      success: true,
      message: 'Agent operations settings updated successfully.',
      data: settings,
    });
  } catch (error: any) {
    console.error('updateAgentSettings error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 17. CSV EXPORT FOR AGENTS
export const exportAgentsCsv = async (req: Request, res: Response) => {
  try {
    const agents = await VillageAgent.find()
      .populate('userId', 'name phone email')
      .lean();

    const headers = [
      'ID',
      'Hub Code',
      'Agent Name',
      'Phone',
      'Email',
      'Village Cluster',
      'District',
      'State',
      'Status',
      'Operational Status',
      'Verification Status',
      'Rating',
      'Total Delivered',
      'Cash In Hand (INR)',
      'Commission Per Delivery (INR)',
      'Created At',
    ];

    const rows = agents.map((a: any) => [
      `"${a._id}"`,
      `"${a.hubCode}"`,
      `"${a.userId?.name || ''}"`,
      `"${a.userId?.phone || ''}"`,
      `"${a.userId?.email || ''}"`,
      `"${(a.villageName || '').replace(/"/g, '""')}"`,
      `"${(a.hubAddress?.district || '').replace(/"/g, '""')}"`,
      `"${(a.hubAddress?.state || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.operationalStatus}"`,
      `"${a.verificationStatus}"`,
      a.rating || 0,
      a.totalDelivered || 0,
      a.cashInHand || 0,
      a.commissionPerDelivery || 25,
      `"${new Date(a.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="agents_export_${Date.now()}.csv"`);
    return res.send(csvContent);
  } catch (error: any) {
    console.error('exportAgentsCsv error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 18. CREATE / PROVISION VILLAGE AGENT WITH EMAIL & PASSWORD
export const createAgent = async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user;
    const {
      name,
      email,
      phone,
      password,
      villageName,
      hubCode,
      servingVillages,
      hubAddress,
      commissionPerDelivery,
      workingHours,
      bankDetails,
      emergencyContact,
      internalNotes,
    } = req.body;

    if (!name || !phone || !password || !villageName) {
      return res.status(400).json({
        success: false,
        message: 'Name, Mobile Phone, Password, and Village Name are required.',
      });
    }

    const cleanPhone = String(phone).trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : undefined;

    // Check existing phone
    let user = await User.findOne({ phone: cleanPhone });
    if (user && user.role !== 'village_agent') {
      return res.status(400).json({
        success: false,
        message: `A user with phone ${cleanPhone} already exists with role: ${user.role}.`,
      });
    }

    // Check existing email
    if (cleanEmail) {
      const existingEmailUser = await User.findOne({ email: cleanEmail });
      if (existingEmailUser && existingEmailUser._id.toString() !== user?._id?.toString()) {
        return res.status(400).json({
          success: false,
          message: `A user with email ${cleanEmail} already exists.`,
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultAddress = hubAddress || {
      addressLine: req.body.addressLine || 'Central Haat Compound',
      villageOrCity: req.body.villageOrCity || villageName,
      district: req.body.district || 'Varanasi',
      state: req.body.state || 'Uttar Pradesh',
      pincode: req.body.pincode || '221001',
    };

    const finalBankDetails = bankDetails || (req.body.accountNumber || req.body.upiId ? {
      accountNumber: req.body.accountNumber,
      ifscCode: req.body.ifscCode,
      bankName: req.body.bankName,
      upiId: req.body.upiId,
    } : undefined);

    if (!user) {
      user = await User.create({
        name,
        phone: cleanPhone,
        email: cleanEmail,
        password: hashedPassword,
        role: 'village_agent',
        isActive: true,
        defaultLocation: defaultAddress,
        kycStatus: 'verified',
      });
    } else {
      user.name = name;
      if (cleanEmail) user.email = cleanEmail;
      user.password = hashedPassword;
      user.role = 'village_agent';
      user.isActive = true;
      user.defaultLocation = defaultAddress;
      await user.save();
    }

    // Hub Code logic
    let finalHubCode = hubCode?.trim()?.toUpperCase();
    if (!finalHubCode) {
      const statePrefix = (defaultAddress.state?.substring(0, 2) || 'VH').toUpperCase();
      const randNum = Math.floor(1000 + Math.random() * 9000);
      finalHubCode = `VH-${statePrefix}-${randNum}`;
    }

    const existingHub = await VillageAgent.findOne({ hubCode: finalHubCode });
    if (existingHub && existingHub.userId.toString() !== user._id.toString()) {
      finalHubCode = `${finalHubCode}-${Math.floor(10 + Math.random() * 90)}`;
    }

    let parsedVillages = ['Central Village Cluster'];
    if (Array.isArray(servingVillages)) {
      parsedVillages = servingVillages;
    } else if (typeof servingVillages === 'string' && servingVillages.trim()) {
      parsedVillages = servingVillages.split(',').map((s) => s.trim()).filter(Boolean);
    }

    let agent = await VillageAgent.findOne({ userId: user._id });
    if (!agent) {
      agent = await VillageAgent.create({
        userId: user._id,
        villageName,
        hubCode: finalHubCode,
        servingVillages: parsedVillages,
        hubAddress: defaultAddress,
        commissionPerDelivery: Number(commissionPerDelivery) || 25,
        workingHours: workingHours || '08:00 AM - 07:00 PM',
        status: 'ACTIVE',
        operationalStatus: 'ONLINE',
        verificationStatus: 'VERIFIED',
        isOnline: true,
        isAvailable: true,
        bankDetails: finalBankDetails,
        emergencyContact,
        internalNotes,
        rating: 5.0,
        totalDelivered: 0,
        cashInHand: 0,
      });
    } else {
      agent.villageName = villageName;
      agent.hubCode = finalHubCode;
      agent.servingVillages = parsedVillages;
      agent.hubAddress = defaultAddress;
      agent.commissionPerDelivery = Number(commissionPerDelivery) || agent.commissionPerDelivery;
      agent.workingHours = workingHours || agent.workingHours;
      agent.status = 'ACTIVE';
      agent.operationalStatus = 'ONLINE';
      agent.verificationStatus = 'VERIFIED';
      agent.isOnline = true;
      agent.isAvailable = true;
      if (finalBankDetails) agent.bankDetails = finalBankDetails;
      if (emergencyContact) agent.emergencyContact = emergencyContact;
      if (internalNotes) agent.internalNotes = internalNotes;
      await agent.save();
    }

    user.villageAgentId = agent._id as any;
    await user.save();

    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: 'CREATE_AGENT',
      targetType: 'AGENT',
      targetId: agent._id.toString(),
      reason: `Provisioned agent credentials for ${name} (${cleanPhone}) with email ${cleanEmail || 'N/A'} and Hub Code ${finalHubCode}`,
      details: { hubCode: finalHubCode, email: cleanEmail, phone: cleanPhone },
    });

    emitToAll('admin:agent_update', {
      agentId: agent._id.toString(),
      action: 'CREATED',
      hubCode: finalHubCode,
    });

    const populatedAgent = await VillageAgent.findById(agent._id)
      .populate('userId', 'name phone email avatar role defaultLocation createdAt')
      .lean();

    return res.status(201).json({
      success: true,
      message: `Village Agent ${name} provisioned successfully with Hub Code ${finalHubCode}. Login enabled via Email/Phone & Password.`,
      data: populatedAgent,
    });
  } catch (error: any) {
    console.error('createAgent error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 19. RESET AGENT PASSWORD
export const resetAgentPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const adminUser = (req as any).user;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const agent = await VillageAgent.findById(id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Village Agent not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(agent.userId, { password: hashedPassword });

    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: 'RESET_AGENT_PASSWORD',
      targetType: 'AGENT',
      targetId: agent._id.toString(),
      reason: 'Admin updated agent login password',
    });

    return res.json({
      success: true,
      message: 'Agent login password updated successfully.',
    });
  } catch (error: any) {
    console.error('resetAgentPassword error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 20. BULK DELETE AGENTS
export const bulkDeleteAgents = async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user;
    const { agentIds } = req.body;

    if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'agentIds array is required and must contain at least one ID.',
      });
    }

    const validIds = agentIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid agent IDs provided.' });
    }

    const agents = await VillageAgent.find({ _id: { $in: validIds } }).populate('userId');
    if (!agents || agents.length === 0) {
      return res.status(404).json({ success: false, message: 'No matching village agents found.' });
    }

    const targetAgentIds = agents.map((a) => a._id);
    const targetUserIds = agents.map((a: any) => a.userId?._id || a.userId).filter(Boolean);
    const agentHubCodes = agents.map((a) => a.hubCode).join(', ');

    // 1. Unassign packages that point to these agents
    await Parcel.updateMany(
      { currentAgentId: { $in: targetAgentIds } },
      { $unset: { currentAgentId: '' } }
    );

    // 2. Clean up associated logs, reviews, complaints, and kyc
    await Promise.all([
      AgentActivity.deleteMany({ agentId: { $in: targetAgentIds } }),
      AgentReview.deleteMany({ agentId: { $in: targetAgentIds } }),
      AgentComplaint.deleteMany({ agentId: { $in: targetAgentIds } }),
      KycDocument.deleteMany({
        $or: [{ agentId: { $in: targetAgentIds } }, { userId: { $in: targetUserIds } }],
      }),
    ]);

    // 3. Delete the VillageAgent records
    const deleteResult = await VillageAgent.deleteMany({ _id: { $in: targetAgentIds } });

    // 4. Delete the associated User accounts if role is village_agent
    if (targetUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: targetUserIds }, role: 'village_agent' });
    }

    // 5. Audit Log
    await AdminAuditLog.create({
      adminId: adminUser?.id || new mongoose.Types.ObjectId(),
      adminName: adminUser?.name || 'Admin',
      action: 'BULK_DELETE_AGENTS',
      targetType: 'AGENT',
      targetId: targetAgentIds[0].toString(),
      reason: `Bulk deleted ${deleteResult.deletedCount} agent(s) with hub codes: ${agentHubCodes}`,
      details: { deletedCount: deleteResult.deletedCount, agentIds: validIds },
    });

    // 6. Broadcast via Socket
    emitToAll('admin:agent_update', {
      action: 'BULK_DELETED',
      agentIds: validIds,
    });

    return res.json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} village agent(s).`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error: any) {
    console.error('bulkDeleteAgents error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 21. DELETE SINGLE AGENT BY ID
export const deleteAgentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    req.body.agentIds = [id];
    return bulkDeleteAgents(req, res);
  } catch (error: any) {
    console.error('deleteAgentById error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


