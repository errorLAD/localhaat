import { Earning, IEarning } from '../models/Earning.js';
import { LogisticsPartner } from '../models/LogisticsPartner.js';
import { VillageAgent } from '../models/VillageAgent.js';
import { NotificationService } from './notificationService.js';
import mongoose from 'mongoose';

export class EarningsService {
  /**
   * Credit partner earnings for a completed shipment leg or parcel haul
   */
  static async creditPartnerEarnings(
    partnerUserId: string | mongoose.Types.ObjectId,
    referenceId: string,
    distanceKm: number,
    baseFee: number = 40,
    ratePerKm: number = 10
  ) {
    const netAmount = Math.round(baseFee + distanceKm * ratePerKm);
    const earning = await Earning.create({
      actorType: 'PARTNER',
      actorId: partnerUserId,
      referenceType: 'SHIPMENT_LEG',
      referenceId,
      baseAmount: baseFee,
      bonus: Math.round(distanceKm * ratePerKm),
      deduction: 0,
      netAmount,
      status: 'available',
      remarks: `Haul leg completed: ${distanceKm} km @ ₹${ratePerKm}/km + ₹${baseFee} base`,
    });

    await LogisticsPartner.findOneAndUpdate(
      { userId: partnerUserId },
      { $inc: { totalParcelsDelivered: 1 } }
    );

    await NotificationService.sendNotification({
      userId: partnerUserId,
      title: 'Earnings Credited! 💰',
      message: `You earned ₹${netAmount} for delivering shipment leg ${referenceId}.`,
      type: 'IN_APP',
      metadata: { earningId: earning._id, netAmount },
    });

    return earning;
  }

  /**
   * Credit village agent earnings upon final doorstep/hub parcel delivery
   */
  static async creditAgentEarnings(
    agentUserId: string | mongoose.Types.ObjectId,
    parcelId: string,
    commissionAmount: number = 25
  ) {
    const earning = await Earning.create({
      actorType: 'AGENT',
      actorId: agentUserId,
      referenceType: 'PARCEL',
      referenceId: parcelId,
      baseAmount: commissionAmount,
      bonus: 0,
      deduction: 0,
      netAmount: commissionAmount,
      status: 'available',
      remarks: `Village delivery completed for parcel ${parcelId}`,
    });

    await VillageAgent.findOneAndUpdate(
      { userId: agentUserId },
      { $inc: { totalDelivered: 1, activeParcelsCount: -1 } }
    );

    await NotificationService.sendNotification({
      userId: agentUserId,
      title: 'Delivery Commission Added 🌾',
      message: `₹${commissionAmount} credited for completing last-mile delivery.`,
      type: 'IN_APP',
      metadata: { earningId: earning._id, netAmount: commissionAmount },
    });

    return earning;
  }
}
