import { Schema, Document, model } from 'mongoose';

export type TripStatus =
  | 'SCHEDULED'
  | 'READY'
  | 'MOVING'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';

export type TransportType =
  | 'Cycle'
  | 'Bike'
  | 'E-Rickshaw'
  | 'Auto'
  | 'Car'
  | 'Cab'
  | 'Van'
  | 'Pickup'
  | 'Truck'
  | 'Bus'
  | 'Approved Public Transport'
  | 'Other Approved Transport';

export type StopStatus =
  | 'UPCOMING'
  | 'ARRIVING'
  | 'ARRIVED'
  | 'DEPARTED'
  | 'SKIPPED'
  | 'CANCELLED';

export interface IScheduledStop {
  stopId: string; // e.g. "STOP-1", "STOP-001"
  stopOrder: number; // 1, 2, 3...
  name: string; // e.g. "Sakri"
  villageOrCity?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  expectedArrival: string; // e.g. "08:50 AM"
  expectedDeparture: string; // e.g. "09:00 AM"
  actualArrival?: Date;
  actualDeparture?: Date;
  waitingMinutes?: number; // e.g. 10
  status: StopStatus;
}

export interface IWaypoint {
  villageOrCity: string;
  district?: string;
  order: number;
  reachedAt?: Date;
  status: 'PENDING' | 'REACHED' | 'SKIPPED';
}

export interface ILogisticsTrip {
  tripId: string; // e.g. TRIP-302 or LH-TRP-10021
  partnerId: Schema.Types.ObjectId;
  partnerName: string;
  partnerMobile?: string;
  partnerType: 'PROFESSIONAL' | 'TRAVELLING';
  transportType: TransportType;
  vehicleId?: Schema.Types.ObjectId;
  vehicleType: string;
  vehicleNumber?: string;
  routeId?: Schema.Types.ObjectId;
  routeTitle: string;
  travelDate?: string; // e.g. "10 Oct 2026", "2026-10-10", or "Today"
  startLocation?: {
    name: string;
    villageOrCity?: string;
    address?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    departureTime: string; // e.g. "08:00 AM"
    actualDeparture?: Date;
    status?: 'PENDING' | 'WAITING' | 'DEPARTED';
  };
  finalDestination?: {
    name: string;
    villageOrCity?: string;
    address?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    expectedArrival: string; // e.g. "11:30 AM"
    actualArrival?: Date;
    status?: 'UPCOMING' | 'ARRIVED';
  };
  stops: IScheduledStop[];
  fromLocation: {
    villageOrCity: string;
    addressLine?: string;
    district?: string;
    coordinates?: [number, number];
  };
  toLocation: {
    villageOrCity: string;
    addressLine?: string;
    district?: string;
    coordinates?: [number, number];
  };
  waypoints: IWaypoint[];
  departureTime: string; // e.g. "02:10 PM"
  expectedArrival: string; // e.g. "04:15 PM"
  actualDeparture?: Date;
  actualArrival?: Date;
  tripStatus: TripStatus;
  totalCapacityKg: number;
  usedCapacityKg: number;
  availableCapacityKg: number;
  parcelIds: Schema.Types.ObjectId[];
  activeParcelCount: number;
  currentOperationalLocation: string; // e.g. "Benipur"
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  routeProgress: number; // 0 to 100 percentage
  estimatedEarnings: number;
  pricePerKg?: number;
  notes?: string;
}

export interface ILogisticsTripDocument extends ILogisticsTrip, Document {}

const WaypointSchema = new Schema<IWaypoint>(
  {
    villageOrCity: { type: String, required: true },
    district: { type: String },
    order: { type: Number, default: 1 },
    reachedAt: { type: Date },
    status: {
      type: String,
      enum: ['PENDING', 'REACHED', 'SKIPPED'],
      default: 'PENDING',
    },
  },
  { _id: false }
);

const ScheduledStopSchema = new Schema<IScheduledStop>(
  {
    stopId: { type: String, required: true },
    stopOrder: { type: Number, required: true, default: 1 },
    name: { type: String, required: true },
    villageOrCity: { type: String },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    expectedArrival: { type: String, required: true },
    expectedDeparture: { type: String, required: true },
    actualArrival: { type: Date },
    actualDeparture: { type: Date },
    waitingMinutes: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ['UPCOMING', 'ARRIVING', 'ARRIVED', 'DEPARTED', 'SKIPPED', 'CANCELLED'],
      default: 'UPCOMING',
    },
  },
  { _id: false }
);

