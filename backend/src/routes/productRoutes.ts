import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, getCategories } from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
// Only Admin controls the platform catalog and inventory (single-vendor commerce)
router.post('/', authenticate as any, requireRoles(['admin']) as any, createProduct as any);

export default router;
