import { Router } from 'express';
import PaymentController from './Controller.Payment';

const router = Router();

router.get('/status', PaymentController.status);
router.post('/checkout', PaymentController.checkout);

export default router;