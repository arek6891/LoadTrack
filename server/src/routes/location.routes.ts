import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as LocationController from '../controllers/location.controller';

const router = Router();

router.get('/', authenticate, LocationController.getLocations);
router.post('/', authenticate, authorize(['ADMIN', 'LEADER']), LocationController.createLocation);

export default router;
