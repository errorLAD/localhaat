import { Schema, Document, model } from 'mongoose';
import { ILocation, LocationSchema } from './Location.js';

export interface IBusinessAccount {
  userId: Schema.Types.ObjectId;
  businessName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  businessType: 'enterprise_shipper' | 'wholesaler' | 'fmcg_distributor' | 'farmer_producer_org' | 'local_manufacturer' | 'other';
  gstin?: string;
  pan?: string;
  registeredAddress: ILocation;
  pickupLocations: ILocation[];
  status: 'active' | 'inactive' | 'suspended';
  creditLimit: number;
  totalSpend: number;
  totalShipments: number;
  rating: number;
  isVerified: boolean;
  notes?: string;
}

export interface IBusinessAccountDocument extends IBusinessAccount, Document {}

const BusinessAccountSchema = new Schema<IBusinessAccountDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessName: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: 'Authorized Representative', trim: true },
    contactPhone: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    businessType: {
      type: String,
      enum: ['enterprise_shipper', 'wholesaler', 'fmcg_distributor', 'farmer_producer_org', 'local_manufacturer', 'other'],
      default: 'enterprise_shipper',
    },
    gstin: { type: String, trim: true },
    pan: { type: String, trim: true },
    registeredAddress: { type: LocationSchema, required: true },
    pickupLocations: [{ type: LocationSchema }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    creditLimit: { type: Number, default: 25000 },
    totalSpend: { type: Number, default: 0 },
    totalShipments: { type: Number, default: 0 },
    rating: { type: Number, default: 4.9 },
    isVerified: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const BusinessAccount = model<IBusinessAccountDocument>('BusinessAccount', BusinessAccountSchema);
