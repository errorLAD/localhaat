import { Schema, Document, model } from 'mongoose';

export interface ISubcategory {
  name: string;
  slug: string;
  categoryId: Schema.Types.ObjectId;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ISubcategoryDocument extends ISubcategory, Document {}

const SubcategorySchema = new Schema<ISubcategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Subcategory = model<ISubcategoryDocument>('Subcategory', SubcategorySchema);
