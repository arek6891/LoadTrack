import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as PalletController from '../controllers/pallet.controller';

const router = Router();

router.get('/:palletNumber', authenticate, PalletController.getPallet);
router.post('/', authenticate, PalletController.createPallet);
router.post('/add-package', authenticate, PalletController.addPackage);
router.post('/move', authenticate, PalletController.movePallet);
router.delete('/:id', authenticate, authorize(['ADMIN', 'LEADER']), PalletController.deletePallet);

export default router;
