import { Schema, Document, model } from 'mongoose';
import { ILocation, LocationSchema } from './Location.js';

export type AgentStatus = 'ACTIVE' | 'OFFLINE' | 'SUSPENDED' | 'BLOCKED' | 'DEACTIVATED';
export type AgentOperationalStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'ON_DELIVERY'
  | 'RECEIVING_PACKAGE'
  | 'WAITING'
  | 'SUSPENDED'
  | 'BLOCKED';
export type AgentVerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface IVillageAgent {
  userId: Schema.Types.ObjectId;
  villageName: string;
  hubCode: string;
  servingVillages: string[];
  hubAddress: ILocation;
  commissionPerDelivery: number;
  activeParcelsCount: number;
  cashInHand: number;
  isAvailable: boolean;
  isOnline: boolean;
  rating: number;
  totalDelivered: number;
  workingHours: string;
  status: AgentStatus;
  operationalStatus: AgentOperationalStatus;
  verificationStatus: AgentVerificationStatus;
  lastActiveAt: Date;
  currentPackageId?: Schema.Types.ObjectId;
  suspensionReason?: string;
  suspensionDuration?: string;
  suspensionEndDate?: Date;
  blockedReason?: string;
  internalNotes?: string;
  deactivatedAt?: Date;
  deactivatedReason?: string;
  liveLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
    isSharing: boolean;
  };
  bankDetails?: {
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
}

export interface IVillageAgentDocument extends IVillageAgent, Document {}

const VillageAgentSchema = new Schema<IVillageAgentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    villageName: { type: String, required: true, index: true },
    hubCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    servingVillages: [{ type: String, index: true }],
    hubAddress: { type: LocationSchema, required: true },
    commissionPerDelivery: { type: Number, default: 25 }, // INR per last-mile parcel
    activeParcelsCount: { type: Number, default: 0 },
    cashInHand: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 4.9 },
    totalDelivered: { type: Number, default: 0 },
    workingHours: { type: String, default: '08:00 AM - 07:00 PM' },
    status: {
      type: String,
      enum: ['ACTIVE', 'OFFLINE', 'SUSPENDED', 'BLOCKED', 'DEACTIVATED'],
      default: 'ACTIVE',
      index: true,
    },
    operationalStatus: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'ON_DELIVERY', 'RECEIVING_PACKAGE', 'WAITING', 'SUSPENDED', 'BLOCKED'],
      default: 'ONLINE',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'],
      default: 'VERIFIED',
      index: true,
    },
    lastActiveAt: { type: Date, default: Date.now },
    currentPackageId: { type: Schema.Types.ObjectId, ref: 'Parcel' },
    suspensionReason: { type: String },
    suspensionDuration: { type: String },
    suspensionEndDate: { type: Date },
    blockedReason: { type: String },
    internalNotes: { type: String },
    deactivatedAt: { type: Date },
    deactivatedReason: { type: String },
    liveLocation: {
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.209 },
      updatedAt: { type: Date, default: Date.now },
      isSharing: { type: Boolean, default: true },
    },
    bankDetails: {
      accountHolder: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String },
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
  },
  { timestamps: true }
);

export const VillageAgent = model<IVillageAgentDocument>('VillageAgent', VillageAgentSchema);
