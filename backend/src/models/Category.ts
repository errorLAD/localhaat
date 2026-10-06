import { Schema, Document, model } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategoryId?: Schema.Types.ObjectId;
  isActive: boolean;
  displayOrder: number;
}

export interface ICategoryDocument extends ICategory, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    icon: { type: String },
    image: { type: String },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = model<ICategoryDocument>('Category', CategorySchema);
