import { Schema, Document, model } from 'mongoose';
import { ILocation, LocationSchema } from './Location.js';

export interface IShipment {
  shipmentCode: string;
  parcelIds: Schema.Types.ObjectId[];
  originHub: ILocation;
  destinationHub: ILocation;
  totalWeightKg: number;
  status: 'scheduled' | 'loading' | 'in_transit' | 'completed' | 'cancelled';
  vehicleId?: Schema.Types.ObjectId;
  partnerId: Schema.Types.ObjectId;
  routeId?: Schema.Types.ObjectId;
  currentLegNumber: number;
  totalLegs: number;
  estimatedDeparture?: Date;
  actualDeparture?: Date;
  estimatedArrival?: Date;
  actualArrival?: Date;
}

export interface IShipmentDocument extends IShipment, Document {}

const ShipmentSchema = new Schema<IShipmentDocument>(
  {
    shipmentCode: { type: String, required: true, unique: true, index: true },
    parcelIds: [{ type: Schema.Types.ObjectId, ref: 'Parcel' }],
    originHub: { type: LocationSchema, required: true },
    destinationHub: { type: LocationSchema, required: true },
    totalWeightKg: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['scheduled', 'loading', 'in_transit', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'PartnerRoute' },
    currentLegNumber: { type: Number, default: 1 },
    totalLegs: { type: Number, default: 1 },
    estimatedDeparture: { type: Date },
    actualDeparture: { type: Date },
    estimatedArrival: { type: Date },
    actualArrival: { type: Date },
  },
  { timestamps: true }
);

export const Shipment = model<IShipmentDocument>('Shipment', ShipmentSchema);
