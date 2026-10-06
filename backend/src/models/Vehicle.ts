import { Schema, Document, model } from 'mongoose';

export interface IVehicle {
  partnerId: Schema.Types.ObjectId;
  vehicleType: string;
  registrationNumber: string;
  modelName: string;
  maxCapacityKg: number;
  photoUrl?: string;
  numberPlatePhotoUrl?: string;
  rcDocUrl?: string;
  currentStatus: 'available' | 'in_transit' | 'maintenance' | 'inactive';
  currentCoordinates?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  insuranceValidTill?: Date;
  fitnessValidTill?: Date;
  driverId?: Schema.Types.ObjectId;
  driverName?: string;
  isActive?: boolean;
}

export interface IVehicleDocument extends IVehicle, Document {}

const VehicleSchema = new Schema<IVehicleDocument>(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    vehicleType: {
      type: String,
      default: 'Bike',
      required: true,
    },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    modelName: { type: String, required: true },
    maxCapacityKg: { type: Number, required: true, default: 500 },
    photoUrl: { type: String },
    numberPlatePhotoUrl: { type: String },
    rcDocUrl: { type: String },
    driverId: { type: Schema.Types.ObjectId, ref: 'PartnerDriver' },
    driverName: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    currentStatus: {
      type: String,
      enum: ['available', 'in_transit', 'maintenance', 'inactive'],
      default: 'available',
    },
    currentCoordinates: {
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.2090 },
      lastUpdated: { type: Date, default: Date.now },
    },
    insuranceValidTill: { type: Date },
    fitnessValidTill: { type: Date },
  },
  { timestamps: true }
);

export const Vehicle = model<IVehicleDocument>('Vehicle', VehicleSchema);
