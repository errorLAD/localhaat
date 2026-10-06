import { Schema, Document, model } from 'mongoose';

export interface IPartnerDriver {
  partnerId: Schema.Types.ObjectId;
  name: string;
  phone: string;
  aadhaarNumber?: string;
  aadhaarDocUrl?: string;
  licenseNumber?: string;
  licenseDocUrl?: string;
  photoUrl?: string;
  assignedVehicleId?: Schema.Types.ObjectId;
  assignedVehicleNumber?: string;
  status: 'active' | 'inactive' | 'on_trip';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPartnerDriverDocument extends IPartnerDriver, Document {}

export const PartnerDriverSchema = new Schema<IPartnerDriverDocument>(
  {
    partnerId: { type: Schema.Types.ObjectId, ref: 'LogisticsPartner', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    aadhaarNumber: { type: String, trim: true },
    aadhaarDocUrl: { type: String },
    licenseNumber: { type: String, trim: true },
    licenseDocUrl: { type: String },
    photoUrl: { type: String },
    assignedVehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedVehicleNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_trip'],
      default: 'active',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const PartnerDriver = model<IPartnerDriverDocument>('PartnerDriver', PartnerDriverSchema);
