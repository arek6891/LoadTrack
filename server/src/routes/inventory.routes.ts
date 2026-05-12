import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as InventoryController from '../controllers/inventory.controller';

const router = Router();

router.get('/active', authenticate, InventoryController.getActiveSession);
router.post('/start', authenticate, authorize(['ADMIN', 'LEADER']), InventoryController.startSession);
router.post('/record', authenticate, InventoryController.recordCount);
router.post('/:id/close', authenticate, authorize(['ADMIN', 'LEADER']), InventoryController.closeSession);

export default router;
