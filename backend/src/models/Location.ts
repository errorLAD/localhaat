import { Schema, Document, model } from 'mongoose';

export interface ILocation {
  addressLine: string;
  villageOrCity: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactPhone?: string;
  landmark?: string;
}

export interface ILocationDocument extends ILocation, Document {}

export const LocationSchema = new Schema<ILocationDocument>(
  {
    addressLine: { type: String, required: true },
    villageOrCity: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, index: true },
    latitude: { type: Number, default: 28.6139 },
    longitude: { type: Number, default: 77.2090 },
    contactPerson: { type: String },
    contactPhone: { type: String },
    landmark: { type: String },
  },
  { timestamps: true }
);

export const Location = model<ILocationDocument>('Location', LocationSchema);
