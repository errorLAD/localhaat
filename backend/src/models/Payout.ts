import { Schema, Document, model } from 'mongoose';

export interface IPayout {
  actorType: 'PARTNER' | 'AGENT' | 'SELLER';
  actorId: Schema.Types.ObjectId;
  amount: number;
  paymentMode: 'UPI' | 'BANK_TRANSFER';
  beneficiaryDetails: {
    upiId?: string;
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  transactionRef?: string;
  rejectionReason?: string;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: Schema.Types.ObjectId;
}

export interface IPayoutDocument extends IPayout, Document {}

const PayoutSchema = new Schema<IPayoutDocument>(
  {
    actorType: {
      type: String,
      enum: ['PARTNER', 'AGENT', 'SELLER'],
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 100 },
    paymentMode: {
      type: String,
      enum: ['UPI', 'BANK_TRANSFER'],
      default: 'UPI',
    },
    beneficiaryDetails: {
      upiId: { type: String },
      accountName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'processed', 'rejected'],
      default: 'pending',
      index: true,
    },
    transactionRef: { type: String },
    rejectionReason: { type: String },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Payout = model<IPayoutDocument>('Payout', PayoutSchema);
