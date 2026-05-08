import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as LoadingController from '../controllers/loading.controller';

const router = Router();

router.get('/', authenticate, LoadingController.getLoadings);
router.get('/history', authenticate, LoadingController.getHistory);
router.post('/', authenticate, LoadingController.createLoading);
router.patch('/:id', authenticate, LoadingController.updateLoading);
router.post('/add-pallet', authenticate, LoadingController.addPallet);
router.post('/:id/close', authenticate, LoadingController.closeLoading);

export default router;
