import { Schema, Document, model } from 'mongoose';

export type PartnerCategory = 'PROFESSIONAL' | 'TRAVELLING';
export type LogisticsPartnerStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'AVAILABLE'
  | 'MOVING'
  | 'ON_DELIVERY'
  | 'AT_PICKUP'
  | 'WAITING'
  | 'AT_HUB'
  | 'SUSPENDED'
  | 'BLOCKED';

export type LogisticsVerificationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'BLOCKED';

export interface ILogisticsPartner {
  userId: Schema.Types.ObjectId;
  partnerCode: string; // e.g. LP-9021
  businessName: string;
  partnerType: 'individual' | 'transporter' | 'fleet_owner' | 'hub_operator';
  partnerCategory: PartnerCategory;
  partnerStatus: LogisticsPartnerStatus;
  verificationStatus: LogisticsVerificationStatus;
  phone?: string;
  email?: string;
  profilePhotoUrl?: string;
  address?: {
    addressLine?: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  primaryTransportType?: string; // Bike, Auto, Pickup, Bus, etc.
  vehicleNumber?: string;
  capacityKg?: number;
  serviceAreas: string[]; // Districts or pincodes
  vehicleIds: Schema.Types.ObjectId[];
  rating: number;
  totalTrips: number;
  totalParcelsDelivered: number;
  activeParcelsCount: number;
  isActive: boolean;
  isOnline: boolean;
  isVerified: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
    locationName?: string;
  };
  commissionRatePerKm: number;
  baseDeliveryFee: number;
  walletBalance: number;
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  documents?: Array<{
    docType: string;
    documentNumber?: string;
    fileUrl: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    verifiedAt?: Date;
    rejectionReason?: string;
  }>;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  vehiclePhotoUrl?: string;
  numberPlatePhotoUrl?: string;
  driverDetails?: {
    isDriver: boolean;
    driverName?: string;
    driverPhone?: string;
    driverAadhaarNumber?: string;
    driverAadhaarDocUrl?: string;
    driverLicenseNumber?: string;
    driverLicenseDocUrl?: string;
  };
  rejectionReason?: string;
  suspensionReason?: string;
}

export interface ILogisticsPartnerDocument extends ILogisticsPartner, Document {}

const LogisticsPartnerSchema = new Schema<ILogisticsPartnerDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    partnerCode: { type: String, unique: true, sparse: true, index: true },
    businessName: { type: String, required: true, trim: true },
    partnerType: {
      type: String,
      enum: ['individual', 'transporter', 'fleet_owner', 'hub_operator'],
      default: 'transporter',
    },
    partnerCategory: {
      type: String,
      enum: ['PROFESSIONAL', 'TRAVELLING'],
      default: 'PROFESSIONAL',
      index: true,
    },
    partnerStatus: {
      type: String,
      enum: [
        'ONLINE',
        'OFFLINE',
        'AVAILABLE',
        'MOVING',
        'ON_DELIVERY',
        'AT_PICKUP',
        'WAITING',
        'AT_HUB',
        'SUSPENDED',
        'BLOCKED',
      ],
      default: 'AVAILABLE',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'SUSPENDED', 'BLOCKED'],
      default: 'PENDING',
      index: true,
    },
    phone: { type: String },
    email: { type: String },
    profilePhotoUrl: { type: String },
    address: {
      addressLine: { type: String },
      village: { type: String },
      district: { type: String },
      state: { type: String, default: 'Bihar' },
      pincode: { type: String },
    },
    primaryTransportType: { type: String, default: 'Bike' },
    vehicleNumber: { type: String },
    capacityKg: { type: Number, default: 25 },
    serviceAreas: [{ type: String }],
    vehicleIds: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
    rating: { type: Number, default: 4.9 },
    totalTrips: { type: Number, default: 0 },
    totalParcelsDelivered: { type: Number, default: 0 },
    activeParcelsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      lastUpdated: { type: Date, default: Date.now },
      locationName: { type: String },
    },
    commissionRatePerKm: { type: Number, default: 12 },
    baseDeliveryFee: { type: Number, default: 40 },
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    pendingPayouts: { type: Number, default: 0 },
    completedPayouts: { type: Number, default: 0 },
    documents: [
      {
        docType: { type: String },
        documentNumber: { type: String },
        fileUrl: { type: String },
        status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
        verifiedAt: { type: Date },
        rejectionReason: { type: String },
      },
    ],
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String },
    },
    vehiclePhotoUrl: { type: String },
    numberPlatePhotoUrl: { type: String },
    driverDetails: {
      isDriver: { type: Boolean, default: true },
      driverName: { type: String },
      driverPhone: { type: String },
      driverAadhaarNumber: { type: String },
      driverAadhaarDocUrl: { type: String },
      driverLicenseNumber: { type: String },
      driverLicenseDocUrl: { type: String },
    },
    rejectionReason: { type: String },
    suspensionReason: { type: String },
  },
  { timestamps: true }
);

// Pre-save to ensure partnerCode exists
LogisticsPartnerSchema.pre('save', function (next) {
  if (!this.partnerCode) {
    this.partnerCode = 'LP-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

export const LogisticsPartner = model<ILogisticsPartnerDocument>('LogisticsPartner', LogisticsPartnerSchema);
