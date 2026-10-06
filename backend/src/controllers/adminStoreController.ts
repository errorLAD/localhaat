import { Request, Response } from 'express';
import {
  Category,
  Subcategory,
  Product,
  Order,
  OrderItem,
  Payment,
  User,
  InventoryLog,
  Coupon,
  Review,
  StoreSettings,
  Parcel,
  ShipmentLeg,
  TrackingEvent,
  LogisticsPartner,
} from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

/* ==========================================================================
   1. E-COMMERCE DASHBOARD & ANALYTICS
   ========================================================================== */
export const getStoreDashboardStats = async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      orders,
      todayOrders,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
      categories,
    ] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }),
      Order.find({ createdAt: { $gte: todayStart } }),
      Product.countDocuments({}),
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ stock: { $lte: 0 } }),
      User.countDocuments({ role: 'customer' }),
      Category.find({}),
    ]);

    // Financial & status aggregations
    let totalSales = 0;
    let todaySales = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let refundedOrders = 0;

    const statusCounts: Record<string, number> = {};

    orders.forEach((ord) => {
      const st = (ord.orderStatus || 'pending').toLowerCase();
      statusCounts[st] = (statusCounts[st] || 0) + 1;

      if (!['cancelled', 'refunded'].includes(st)) {
        totalSales += ord.totalAmount || 0;
      }

      if (['placed', 'pending'].includes(st)) pendingOrders++;
      else if (['processing', 'confirmed', 'packed', 'ready_for_pickup', 'logistics_assigned'].includes(st))
        processingOrders++;
      else if (['shipped', 'in_transit', 'dispatched', 'out_for_delivery'].includes(st)) shippedOrders++;
      else if (st === 'delivered') deliveredOrders++;
      else if (st === 'cancelled') cancelledOrders++;
      else if (st === 'refunded') refundedOrders++;
    });

    todayOrders.forEach((ord) => {
      const st = (ord.orderStatus || 'pending').toLowerCase();
      if (!['cancelled', 'refunded'].includes(st)) {
        todaySales += ord.totalAmount || 0;
      }
    });

    // 7-day Sales & Orders over time
    const last7Days: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const dayOrders = orders.filter((o) => {
        const oDate = new Date((o as any).createdAt || (o as any).placedAt).toISOString().split('T')[0];
        return oDate === dateStr;
      });

      const daySales = dayOrders.reduce((sum, o) => {
        const st = (o.orderStatus || '').toLowerCase();
        return !['cancelled', 'refunded'].includes(st) ? sum + (o.totalAmount || 0) : sum;
      }, 0);

      last7Days.push({
        date: dayLabel,
        sales: daySales,
        orders: dayOrders.length,
      });
    }

    // Top selling products & category sales
    const orderItems = await OrderItem.find({}).populate('productId');
    const productSalesMap: Record<string, { title: string; count: number; revenue: number; image?: string }> = {};
    const categorySalesMap: Record<string, { name: string; count: number; revenue: number }> = {};

    orderItems.forEach((item: any) => {
      const pId = item.productId?._id?.toString() || item.productId?.toString();
      const title = item.productTitle || item.productId?.title || 'Unknown Product';
      const qty = item.quantity || 1;
      const rev = item.subtotal || (item.unitPrice || 0) * qty;

      if (!productSalesMap[pId]) {
        productSalesMap[pId] = { title, count: 0, revenue: 0, image: item.productImage || item.productId?.images?.[0] };
      }
      productSalesMap[pId].count += qty;
      productSalesMap[pId].revenue += rev;

      // Category
      const catId = item.productId?.categoryId?.toString();
      const cat = categories.find((c) => c._id.toString() === catId);
      const catName = cat ? cat.name : 'General Store';

      if (!categorySalesMap[catName]) {
        categorySalesMap[catName] = { name: catName, count: 0, revenue: 0 };
      }
      categorySalesMap[catName].count += qty;
      categorySalesMap[catName].revenue += rev;
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const categorySales = Object.values(categorySalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      stats: {
        totalSales,
        todaySales,
        totalOrders: orders.length,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        refundedOrders,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCustomers,
      },
      charts: {
        salesOverTime: last7Days,
        topSellingProducts,
        categorySales,
        orderStatusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
          status: status.toUpperCase(),
          count,
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   2. CATEGORIES MANAGEMENT
   ========================================================================== */
export const getAdminCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ parentCategoryId: null }).sort({ displayOrder: 1, createdAt: -1 });
    const productCounts = await Product.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    productCounts.forEach((c) => {
      countMap[c._id?.toString()] = c.count;
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat._id.toString()] || 0,
    }));

    return res.status(200).json({ success: true, categories: categoriesWithCount });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, icon, isActive = true, displayOrder = 0 } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const exists = await Category.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      icon,
      isActive,
      displayOrder,
      parentCategoryId: null,
    });

    return res.status(201).json({ success: true, category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image, icon, isActive, displayOrder } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
      { new: true }
    );

    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.status(200).json({ success: true, category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hasProducts = await Product.countDocuments({ categoryId: id });
    if (hasProducts > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${hasProducts} associated products. Reassign products first.`,
      });
    }

    await Subcategory.deleteMany({ categoryId: id });
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   3. SUBCATEGORIES MANAGEMENT
   ========================================================================== */
export const getAdminSubcategories = async (req: Request, res: Response) => {
  try {
    const subcategories = await Subcategory.find({})
      .populate('categoryId', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 });

    const productCounts = await Product.aggregate([
      { $match: { subcategoryId: { $exists: true, $ne: null } } },
      { $group: { _id: '$subcategoryId', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    productCounts.forEach((c) => {
      countMap[c._id?.toString()] = c.count;
    });

    const subsWithCount = subcategories.map((sub) => ({
      ...sub.toObject(),
      productCount: countMap[sub._id.toString()] || 0,
    }));

    return res.status(200).json({ success: true, subcategories: subsWithCount });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminSubcategory = async (req: Request, res: Response) => {
  try {
    const { name, categoryId, description, image, isActive = true, displayOrder = 0 } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ success: false, message: 'Subcategory name and parent category are required' });
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const exists = await Subcategory.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const subcategory = await Subcategory.create({
      name,
      slug,
      categoryId,
      description,
      image,
      isActive,
      displayOrder,
    });

    const populated = await Subcategory.findById(subcategory._id).populate('categoryId', 'name slug');
    return res.status(201).json({ success: true, subcategory: populated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId, description, image, isActive, displayOrder } = req.body;

    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
      { new: true }
    ).populate('categoryId', 'name slug');

    if (!subcategory) return res.status(404).json({ success: false, message: 'Subcategory not found' });
    return res.status(200).json({ success: true, subcategory });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subcategory = await Subcategory.findByIdAndDelete(id);
    if (!subcategory) return res.status(404).json({ success: false, message: 'Subcategory not found' });

    return res.status(200).json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   4. PRODUCTS MANAGEMENT
   ========================================================================== */
export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, status, stockFilter, page = 1, limit = 50 } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.categoryId = category;
    if (status) query.status = status;
    if (stockFilter === 'low') query.stock = { $gt: 0, $lte: 5 };
    if (stockFilter === 'out') query.stock = { $lte: 0 };
    if (stockFilter === 'in') query.stock = { $gt: 5 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    return res.status(200).json({
      success: true,
      total,
      products,
      page: +page,
      pages: Math.ceil(total / +limit),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.status(200).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      sku,
      categoryId,
      subcategoryId,
      brand = 'LocalHaat Direct',
      shortDescription,
      description,
      mrp,
      price,
      discountPrice,
      taxPercent = 5,
      stock = 0,
      lowStockThreshold = 5,
      unit = 'kg',
      weightKg = 1,
      dimensions = { lengthCm: 15, widthCm: 15, heightCm: 15 },
      images = [],
      thumbnail,
      videoUrl,
      availableLocations = [],
      status = 'active',
      isFeatured = false,
      isOrganic = false,
      tags = [],
      seoTitle,
      seoDescription,
    } = req.body;

    if (!title || !categoryId || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title, category, and selling price are required' });
    }

    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Product.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const generatedSku = sku || `LH-${Date.now().toString().slice(-6)}`;

    // Fallback company admin user for single-vendor company store
    const adminUser = req.user || (await User.findOne({ role: 'admin' }));

    const product = await Product.create({
      title,
      sku: generatedSku,
      slug,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      brand,
      shortDescription,
      description: description || shortDescription || title,
      mrp: mrp || price,
      price,
      discountPrice,
      taxPercent,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      unit,
      weightKg: Number(weightKg) || 1,
      dimensions,
      images: images.length ? images : [thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'],
      thumbnail: thumbnail || images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      videoUrl,
      availableLocations,
      status: Number(stock) <= 0 && status === 'active' ? 'out_of_stock' : status,
      isFeatured,
      isOrganic,
      tags: typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || shortDescription,
      sellerId: adminUser?._id,
      originVillage: 'Sonapur',
      originDistrict: 'Varanasi',
      originState: 'Uttar Pradesh',
    });

    // Record initial stock creation in InventoryLog
    if (Number(stock) > 0) {
      await InventoryLog.create({
        productId: product._id,
        productTitle: product.title,
        sku: product.sku,
        changeType: 'ADD',
        quantityChanged: Number(stock),
        previousStock: 0,
        newStock: Number(stock),
        reason: 'Initial Product Catalog Entry',
        operatorName: req.user?.name || 'Store Admin',
      });
    }

    return res.status(201).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);
    if (!existingProduct) return res.status(404).json({ success: false, message: 'Product not found' });

    const updateData = { ...req.body };
    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
      if (updateData.stock <= 0 && existingProduct.status === 'active') {
        updateData.status = 'out_of_stock';
      }
    }

    // Check if stock changed to log in InventoryLog
    if (updateData.stock !== undefined && updateData.stock !== existingProduct.stock) {
      const stockDiff = updateData.stock - existingProduct.stock;
      await InventoryLog.create({
        productId: existingProduct._id,
        productTitle: updateData.title || existingProduct.title,
        sku: updateData.sku || existingProduct.sku,
        changeType: stockDiff > 0 ? 'ADD' : 'REMOVE',
        quantityChanged: Math.abs(stockDiff),
        previousStock: existingProduct.stock,
        newStock: updateData.stock,
        reason: 'Product Edit - Manual Stock Adjustment',
        operatorName: req.user?.name || 'Store Admin',
      });
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true })
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug');

    return res.status(200).json({ success: true, product: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await InventoryLog.create({
      productId: product._id,
      productTitle: product.title,
      sku: product.sku,
      changeType: 'REMOVE',
      quantityChanged: product.stock,
      previousStock: product.stock,
      newStock: 0,
      reason: 'Product Removed From Catalog',
      operatorName: 'Store Admin',
    });

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   5. INVENTORY MANAGEMENT
   ========================================================================== */
export const getAdminInventory = async (req: Request, res: Response) => {
  try {
    const { filter, search } = req.query;
    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (filter === 'low') query.stock = { $gt: 0, $lte: 5 };
    else if (filter === 'out') query.stock = { $lte: 0 };

    const products = await Product.find(query)
      .select('title sku stock lowStockThreshold unit price status images categoryId')
      .populate('categoryId', 'name')
      .sort({ stock: 1 });

    return res.status(200).json({ success: true, products });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const adjustAdminStock = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, changeType, quantity, reason, lowStockThreshold } = req.body;
    if (!productId || !changeType || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product, changeType, and quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const prevStock = product.stock;
    let newStock = prevStock;
    const qty = Math.abs(Number(quantity));

    if (changeType === 'ADD') newStock = prevStock + qty;
    else if (changeType === 'REMOVE') newStock = Math.max(0, prevStock - qty);
    else if (changeType === 'ADJUST') newStock = qty;

    product.stock = newStock;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (newStock === 0) product.status = 'out_of_stock';
    else if (product.status === 'out_of_stock' && newStock > 0) product.status = 'active';

    await product.save();

    const log = await InventoryLog.create({
      productId: product._id,
      productTitle: product.title,
      sku: product.sku,
      changeType,
      quantityChanged: qty,
      previousStock: prevStock,
      newStock,
      reason: reason || `Manual stock update (${changeType})`,
      operatorName: req.user?.name || 'Store Admin',
    });

    return res.status(200).json({ success: true, product, log });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminInventoryLogs = async (req: Request, res: Response) => {
  try {
    const logs = await InventoryLog.find({}).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   6. ORDERS MANAGEMENT
   ========================================================================== */
export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus, search } = req.query;
    const query: any = {};

    if (status && status !== 'ALL') {
      query.orderStatus = { $regex: new RegExp(`^${status}$`, 'i') };
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      query.paymentStatus = { $regex: new RegExp(`^${paymentStatus}$`, 'i') };
    }

    let orders = await Order.find(query)
      .populate('customerId', 'name phone email')
      .populate('items')
      .populate('parcelId')
      .sort({ createdAt: -1 });

    if (search) {
      const term = (search as string).toLowerCase();
      orders = orders.filter((o: any) => {
        return (
          o.orderNumber?.toLowerCase().includes(term) ||
          o.customerId?.name?.toLowerCase().includes(term) ||
          o.customerId?.phone?.includes(term)
        );
      });
    }

    return res.status(200).json({ success: true, orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminOrderDetail = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name phone email defaultLocation')
      .populate({
        path: 'items',
        populate: { path: 'productId', select: 'title sku images price unit' },
      })
      .populate('parcelId');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.status(200).json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note, paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const prevStatus = order.orderStatus;
    if (status) order.orderStatus = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: status || prevStatus,
      note: note || `Status updated to ${status} by admin`,
      timestamp: new Date(),
      updatedBy: req.user?.name || 'Admin',
    });

    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();

    // If parcel exists, sync parcel and tracking events
    if (order.parcelId) {
      const parcelStatusMap: Record<string, string> = {
        PACKED: 'ready_for_pickup',
        READY_FOR_PICKUP: 'ready_for_pickup',
        LOGISTICS_ASSIGNED: 'partner_accepted',
        SHIPPED: 'in_transit',
        IN_TRANSIT: 'in_transit',
        OUT_FOR_DELIVERY: 'out_for_delivery',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled',
      };
      const mapped = parcelStatusMap[status?.toUpperCase()];
      if (mapped) {
        await Parcel.findByIdAndUpdate(order.parcelId, { status: mapped });
        await TrackingEvent.create({
          trackingCode: (order.parcelId as any)?.parcelTrackingNumber || `TRK-${order.orderNumber}`,
          parcelId: order.parcelId,
          status: status,
          locationName: order.deliveryAddress?.villageOrCity || 'Central Haat Hub',
          note: note || `Order updated to ${status}`,
        });
      }
    }

    return res.status(200).json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   7. PAYMENTS MANAGEMENT
   ========================================================================== */
export const getAdminPayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({})
      .populate('orderId', 'orderNumber totalAmount paymentMethod paymentStatus')
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 });

    // Also fetch orders directly so any COD or direct orders without payment doc are fully visible
    const orders = await Order.find({}).populate('customerId', 'name phone email').sort({ createdAt: -1 });
    const existingOrderIds = new Set(payments.map((p: any) => p.orderId?._id?.toString() || p.orderId?.toString()));

    const simulatedFromOrders = orders
      .filter((o) => !existingOrderIds.has(o._id.toString()))
      .map((o) => ({
        _id: `pay_direct_${o._id.toString().slice(-6)}`,
        orderId: o,
        customerId: o.customerId,
        amount: o.totalAmount,
        currency: 'INR',
        provider: o.paymentMethod === 'cod' ? 'CASH_ON_DELIVERY' : 'UPI_DIRECT',
        providerOrderId: `ord_${o.orderNumber}`,
        providerPaymentId: o.paymentStatus === 'paid' ? `txn_${o.orderNumber}` : undefined,
        status: o.paymentStatus === 'paid' ? 'SUCCESS' : o.paymentStatus === 'failed' ? 'FAILED' : 'INITIATED',
        createdAt: (o as any).createdAt || o.placedAt,
      }));

    return res.status(200).json({
      success: true,
      payments: [...payments, ...simulatedFromOrders],
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processAdminRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, amount } = req.body;

    const payment = await Payment.findById(id);
    if (payment) {
      payment.status = 'REFUNDED';
      payment.metadata = { ...payment.metadata, refundReason: reason, refundedAmount: amount || payment.amount };
      await payment.save();

      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'refunded',
        orderStatus: 'refunded',
        $push: {
          timeline: {
            status: 'REFUNDED',
            note: `Refund processed: ${reason || 'Approved by Admin'}. Amount: ₹${amount || payment.amount}`,
            timestamp: new Date(),
            updatedBy: req.user?.name || 'Admin',
          },
        },
      });

      return res.status(200).json({ success: true, message: 'Refund completed successfully', payment });
    }

    // If order was simulated
    const order = await Order.findById(id);
    if (order) {
      order.paymentStatus = 'refunded';
      order.orderStatus = 'refunded';
      if (!order.timeline) order.timeline = [];
      order.timeline.push({
        status: 'REFUNDED',
        note: `Refund processed: ${reason || 'Approved by Admin'}. Amount: ₹${order.totalAmount}`,
        timestamp: new Date(),
        updatedBy: req.user?.name || 'Admin',
      });
      await order.save();
      return res.status(200).json({ success: true, message: 'Refund marked on order', order });
    }

    return res.status(404).json({ success: false, message: 'Payment or order not found' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   8. CUSTOMERS DIRECTORY
   ========================================================================== */
export const getAdminCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('name phone email isActive createdAt');
    const customerOrders = await Order.find({}).select('customerId totalAmount createdAt orderStatus');

    const customerMap: Record<string, { totalOrders: number; totalSpending: number; lastOrder?: Date }> = {};

    customerOrders.forEach((o) => {
      const cId = o.customerId?.toString();
      if (!cId) return;
      if (!customerMap[cId]) {
        customerMap[cId] = { totalOrders: 0, totalSpending: 0, lastOrder: undefined };
      }
      customerMap[cId].totalOrders += 1;
      const st = (o.orderStatus || '').toLowerCase();
      if (!['cancelled', 'refunded'].includes(st)) {
        customerMap[cId].totalSpending += o.totalAmount || 0;
      }
      const orderDate = new Date((o as any).createdAt || (o as any).placedAt);
      if (!customerMap[cId].lastOrder || orderDate > customerMap[cId].lastOrder!) {
        customerMap[cId].lastOrder = orderDate;
      }
    });

    const enrichedCustomers = customers.map((c) => ({
      _id: c._id,
      name: c.name,
      phone: c.phone,
      email: c.email || 'N/A',
      accountStatus: c.isActive ? 'Active' : 'Suspended',
      joinedAt: (c as any).createdAt,
      totalOrders: customerMap[c._id.toString()]?.totalOrders || 0,
      totalSpending: customerMap[c._id.toString()]?.totalSpending || 0,
      lastOrder: customerMap[c._id.toString()]?.lastOrder,
    }));

    return res.status(200).json({ success: true, customers: enrichedCustomers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   9. COUPONS & DISCOUNTS
   ========================================================================== */
export const getAdminCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue = 0,
      maxDiscount = 0,
      startDate,
      expiryDate,
      usageLimit = 100,
      customerUsageLimit = 1,
      isActive = true,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Code, discount type, value, and expiry date required' });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (exists) return res.status(400).json({ success: false, message: 'Coupon code already exists' });

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: Number(maxDiscount),
      startDate: startDate || new Date(),
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit),
      customerUsageLimit: Number(customerUsageLimit),
      isActive,
    });

    return res.status(201).json({ success: true, coupon });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    return res.status(200).json({ success: true, coupon });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   10. PRODUCT REVIEWS MODERATION
   ========================================================================== */
export const getAdminReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({})
      .populate('productId', 'title images sku')
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reviews });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' | 'HIDDEN' | 'PENDING'

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    return res.status(200).json({ success: true, review });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   11. SHIPPING & LOGISTICS DISPATCH
   ========================================================================== */
export const getAdminShippingOverview = async (req: Request, res: Response) => {
  try {
    const parcels = await Parcel.find({}).sort({ createdAt: -1 }).limit(100);
    const partners = await LogisticsPartner.find({}).populate('userId', 'name phone');
    const legs = await ShipmentLeg.find({}).sort({ createdAt: -1 });

    const supportedVehicles = [
      'Cycle',
      'Bike',
      'Auto',
      'Car',
      'Van/Pickup',
      'Bus/Transport',
      'Approved rail route',
      'Any Available Partner',
    ];

    return res.status(200).json({
      success: true,
      parcels,
      partners: partners.map((p: any) => ({
        _id: p._id,
        name: (p.userId as any)?.name || p.businessName || 'Partner',
        phone: (p.userId as any)?.phone || 'N/A',
        vehicleType: p.partnerType === 'individual' ? 'Bike' : 'Van/Pickup',
        isAvailable: p.isOnline ?? true,
        capacityKg: 50,
      })),
      shipmentLegs: legs,
      supportedVehicles,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignAdminShippingPartner = async (req: AuthRequest, res: Response) => {
  try {
    const { parcelId, partnerId, vehicleType, legSequence = 1 } = req.body;
    if (!parcelId) return res.status(400).json({ success: false, message: 'Parcel ID is required' });

    const parcel = await Parcel.findById(parcelId);
    if (!parcel) return res.status(404).json({ success: false, message: 'Parcel not found' });

    let partner = null;
    if (partnerId) {
      partner = await LogisticsPartner.findById(partnerId);
    } else {
      // Auto-match first available partner
      partner = (await LogisticsPartner.findOne({ isOnline: true })) || (await LogisticsPartner.findOne({}));
    }

    if (partner) {
      parcel.currentPartnerId = partner._id as any;
      parcel.status = 'PARTNER_ACCEPTED' as any;
      parcel.preferredLogisticsType = vehicleType || 'Bike';
      await parcel.save();

      // Update leg
      await ShipmentLeg.updateMany(
        { parcelId: parcel._id, sequence: legSequence },
        {
          assignedToUserId: partner.userId,
          status: 'accepted',
        }
      );

      await TrackingEvent.create({
        trackingCode: parcel.parcelTrackingNumber,
        parcelId: parcel._id,
        status: 'Logistics Partner Assigned',
        locationName: parcel.pickupLocation,
        note: `Assigned to logistics partner. Transport Mode: ${parcel.preferredLogisticsType}`,
      });
    }

    return res.status(200).json({ success: true, parcel, message: 'Logistics partner assigned successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================================
   12. STORE SETTINGS
   ========================================================================== */
export const getAdminStoreSettings = async (req: Request, res: Response) => {
  try {
    let settings = await StoreSettings.findOne({});
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    return res.status(200).json({ success: true, settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminStoreSettings = async (req: Request, res: Response) => {
  try {
    let settings = await StoreSettings.findOne({});
    if (!settings) {
      settings = await StoreSettings.create(req.body);
    } else {
      settings = await StoreSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    return res.status(200).json({ success: true, settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
