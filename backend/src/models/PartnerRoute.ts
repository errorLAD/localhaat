import { Schema, Document, model } from 'mongoose';
import { ILocation, LocationSchema } from './Location.js';

export interface IRouteStop {
  stopId: string; // e.g. "STOP-1", "STOP-2"
  stopOrder: number; // 1, 2, 3...
  name: string; // e.g. "Hajipur", "Muzaffarpur"
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  expectedArrival?: string; // e.g. "09:00 AM"
  expectedDeparture?: string; // e.g. "09:10 AM"
  waitingMinutes?: number;
  isActive?: boolean;
}

export interface IPartnerRoute {
  partnerId: Schema.Types.ObjectId;
  routeTitle: string;
  sourceLocation: ILocation;
  destinationLocation: ILocation;
  waypoints: ILocation[];
  stops: IRouteStop[];
  partnerType?: string;
  scheduledFrequency: 'daily' | 'alternate_days' | 'weekly' | 'on_demand';
  departureTime: string; // e.g. "08:00 AM"
  finalArrivalTime?: string; // e.g. "01:30 PM"
  travelDate?: string; // e.g. "Today" or "2026-10-03"
  vehicleType?: string; // e.g. "Bike"
  estimatedDurationHours: number;
  totalDistanceKm: number;
  capacityKg: number;
  availableCapacityKg: number;
  pricePerKg: number;
  status: 'active' | 'inactive' | 'full';
  sourceLocationId?: Schema.Types.ObjectId;
  destinationLocationId?: Schema.Types.ObjectId;
  isActive?: boolean;
}

export interface IPartnerRouteDocument extends IPartnerRoute, Document {}

export const RouteStopSchema = new Schema<IRouteStop>(
  {
    stopId: { type: String, required: true },
    stopOrder: { type: Number, required: true },
    name: { type: String, required: true },
    address: { type: String },
    village: { type: String },
    district: { type: String, default: 'Regional' },
    state: { type: String, default: 'Bihar' },
    pinCode: { type: String },
    landmark: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    expectedArrival: { type: String, default: '09:00 AM' },
    expectedDeparture: { type: String, default: '09:10 AM' },
    waitingMinutes: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const PartnerRouteSchema = new Schema<IPartnerRouteDocument>(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    routeTitle: { type: String, required: true },
    sourceLocation: { type: LocationSchema, required: true },
    destinationLocation: { type: LocationSchema, required: true },
    sourceLocationId: { type: Schema.Types.ObjectId, ref: 'PartnerLocation' },
    destinationLocationId: { type: Schema.Types.ObjectId, ref: 'PartnerLocation' },
    waypoints: [{ type: LocationSchema }],
    stops: [RouteStopSchema],
    partnerType: { type: String, default: 'transporter' },
    scheduledFrequency: {
      type: String,
      enum: ['daily', 'alternate_days', 'weekly', 'on_demand'],
      default: 'daily',
    },
    departureTime: { type: String, default: '08:00 AM' },
    finalArrivalTime: { type: String, default: '11:00 AM' },
    travelDate: { type: String, default: 'Today' },
    vehicleType: { type: String, default: 'Bike' },
    estimatedDurationHours: { type: Number, default: 3 },
    totalDistanceKm: { type: Number, default: 50 },
    capacityKg: { type: Number, required: true, default: 50 },
    availableCapacityKg: { type: Number, required: true, default: 50 },
    pricePerKg: { type: Number, required: true, default: 10 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'full'],
      default: 'active',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const PartnerRoute = model<IPartnerRouteDocument>('PartnerRoute', PartnerRouteSchema);
