import { Schema, Document, model } from 'mongoose';

export type PartnerShopType =
  | 'General Store'
  | 'Hardware Store'
  | 'Grocery Store'
  | 'Warehouse'
  | 'Logistics Point'
  | 'Collection Point'
  | 'Delivery Point'
  | 'Local Business'
  | 'Other';

export interface IPartnerShop {
  partnerId: Schema.Types.ObjectId;
  name: string;
  photo?: string;
  ownerName: string;
  mobile: string;
  email?: string;
  address: string;
  village: string;
  area?: string;
  block?: string;
  district: string;
  state: string;
  pinCode: string;
  landmark?: string;
  shopType: PartnerShopType;
  openingTime?: string;
  closingTime?: string;
  availableDays?: string[];
  pickupAvailable: boolean;
  dropAvailable: boolean;
  parcelHoldingAvailable: boolean;
  holdingCapacity?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPartnerShopDocument extends IPartnerShop, Document {}

export const PartnerShopSchema = new Schema<IPartnerShopDocument>(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    name: { type: String, required: true, trim: true },
    photo: { type: String },
    ownerName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    block: { type: String, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, default: 'Bihar', trim: true },
    pinCode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    shopType: {
      type: String,
      enum: [
        'General Store',
        'Hardware Store',
        'Grocery Store',
        'Warehouse',
        'Logistics Point',
        'Collection Point',
        'Delivery Point',
        'Local Business',
        'Other',
      ],
      default: 'Logistics Point',
      required: true,
    },
    openingTime: { type: String, default: '08:00 AM' },
    closingTime: { type: String, default: '08:00 PM' },
    availableDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    pickupAvailable: { type: Boolean, default: true },
    dropAvailable: { type: Boolean, default: true },
    parcelHoldingAvailable: { type: Boolean, default: true },
    holdingCapacity: { type: String, default: '100 Parcels / 500 kg' },
    latitude: { type: Number },
    longitude: { type: Number },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const PartnerShop = model<IPartnerShopDocument>('PartnerShop', PartnerShopSchema);
