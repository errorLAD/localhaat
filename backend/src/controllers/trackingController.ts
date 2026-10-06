import { Request, Response } from 'express';
import { Parcel } from '../models/Parcel.js';
import { ParcelEvent } from '../models/ParcelEvent.js';
import { ShipmentLeg } from '../models/ShipmentLeg.js';
import { TrackingEvent } from '../models/TrackingEvent.js';

export const trackPublicParcel = async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;
    const parcel = await Parcel.findOne({ parcelTrackingNumber: trackingNumber })
      .populate('orderId', 'orderNumber orderStatus deliveryAddress placedAt deliveryPin')
      .populate('currentPartnerId', 'businessName rating')
      .populate('currentAgentId', 'villageName hubCode servingVillages');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: `Tracking code ${trackingNumber} not found. Please verify your reference.`,
      });
    }

    const events = await ParcelEvent.find({ parcelTrackingNumber: trackingNumber }).sort({ timestamp: -1 });
    const legs = await ShipmentLeg.find({ parcelId: parcel._id }).sort({ sequence: 1 });
    const trackingMilestones = await TrackingEvent.find({ trackingCode: trackingNumber }).sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      parcel,
      events,
      legs,
      milestones: trackingMilestones,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
