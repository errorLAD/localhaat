import { Schema, Document, model } from 'mongoose';

export interface IReview {
  productId: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  customerName: string;
  rating: number;
  review: string;
  status: 'APPROVED' | 'HIDDEN' | 'PENDING';
}

export interface IReviewDocument extends IReview, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    status: {
      type: String,
      enum: ['APPROVED', 'HIDDEN', 'PENDING'],
      default: 'APPROVED',
      index: true,
    },
  },
  { timestamps: true }
);

export const Review = model<IReviewDocument>('Review', ReviewSchema);
