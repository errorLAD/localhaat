import { Schema, Document, model } from 'mongoose';

export type DisputeReason =
  | 'LOST_ITEM'
  | 'DAMAGED_ITEM'
  | 'DELAYED_DELIVERY'
  | 'PAYMENT_ISSUE'
  | 'INCORRECT_ADDRESS'
  | 'PARTNER_UNRESPONSIVE'
  | 'OTHER';

export type DisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';

export interface IParcelDispute {
  parcelId: Schema.Types.ObjectId;
  disputeNumber: string;
  raisedByRole: 'CUSTOMER' | 'PARTNER' | 'AGENT' | 'ADMIN';
  raisedByUserId?: Schema.Types.ObjectId;
  reason: DisputeReason;
  description: string;
  evidencePhotoUrl?: string;
  status: DisputeStatus;
  claimAmount?: number;
  refundApprovedAmount?: number;
  resolutionNotes?: string;
  resolvedByUserId?: Schema.Types.ObjectId;
  resolvedAt?: Date;
}

export interface IParcelDisputeDocument extends IParcelDispute, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ParcelDisputeSchema = new Schema<IParcelDisputeDocument>(
  {
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', required: true, index: true },
    disputeNumber: { type: String, required: true, unique: true, index: true },
    raisedByRole: {
      type: String,
      enum: ['CUSTOMER', 'PARTNER', 'AGENT', 'ADMIN'],
      default: 'CUSTOMER',
      required: true,
    },
    raisedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: {
      type: String,
      enum: [
        'LOST_ITEM',
        'DAMAGED_ITEM',
        'DELAYED_DELIVERY',
        'PAYMENT_ISSUE',
        'INCORRECT_ADDRESS',
        'PARTNER_UNRESPONSIVE',
        'OTHER',
      ],
      default: 'OTHER',
      required: true,
    },
    description: { type: String, required: true },
    evidencePhotoUrl: { type: String },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED'],
      default: 'OPEN',
      index: true,
    },
    claimAmount: { type: Number, default: 0 },
    refundApprovedAmount: { type: Number, default: 0 },
    resolutionNotes: { type: String },
    resolvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const ParcelDispute = model<IParcelDisputeDocument>('ParcelDispute', ParcelDisputeSchema);
