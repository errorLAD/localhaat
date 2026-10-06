import { Schema, Document, model } from 'mongoose';

export type ActorType = 'PARTNER' | 'AGENT' | 'SELLER';
export type EarningStatus = 'pending' | 'available' | 'requested' | 'paid';

export interface IEarning {
  actorType: ActorType;
  actorId: Schema.Types.ObjectId; // User ID of partner, agent or seller
  referenceType: 'ORDER' | 'PARCEL' | 'SHIPMENT_LEG';
  referenceId: string;
  baseAmount: number;
  bonus: number;
  deduction: number;
  netAmount: number;
  status: EarningStatus;
  remarks?: string;
  clearedAt?: Date;
}

export interface IEarningDocument extends IEarning, Document {}

const EarningSchema = new Schema<IEarningDocument>(
  {
    actorType: {
      type: String,
      enum: ['PARTNER', 'AGENT', 'SELLER'],
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referenceType: {
      type: String,
      enum: ['ORDER', 'PARCEL', 'SHIPMENT_LEG'],
      required: true,
    },
    referenceId: { type: String, required: true },
    baseAmount: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'available', 'requested', 'paid'],
      default: 'available',
      index: true,
    },
    remarks: { type: String },
    clearedAt: { type: Date },
  },
  { timestamps: true }
);

export const Earning = model<IEarningDocument>('Earning', EarningSchema);
