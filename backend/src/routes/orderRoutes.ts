import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, initiatePayment, verifyPayment } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate as any);

router.post('/', createOrder as any);
router.get('/my-orders', getMyOrders as any);
router.get('/:id', getOrderById as any);
router.post('/payment/initiate', initiatePayment as any);
router.post('/payment/verify', verifyPayment as any);

export default router;
