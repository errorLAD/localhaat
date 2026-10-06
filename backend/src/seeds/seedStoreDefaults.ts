import {
  Category,
  Subcategory,
  Product,
  Coupon,
  Review,
  StoreSettings,
  InventoryLog,
  User,
} from '../models/index.js';

export const seedStoreDefaults = async () => {
  console.log('[Store Seed] Checking store default records...');

  // 1. Store Settings
  const existingSettings = await StoreSettings.findOne({});
  if (!existingSettings) {
    await StoreSettings.create({
      storeName: 'LocalHaat Rural Direct Store',
      storeTagline: 'Authentic Village Haat Commerce Delivered Direct',
      storeEmail: 'admin@localhaat.in',
      storePhone: '+91 9999900001',
      address: {
        street: 'Main Haat Central Facility, GT Road',
        city: 'Varanasi',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221001',
      },
      currency: 'INR',
      taxGstRate: 5,
      defaultDeliveryFee: 40,
      freeDeliveryThreshold: 499,
      lowStockThresholdDefault: 5,
      enableCod: true,
      enableOnlinePayment: true,
      storeStatus: 'OPEN',
      supportHours: 'Mon - Sun: 7:00 AM - 9:00 PM',
    });
    console.log('[Store Seed] Initialized default store settings');
  }

  // 2. Subcategories
  const categories = await Category.find({});
  for (const cat of categories) {
    const existingSubs = await Subcategory.countDocuments({ categoryId: cat._id });
    if (existingSubs === 0) {
      const catLower = cat.name.toLowerCase();
      let subNames: string[] = [];

      if (catLower.includes('grain') || catLower.includes('rice') || catLower.includes('fmcg')) {
        subNames = ['Basmati & Regional Rice', 'Organic Daal & Pulses', 'Stone-ground Aata & Flours', 'Cold-pressed Mustard Oil'];
      } else if (catLower.includes('dairy') || catLower.includes('ghee')) {
        subNames = ['Desi A2 Cow Ghee', 'Fresh Paneer & Khoya', 'Artisanal Butter', 'Flavoured Chaach'];
      } else if (catLower.includes('spice')) {
        subNames = ['Whole Spices (Khada Masala)', 'Hand-ground Turmeric', 'Teja Red Chilli Powder', 'Himalayan Rock Salt'];
      } else if (catLower.includes('craft') || catLower.includes('handloom')) {
        subNames = ['Clay Pottery & Matkas', 'Bamboo Baskets', 'Handwoven Cotton Shawls', 'Brass Utensils'];
      } else if (catLower.includes('sweet') || catLower.includes('jaggery')) {
        subNames = ['Organic Desi Gud (Jaggery)', 'Sesame Gajak & Chikki', 'Wild Forest Honey', 'Traditional Laddu'];
      } else {
        subNames = [`${cat.name} Premium Selection`, `${cat.name} Daily Staples`];
      }

      for (let i = 0; i < subNames.length; i++) {
        const name = subNames[i];
        const slug = `${cat.slug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`;
        await Subcategory.create({
          name,
          slug,
          categoryId: cat._id,
          description: `Fresh, artisanal ${name} sourced directly from local producers.`,
          isActive: true,
          displayOrder: i + 1,
        });
      }
    }
  }

  // 3. Coupons
  const couponCount = await Coupon.countDocuments({});
  if (couponCount === 0) {
    await Coupon.create([
      {
        code: 'MAX500',
        description: 'Flat ₹500 discount on orders over ₹1,999',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderValue: 1999,
        maxDiscount: 500,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        usedCount: 14,
        customerUsageLimit: 2,
        isActive: true,
      },
      {
        code: 'VILLAGE50',
        description: '15% discount up to ₹150 for new rural customers',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderValue: 399,
        maxDiscount: 150,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        usedCount: 88,
        customerUsageLimit: 1,
        isActive: true,
      },
      {
        code: 'DESI100',
        description: 'Flat ₹100 OFF on authentic desi ghee & pulses',
        discountType: 'FIXED',
        discountValue: 100,
        minOrderValue: 799,
        maxDiscount: 100,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 300,
        usedCount: 42,
        customerUsageLimit: 1,
        isActive: true,
      },
    ]);
    console.log('[Store Seed] Seeded default coupons');
  }

  // 4. Sample Reviews
  const reviewCount = await Review.countDocuments({});
  if (reviewCount === 0) {
    const products = await Product.find({}).limit(5);
    const customer = await User.findOne({ role: 'customer' });
    if (products.length && customer) {
      const sampleReviews = [
        {
          productId: products[0]._id,
          customerId: customer._id,
          customerName: customer.name,
          rating: 5,
          review: 'Pure and authentic quality! The aroma reminds me of childhood in our ancestral village.',
          status: 'APPROVED',
        },
        {
          productId: products[1]?._id || products[0]._id,
          customerId: customer._id,
          customerName: 'Anil Kumar',
          rating: 5,
          review: 'Completely unadulterated. Delivered on time with secure delivery PIN handover.',
          status: 'APPROVED',
        },
        {
          productId: products[2]?._id || products[0]._id,
          customerId: customer._id,
          customerName: 'Meenakshi Verma',
          rating: 4,
          review: 'Very good packaging and direct farm freshness. Would love faster dispatch to peri-urban areas.',
          status: 'APPROVED',
        },
      ];
      await Review.create(sampleReviews);
      console.log('[Store Seed] Seeded initial customer reviews');
    }
  }

  // 5. Initial Inventory Logs
  const logCount = await InventoryLog.countDocuments({});
  if (logCount === 0) {
    const prods = await Product.find({}).limit(10);
    for (const p of prods) {
      await InventoryLog.create({
        productId: p._id,
        productTitle: p.title,
        sku: p.sku || `LH-${p._id.toString().slice(-6)}`,
        changeType: 'ADD',
        quantityChanged: p.stock || 25,
        previousStock: 0,
        newStock: p.stock || 25,
        reason: 'Initial Catalog Inventory Intake',
        operatorName: 'Devendra Pratap (Admin)',
      });
    }
    console.log('[Store Seed] Initialized stock inventory logs');
  }

  console.log('[Store Seed] Store defaults initialized successfully.');
};
