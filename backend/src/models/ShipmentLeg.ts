import { Schema, Document, model } from 'mongoose';
import { ILocation, LocationSchema } from './Location.js';

export type LegType = 'FIRST_MILE_PICKUP' | 'MID_MILE_HAUL' | 'LAST_MILE_VILLAGE_DELIVERY';

export interface IShipmentLeg {
  shipmentId?: Schema.Types.ObjectId;
  parcelId: Schema.Types.ObjectId;
  sequence: number;
  legType: LegType;
  originLocation: ILocation;
  destinationLocation: ILocation;
  assignedType: 'PARTNER' | 'AGENT';
  assignedToUserId?: Schema.Types.ObjectId;
  pickupVerificationCode: string;
  handoverVerificationCode: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  distanceKm: number;
  estimatedEarnings: number;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface IShipmentLegDocument extends IShipmentLeg, Document {}

const ShipmentLegSchema = new Schema<IShipmentLegDocument>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', required: true, index: true },
    sequence: { type: Number, required: true },
    legType: {
      type: String,
      enum: ['FIRST_MILE_PICKUP', 'MID_MILE_HAUL', 'LAST_MILE_VILLAGE_DELIVERY'],
      required: true,
    },
    originLocation: { type: LocationSchema, required: true },
    destinationLocation: { type: LocationSchema, required: true },
    assignedType: {
      type: String,
      enum: ['PARTNER', 'AGENT'],
      required: true,
    },
    assignedToUserId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    pickupVerificationCode: { type: String, required: true },
    handoverVerificationCode: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    distanceKm: { type: Number, default: 10 },
    estimatedEarnings: { type: Number, default: 50 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ShipmentLeg = model<IShipmentLegDocument>('ShipmentLeg', ShipmentLegSchema);
