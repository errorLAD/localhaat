import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { BusinessAccount } from '../models/BusinessAccount.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, village, minPrice, maxPrice, isOrganic, sort } = req.query;
    const filter: any = { status: 'active' };

    if (category) {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) filter.categoryId = catDoc._id;
    }

    if (village) {
      filter.originVillage = { $regex: new RegExp(String(village), 'i') };
    }

    if (isOrganic === 'true') {
      filter.isOrganic = true;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } },
        { originVillage: { $regex: String(search), $options: 'i' } },
        { tags: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    let query = Product.find(filter)
      .populate('categoryId', 'name slug icon image description')
      .populate('subcategoryId', 'name slug');

    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    const products = await query.exec();
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('categoryId')
      .populate('subcategoryId')
      .populate('sellerId', 'name phone email');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let business = await BusinessAccount.findOne({ userId: req.user._id });
    if (!business) {
      // Auto-create basic business account for seller if not yet provisioned
      business = await BusinessAccount.create({
        userId: req.user._id,
        businessName: `${req.user.name}'s Farm & Craft Enterprise`,
        contactPhone: req.user.phone,
        registeredAddress: req.user.defaultLocation || {
          addressLine: 'Main Haat Bazaar',
          villageOrCity: 'Sonapur',
          district: 'Varanasi',
          state: 'Uttar Pradesh',
          pincode: '221001',
        },
        categorySpecialty: ['Organic Produce', 'Rural Crafts'],
      });
    }

    const {
      title,
      description,
      categoryId,
      price,
      discountPrice,
      stock,
      unit,
      weightKg,
      images,
      originVillage,
      originDistrict,
      originState,
      isOrganic,
      tags,
    } = req.body;

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      title,
      slug,
      description,
      categoryId,
      businessAccountId: business._id,
      sellerId: req.user._id,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock) || 10,
      unit: unit || 'kg',
      weightKg: Number(weightKg) || 1.0,
      images: images || ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'],
      originVillage: originVillage || 'Sonapur',
      originDistrict: originDistrict || 'Varanasi',
      originState: originState || 'Uttar Pradesh',
      isOrganic: Boolean(isOrganic),
      tags: tags || [],
      status: 'active',
    });

    return res.status(201).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true, parentCategoryId: null }).sort({ displayOrder: 1, createdAt: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
