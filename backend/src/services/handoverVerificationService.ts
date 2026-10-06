import crypto from 'crypto';
import mongoose from 'mongoose';
import { Parcel, IParcelDocument } from '../models/Parcel.js';
import { Order } from '../models/Order.js';
import { ParcelEvent } from '../models/ParcelEvent.js';
import { HandoverRecord } from '../models/HandoverRecord.js';
import { ShipmentLeg } from '../models/ShipmentLeg.js';
import { EarningsService } from './earningsService.js';
import { emitToParcel, emitToUser } from './socketService.js';
import { NotificationService } from './notificationService.js';

export class HandoverVerificationService {
  /**
   * Generates secure 4-digit numeric pickup verification code
   */
  static generatePickupCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Generates secure 4-digit numeric agent handover code
   */
  static generateHandoverCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static generateAgentCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Generates 4-digit delivery PIN for customer
   */
  static generateDeliveryPin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static hashCode(code?: string): string {
    if (!code) return '';
    return crypto.createHash('sha256').update(code.trim()).digest('hex');
  }

  static verifyCodeHash(code: string, hash?: string): boolean {
    if (!code || !hash) return false;
    return HandoverVerificationService.hashCode(code) === hash;
  }

  static generateDistinctCodes(isAgentFlow: boolean = true) {
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
    let agentHandoverCode = '';
    do {
      agentHandoverCode = Math.floor(1000 + Math.random() * 9000).toString();
    } while (agentHandoverCode === pickupCode);

    let deliveryPin = '';
    do {
      deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
    } while (deliveryPin === pickupCode || deliveryPin === agentHandoverCode);

    return {
      pickupCode,
      pickupHash: HandoverVerificationService.hashCode(pickupCode),
      agentHandoverCode,
      agentHandoverHash: HandoverVerificationService.hashCode(agentHandoverCode),
      deliveryPin,
      deliveryCode: deliveryPin,
      deliveryHash: HandoverVerificationService.hashCode(deliveryPin),
    };
  }

