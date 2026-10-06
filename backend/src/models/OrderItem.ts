import { Schema, Document, model } from 'mongoose';

export interface IOrderItem {
  orderId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  sellerId: Schema.Types.ObjectId;
  businessAccountId?: Schema.Types.ObjectId;
  productTitle: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  weightKg: number;
  status: 'pending' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
}

export interface IOrderItemDocument extends IOrderItem, Document {}

export const OrderItemSchema = new Schema<IOrderItemDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessAccountId: { type: Schema.Types.ObjectId, ref: 'BusinessAccount' },
    productTitle: { type: String, required: true },
    productImage: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    weightKg: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: ['pending', 'packed', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const OrderItem = model<IOrderItemDocument>('OrderItem', OrderItemSchema);
