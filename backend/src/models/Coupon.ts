import { Schema, Document, model } from 'mongoose';

export interface ICoupon {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  startDate: Date;
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  customerUsageLimit: number;
  isActive: boolean;
}

export interface ICouponDocument extends ICoupon, Document {}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    customerUsageLimit: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = model<ICouponDocument>('Coupon', CouponSchema);
