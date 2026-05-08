import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as PackageController from '../controllers/package.controller';

const router = Router();

router.post('/', authenticate, PackageController.createPackage);
router.delete('/:id', authenticate, authorize(['ADMIN', 'LEADER']), PackageController.deletePackage);

export default router;
