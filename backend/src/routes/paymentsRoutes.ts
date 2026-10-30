import { Router } from 'express';
import {
    initialisePaymentController,
    verifyPaymentController
} from '../controllers/paymentsController'
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/initialise', protect, initialisePaymentController);
router.get('/verify', protect, verifyPaymentController);

export default router;
