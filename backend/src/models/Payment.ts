import { Schema, Document, model } from 'mongoose';

export interface IPayment {
  orderId?: Schema.Types.ObjectId;
  parcelId?: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  amount: number;
  currency: string;
  provider: 'RAZORPAY' | 'CASH_ON_DELIVERY' | 'UPI_DIRECT' | 'CASH_TO_PARTNER';
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CASH_PENDING' | 'CASH_CONFIRMED';
  metadata?: Record<string, any>;
  paidAt?: Date;
}

export interface IPaymentDocument extends IPayment, Document {}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    provider: {
      type: String,
      enum: ['RAZORPAY', 'CASH_ON_DELIVERY', 'UPI_DIRECT', 'CASH_TO_PARTNER'],
      default: 'RAZORPAY',
    },
    providerOrderId: { type: String },
    providerPaymentId: { type: String },
    providerSignature: { type: String },
    status: {
      type: String,
      enum: ['INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED', 'CASH_PENDING', 'CASH_CONFIRMED'],
      default: 'INITIATED',
      index: true,
    },
    metadata: { type: Schema.Types.Mixed },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = model<IPaymentDocument>('Payment', PaymentSchema);
