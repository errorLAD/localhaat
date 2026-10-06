import { Router } from 'express';
import {
  getStoreDashboardStats,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminSubcategories,
  createAdminSubcategory,
  updateAdminSubcategory,
  deleteAdminSubcategory,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminInventory,
  adjustAdminStock,
  getAdminInventoryLogs,
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminOrderStatus,
  getAdminPayments,
  processAdminRefund,
  getAdminCustomers,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  getAdminReviews,
  updateAdminReviewStatus,
  deleteAdminReview,
  getAdminShippingOverview,
  assignAdminShippingPartner,
  getAdminStoreSettings,
  updateAdminStoreSettings,
} from '../controllers/adminStoreController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate as any);
router.use(requireRoles(['admin']) as any);

// Dashboard
router.get('/dashboard', getStoreDashboardStats as any);

// Categories
router.get('/categories', getAdminCategories as any);
router.post('/categories', createAdminCategory as any);
router.put('/categories/:id', updateAdminCategory as any);
router.delete('/categories/:id', deleteAdminCategory as any);

// Subcategories
router.get('/subcategories', getAdminSubcategories as any);
router.post('/subcategories', createAdminSubcategory as any);
router.put('/subcategories/:id', updateAdminSubcategory as any);
router.delete('/subcategories/:id', deleteAdminSubcategory as any);

// Products
router.get('/products', getAdminProducts as any);
router.get('/products/:id', getAdminProductById as any);
router.post('/products', createAdminProduct as any);
router.put('/products/:id', updateAdminProduct as any);
router.delete('/products/:id', deleteAdminProduct as any);

// Inventory
router.get('/inventory', getAdminInventory as any);
router.post('/inventory/adjust', adjustAdminStock as any);
router.get('/inventory/logs', getAdminInventoryLogs as any);

// Orders
router.get('/orders', getAdminOrders as any);
router.get('/orders/:id', getAdminOrderDetail as any);
router.put('/orders/:id/status', updateAdminOrderStatus as any);

// Payments
router.get('/payments', getAdminPayments as any);
router.post('/payments/:id/refund', processAdminRefund as any);

// Customers
router.get('/customers', getAdminCustomers as any);

// Coupons
router.get('/coupons', getAdminCoupons as any);
router.post('/coupons', createAdminCoupon as any);
router.put('/coupons/:id', updateAdminCoupon as any);
router.delete('/coupons/:id', deleteAdminCoupon as any);

// Reviews
router.get('/reviews', getAdminReviews as any);
router.put('/reviews/:id/status', updateAdminReviewStatus as any);
router.delete('/reviews/:id', deleteAdminReview as any);

// Shipping & Delivery
router.get('/shipping', getAdminShippingOverview as any);
router.post('/shipping/assign', assignAdminShippingPartner as any);

// Store Settings
router.get('/settings', getAdminStoreSettings as any);
router.put('/settings', updateAdminStoreSettings as any);

// Seed defaults
router.all('/seed-defaults', async (req, res) => {
  try {
    const { seedStoreDefaults } = await import('../seeds/seedStoreDefaults.js');
    await seedStoreDefaults();
    return res.json({ success: true, message: 'Store defaults initialized' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
