import { Schema, Document, model } from 'mongoose';

export interface IInventoryLog {
  productId: Schema.Types.ObjectId;
  productTitle: string;
  sku?: string;
  changeType: 'ADD' | 'REMOVE' | 'ADJUST' | 'ORDER_DEDUCTION' | 'ORDER_RESTOCK';
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceNote?: string;
  operatorName: string;
}

export interface IInventoryLogDocument extends IInventoryLog, Document {}

const InventoryLogSchema = new Schema<IInventoryLogDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productTitle: { type: String, required: true },
    sku: { type: String },
    changeType: {
      type: String,
      enum: ['ADD', 'REMOVE', 'ADJUST', 'ORDER_DEDUCTION', 'ORDER_RESTOCK'],
      required: true,
      index: true,
    },
    quantityChanged: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, required: true },
    referenceNote: { type: String },
    operatorName: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

export const InventoryLog = model<IInventoryLogDocument>('InventoryLog', InventoryLogSchema);