  /**
   * Stage 1: Seller gives parcel to Logistics Partner
   * Logistics partner inputs the Pickup Code provided by Seller
   */
  static async verifyPickup({
    parcelId,
    partnerUserId,
    pickupCode,
    locationName = 'Seller Origin Facility',
    latitude,
    longitude,
    notes,
  }: {
    parcelId: string;
    partnerUserId: string;
    pickupCode: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }) {
    const parcel = mongoose.Types.ObjectId.isValid(parcelId)
      ? await Parcel.findById(parcelId).populate('orderId')
      : await Parcel.findOne({ parcelTrackingNumber: parcelId }).populate('orderId');
    if (!parcel) {
      throw new Error('Parcel not found.');
    }

    if (parcel.pickupCode !== pickupCode.trim()) {
      throw new Error('Invalid Pickup Code. Please check with the seller.');
    }

    if (parcel.status !== 'created' && parcel.status !== 'ready_for_pickup') {
      throw new Error(`Parcel cannot be picked up in current state: ${parcel.status}`);
    }

    parcel.status = 'picked_up';
    parcel.currentLegIndex = 1;
    await parcel.save();

    // Update associated Order status
    await Order.findByIdAndUpdate(parcel.orderId, { orderStatus: 'in_transit' });

    // Update first-mile shipment leg
    await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, legType: 'FIRST_MILE_PICKUP' },
      { status: 'completed', completedAt: new Date() }
    );

    // Record custody transfer HandoverRecord
    const order = parcel.orderId as any;
    await HandoverRecord.create({
      parcelId: parcel._id,
      fromActorType: 'SELLER',
      fromActorId: order.customerId, // Or seller
      toActorType: 'PARTNER',
      toActorId: partnerUserId,
      handoverCodeUsed: pickupCode,
      locationName,
      latitude,
      longitude,
      notes: notes || 'Seller to logistics partner first-mile custody transfer verified.',
    });

    // Create Parcel Event
    const event = await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'PICKED_UP',
      timestamp: new Date(),
      locationName,
      coordinates: latitude && longitude ? { latitude, longitude } : undefined,
      description: `Parcel picked up by logistics partner from origin (${locationName}).`,
      actorRole: 'Logistics Partner',
    });

    // Realtime broadcasts
    emitToParcel(parcel.parcelTrackingNumber, 'parcel:status_change', {
      status: parcel.status,
      currentLegIndex: parcel.currentLegIndex,
      event,
    });

    return { success: true, parcel, event };
  }

  /**
   * Stage 2: Logistics Partner hands over parcel to Village Agent Hub
   * Village Agent inputs the Handover Code provided by Logistics Partner
   */
  static async verifyHubHandover({
    parcelId,
    agentUserId,
    partnerUserId,
    handoverCode,
    locationName = 'Village Drop Point Hub',
    latitude,
    longitude,
    notes,
  }: {
    parcelId: string;
    agentUserId: string;
    partnerUserId: string;
    handoverCode: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }) {
    const parcel = mongoose.Types.ObjectId.isValid(parcelId)
      ? await Parcel.findById(parcelId)
      : await Parcel.findOne({ parcelTrackingNumber: parcelId });
    if (!parcel) {
      throw new Error('Parcel not found.');
    }

    if (parcel.handoverCode !== handoverCode.trim()) {
      throw new Error('Invalid Handover Code. Please verify with the arriving partner.');
    }

    parcel.status = 'arrived_at_village_hub';
    parcel.currentLegIndex = 2;
    await parcel.save();

    // Update mid-mile shipment leg
    const midLeg = await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, legType: 'MID_MILE_HAUL' },
      { status: 'completed', completedAt: new Date() }
    );

    // Credit partner for completing the haul
    const distanceKm = midLeg?.distanceKm || 35;
    await EarningsService.creditPartnerEarnings(partnerUserId, parcel.parcelTrackingNumber, distanceKm);

    // Record custody transfer
    await HandoverRecord.create({
      parcelId: parcel._id,
      fromActorType: 'PARTNER',
      fromActorId: partnerUserId,
      toActorType: 'AGENT',
      toActorId: agentUserId,
      handoverCodeUsed: handoverCode,
      locationName,
      latitude,
      longitude,
      notes: notes || 'Logistics partner to Village Agent hub transfer successfully verified.',
    });

    // Create event
    const event = await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'ARRIVED_AT_VILLAGE_HUB',
      timestamp: new Date(),
      locationName,
      coordinates: latitude && longitude ? { latitude, longitude } : undefined,
      description: `Parcel safely reached local Village Haat drop hub (${locationName}). Ready for customer collection/delivery.`,
      actorRole: 'Village Agent',
    });

    emitToParcel(parcel.parcelTrackingNumber, 'parcel:status_change', {
      status: parcel.status,
      currentLegIndex: parcel.currentLegIndex,
      event,
    });

    return { success: true, parcel, event };
  }

  /**
   * Stage 3: Village Agent (or partner) delivers parcel to Customer
   * Village Agent inputs the 4-digit Delivery PIN given by Customer
   */
  static async verifyCustomerDelivery({
    parcelId,
    agentUserId,
    deliveryPin,
    locationName = 'Customer Doorstep / Village Point',
    latitude,
    longitude,
    notes,
  }: {
    parcelId: string;
    agentUserId: string;
    deliveryPin: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }) {
    const parcel = mongoose.Types.ObjectId.isValid(parcelId)
      ? await Parcel.findById(parcelId).populate('orderId')
      : await Parcel.findOne({ parcelTrackingNumber: parcelId }).populate('orderId');
    if (!parcel) {
      throw new Error('Parcel not found.');
    }

    if (parcel.deliveryPin !== deliveryPin.trim()) {
      throw new Error('Invalid Delivery PIN entered. Please request the 4-digit code shown on customer app/SMS.');
    }

    parcel.status = 'delivered';
    parcel.currentLegIndex = parcel.totalLegs;
    await parcel.save();

    // Mark Order delivered
    const order = await Order.findByIdAndUpdate(
      parcel.orderId,
      {
        orderStatus: 'delivered',
        deliveredAt: new Date(),
      },
      { new: true }
    );

    // Update last-mile leg
    await ShipmentLeg.findOneAndUpdate(
      { parcelId: parcel._id, legType: 'LAST_MILE_VILLAGE_DELIVERY' },
      { status: 'completed', completedAt: new Date() }
    );

    // Credit village agent last-mile delivery commission
    await EarningsService.creditAgentEarnings(agentUserId, parcel.parcelTrackingNumber, 30);

    // Record Handover
    await HandoverRecord.create({
      parcelId: parcel._id,
      fromActorType: 'AGENT',
      fromActorId: agentUserId,
      toActorType: 'CUSTOMER',
      toActorId: order ? order.customerId : agentUserId,
      handoverCodeUsed: deliveryPin,
      locationName,
      latitude,
      longitude,
      notes: notes || 'Delivery PIN successfully verified. Handed over to customer.',
    });

    // Create delivered event
    const event = await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'DELIVERED',
      timestamp: new Date(),
      locationName,
      coordinates: latitude && longitude ? { latitude, longitude } : undefined,
      description: `Package successfully delivered to customer. Verified with 4-digit secure PIN.`,
      actorRole: 'Village Agent',
    });

    emitToParcel(parcel.parcelTrackingNumber, 'parcel:status_change', {
      status: parcel.status,
      currentLegIndex: parcel.currentLegIndex,
      event,
    });

    if (order?.customerId) {
      await NotificationService.sendNotification({
        userId: order.customerId as any,
        title: 'Order Delivered! 🎉',
        message: `Your package ${parcel.parcelTrackingNumber} has been delivered. Thank you for using LocalHaat!`,
        type: 'IN_APP',
      });
    }

    return { success: true, parcel, event, order };
  }
}

export const hashCode = HandoverVerificationService.hashCode;
export const generateDistinctCodes = HandoverVerificationService.generateDistinctCodes;
export const verifyCodeHash = HandoverVerificationService.verifyCodeHash;

