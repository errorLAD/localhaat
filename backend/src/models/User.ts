import { Schema, Document, model } from 'mongoose';
import { ILocation, LocationSchema } from './Location.js';

export type UserRole = 'customer' | 'logistics_partner' | 'village_agent' | 'business' | 'admin';
export type KycStatus = 'pending' | 'verified' | 'rejected';

export interface IUser {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  defaultLocation?: ILocation;
  kycStatus: KycStatus;
  otpCode?: string;
  otpExpiresAt?: Date;
  businessAccountId?: Schema.Types.ObjectId;
  villageAgentId?: Schema.Types.ObjectId;
  logisticsPartnerId?: Schema.Types.ObjectId;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['customer', 'logistics_partner', 'village_agent', 'business', 'admin'],
      default: 'customer',
      required: true,
      index: true,
    },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    defaultLocation: { type: LocationSchema },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    businessAccountId: { type: Schema.Types.ObjectId, ref: 'BusinessAccount' },
    villageAgentId: { type: Schema.Types.ObjectId, ref: 'VillageAgent' },
    logisticsPartnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner' },
  },
  { timestamps: true }
);

export const User = model<IUserDocument>('User', UserSchema);