const LogisticsTripSchema = new Schema<ILogisticsTripDocument>(
  {
    tripId: { type: String, required: true, unique: true, index: true },
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    partnerName: { type: String, required: true },
    partnerMobile: { type: String },
    partnerType: {
      type: String,
      enum: ['PROFESSIONAL', 'TRAVELLING'],
      default: 'PROFESSIONAL',
    },
    transportType: {
      type: String,
      default: 'Bike',
      required: true,
    },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    vehicleType: { type: String, default: 'Bike' },
    vehicleNumber: { type: String },
    routeId: { type: Schema.Types.ObjectId, ref: 'PartnerRoute' },
    routeTitle: { type: String, required: true },
    travelDate: { type: String, default: 'Today', index: true },
    startLocation: {
      name: { type: String },
      villageOrCity: { type: String },
      address: { type: String },
      district: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
      departureTime: { type: String, default: '08:00 AM' },
      actualDeparture: { type: Date },
      status: {
        type: String,
        enum: ['PENDING', 'WAITING', 'DEPARTED'],
        default: 'PENDING',
      },
    },
    finalDestination: {
      name: { type: String },
      villageOrCity: { type: String },
      address: { type: String },
      district: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
      expectedArrival: { type: String, default: '12:00 PM' },
      actualArrival: { type: Date },
      status: {
        type: String,
        enum: ['UPCOMING', 'ARRIVED'],
        default: 'UPCOMING',
      },
    },
    stops: [ScheduledStopSchema],
    fromLocation: {
      villageOrCity: { type: String, required: true },
      addressLine: { type: String },
      district: { type: String },
      coordinates: [{ type: Number }],
    },
    toLocation: {
      villageOrCity: { type: String, required: true },
      addressLine: { type: String },
      district: { type: String },
      coordinates: [{ type: Number }],
    },
    waypoints: [WaypointSchema],
    departureTime: { type: String, default: '09:00 AM' },
    expectedArrival: { type: String, default: '12:00 PM' },
    actualDeparture: { type: Date },
    actualArrival: { type: Date },
    tripStatus: {
      type: String,
      enum: ['SCHEDULED', 'READY', 'MOVING', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'DELAYED'],
      default: 'READY',
      index: true,
    },
    totalCapacityKg: { type: Number, required: true, default: 20 },
    usedCapacityKg: { type: Number, default: 0 },
    availableCapacityKg: { type: Number, default: 20 },
    parcelIds: [{ type: Schema.Types.ObjectId, ref: 'Parcel' }],
    activeParcelCount: { type: Number, default: 0 },
    currentOperationalLocation: { type: String, default: 'Starting Point' },
    gpsCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
      lastUpdated: { type: Date },
    },
    routeProgress: { type: Number, default: 0 },
    estimatedEarnings: { type: Number, default: 0 },
    pricePerKg: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

LogisticsTripSchema.pre('save', function (next) {
  // Sync startLocation <-> fromLocation
  if (this.startLocation && this.startLocation.name && !this.fromLocation?.villageOrCity) {
    this.fromLocation = {
      villageOrCity: this.startLocation.villageOrCity || this.startLocation.name,
      addressLine: this.startLocation.address,
      district: this.startLocation.district,
      coordinates: this.startLocation.latitude && this.startLocation.longitude ? [this.startLocation.longitude, this.startLocation.latitude] : undefined,
    };
  } else if (this.fromLocation && (!this.startLocation || !this.startLocation.name)) {
    this.startLocation = {
      name: this.fromLocation.villageOrCity,
      villageOrCity: this.fromLocation.villageOrCity,
      address: this.fromLocation.addressLine,
      district: this.fromLocation.district,
      departureTime: this.departureTime || '08:00 AM',
      status: this.tripStatus === 'MOVING' || this.tripStatus === 'COMPLETED' ? 'DEPARTED' : 'PENDING',
    };
  }

  // Sync finalDestination <-> toLocation
  if (this.finalDestination && this.finalDestination.name && !this.toLocation?.villageOrCity) {
    this.toLocation = {
      villageOrCity: this.finalDestination.villageOrCity || this.finalDestination.name,
      addressLine: this.finalDestination.address,
      district: this.finalDestination.district,
      coordinates: this.finalDestination.latitude && this.finalDestination.longitude ? [this.finalDestination.longitude, this.finalDestination.latitude] : undefined,
    };
  } else if (this.toLocation && (!this.finalDestination || !this.finalDestination.name)) {
    this.finalDestination = {
      name: this.toLocation.villageOrCity,
      villageOrCity: this.toLocation.villageOrCity,
      address: this.toLocation.addressLine,
      district: this.toLocation.district,
      expectedArrival: this.expectedArrival || '12:00 PM',
      status: this.tripStatus === 'COMPLETED' ? 'ARRIVED' : 'UPCOMING',
    };
  }

  // Sync stops <-> waypoints
  if (this.stops && this.stops.length > 0 && (!this.waypoints || this.waypoints.length === 0)) {
    this.waypoints = this.stops.map((s, idx) => ({
      villageOrCity: s.name,
      district: s.address,
      order: s.stopOrder || idx + 1,
      status: s.status === 'ARRIVED' || s.status === 'DEPARTED' ? 'REACHED' : s.status === 'SKIPPED' ? 'SKIPPED' : 'PENDING',
      reachedAt: s.actualArrival,
    }));
  } else if (this.waypoints && this.waypoints.length > 0 && (!this.stops || this.stops.length === 0)) {
    this.stops = this.waypoints.map((w, idx) => ({
      stopId: `STOP-${idx + 1}`,
      stopOrder: w.order || idx + 1,
      name: w.villageOrCity,
      villageOrCity: w.villageOrCity,
      address: w.district,
      expectedArrival: '10:00 AM',
      expectedDeparture: '10:10 AM',
      waitingMinutes: 10,
      status: w.status === 'REACHED' ? 'DEPARTED' : w.status === 'SKIPPED' ? 'SKIPPED' : 'UPCOMING',
      actualArrival: w.reachedAt,
    }));
  }

  next();
});

export const LogisticsTrip = model<ILogisticsTripDocument>('LogisticsTrip', LogisticsTripSchema);
