import { Schema, Document, model } from 'mongoose';

export interface IStoreSettings {
  storeName: string;
  storeTagline?: string;
  storeEmail: string;
  storePhone: string;
  address: {
    street: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  currency: string;
  taxGstRate: number;
  defaultDeliveryFee: number;
  freeDeliveryThreshold: number;
  lowStockThresholdDefault: number;
  enableCod: boolean;
  enableOnlinePayment: boolean;
  storeStatus: 'OPEN' | 'MAINTENANCE';
  supportHours?: string;
}

export interface IStoreSettingsDocument extends IStoreSettings, Document {}

const StoreSettingsSchema = new Schema<IStoreSettingsDocument>(
  {
    storeName: { type: String, default: 'LocalHaat Rural Direct Store' },
    storeTagline: { type: String, default: 'Authentic Village Haat Commerce Delivered Direct' },
    storeEmail: { type: String, default: 'support@localhaat.in' },
    storePhone: { type: String, default: '+91 9999900001' },
    address: {
      street: { type: String, default: 'Main Haat Warehouse, GT Road' },
      city: { type: String, default: 'Varanasi' },
      district: { type: String, default: 'Varanasi' },
      state: { type: String, default: 'Uttar Pradesh' },
      pincode: { type: String, default: '221001' },
    },
    currency: { type: String, default: 'INR' },
    taxGstRate: { type: Number, default: 5 },
    defaultDeliveryFee: { type: Number, default: 40 },
    freeDeliveryThreshold: { type: Number, default: 499 },
    lowStockThresholdDefault: { type: Number, default: 5 },
    enableCod: { type: Boolean, default: true },
    enableOnlinePayment: { type: Boolean, default: true },
    storeStatus: { type: String, enum: ['OPEN', 'MAINTENANCE'], default: 'OPEN' },
    supportHours: { type: String, default: 'Mon - Sun: 7:00 AM - 9:00 PM' },
  },
  { timestamps: true }
);

export const StoreSettings = model<IStoreSettingsDocument>('StoreSettings', StoreSettingsSchema);
