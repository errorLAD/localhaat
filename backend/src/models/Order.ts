import { Schema, Document, model } from 'mongoose';
import { ILocation, LocationSchema } from './Location.js';

export interface IOrderTimelineEvent {
  status: string;
  note: string;
  timestamp: Date;
  updatedBy: string;
}

export interface IOrder {
  orderNumber: string;
  customerId: Schema.Types.ObjectId;
  items: Schema.Types.ObjectId[];
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount?: number;
  couponCode?: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryAddress: ILocation;
  deliveryPin: string; // 4-digit code required by customer upon final handover
  paymentMethod: string;
  parcelId?: Schema.Types.ObjectId;
  notes?: string;
  timeline?: IOrderTimelineEvent[];
  placedAt: Date;
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {}

const TimelineEventSchema = new Schema<IOrderTimelineEvent>(
  {
    status: { type: String, required: true },
    note: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'System' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }],
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    paymentStatus: {
      type: String,
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      default: 'placed',
      index: true,
    },
    deliveryAddress: { type: LocationSchema, required: true },
    deliveryPin: { type: String, required: true },
    paymentMethod: {
      type: String,
      default: 'cod',
    },
    parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel' },
    notes: { type: String },
    timeline: [TimelineEventSchema],
    placedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export const Order = model<IOrderDocument>('Order', OrderSchema);
