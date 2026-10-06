import { Schema, Document, model } from 'mongoose';

export type PartnerLocationType =
  | 'Home'
  | 'Shop'
  | 'Warehouse'
  | 'Office'
  | 'Hub'
  | 'Pickup Point'
  | 'Drop Point'
  | 'Other';

export interface IPartnerLocation {
  partnerId: Schema.Types.ObjectId;
  name: string;
  locationType: PartnerLocationType;
  isPickup: boolean;
  isDrop: boolean;
  address: string;
  village?: string;
  area?: string;
  block?: string;
  district: string;
  state: string;
  pinCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactMobile?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPartnerLocationDocument extends IPartnerLocation, Document {}

export const PartnerLocationSchema = new Schema<IPartnerLocationDocument>(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    name: { type: String, required: true, trim: true },
    locationType: {
      type: String,
      enum: ['Home', 'Shop', 'Warehouse', 'Office', 'Hub', 'Pickup Point', 'Drop Point', 'Other'],
      default: 'Pickup Point',
      required: true,
    },
    isPickup: { type: Boolean, default: true },
    isDrop: { type: Boolean, default: true },
    address: { type: String, required: true, trim: true },
    village: { type: String, trim: true },
    area: { type: String, trim: true },
    block: { type: String, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, default: 'Bihar', trim: true },
    pinCode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    contactName: { type: String, trim: true },
    contactMobile: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const PartnerLocation = model<IPartnerLocationDocument>('PartnerLocation', PartnerLocationSchema);
