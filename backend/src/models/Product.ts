import { Schema, Document, model } from 'mongoose';

export interface IProduct {
  title: string;
  sku?: string;
  slug: string;
  categoryId: Schema.Types.ObjectId;
  subcategoryId?: Schema.Types.ObjectId;
  businessAccountId?: Schema.Types.ObjectId;
  sellerId?: Schema.Types.ObjectId;
  brand?: string;
  shortDescription?: string;
  description: string;
  mrp?: number;
  price: number;
  discountPrice?: number;
  taxPercent?: number;
  stock: number;
  lowStockThreshold?: number;
  unit: string; // 'kg', 'gram', 'litre', 'piece', 'pack', etc.
  weightKg: number;
  dimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  images: string[];
  thumbnail?: string;
  videoUrl?: string;
  availableLocations?: string[];
  originVillage: string;
  originDistrict: string;
  originState: string;
  status: 'draft' | 'active' | 'out_of_stock' | 'inactive';
  isFeatured?: boolean;
  isOrganic?: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface IProductDocument extends IProduct, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    title: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: 'Subcategory', index: true },
    businessAccountId: { type: Schema.Types.ObjectId, ref: 'BusinessAccount', index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    brand: { type: String, default: 'LocalHaat Select' },
    shortDescription: { type: String },
    description: { type: String, required: true },
    mrp: { type: Number },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    taxPercent: { type: Number, default: 5 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    unit: { type: String, default: 'kg' },
    weightKg: { type: Number, required: true, default: 1.0 },
    dimensions: {
      lengthCm: { type: Number, default: 15 },
      widthCm: { type: Number, default: 15 },
      heightCm: { type: Number, default: 15 },
    },
    images: [{ type: String }],
    thumbnail: { type: String },
    videoUrl: { type: String },
    availableLocations: [{ type: String }],
    originVillage: { type: String, default: 'Sonapur' },
    originDistrict: { type: String, default: 'Varanasi' },
    originState: { type: String, default: 'Uttar Pradesh' },
    status: {
      type: String,
      enum: ['draft', 'active', 'out_of_stock', 'inactive'],
      default: 'active',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    isOrganic: { type: Boolean, default: false },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ title: 'text', description: 'text', originVillage: 'text', sku: 'text' });

export const Product = model<IProductDocument>('Product', ProductSchema);
