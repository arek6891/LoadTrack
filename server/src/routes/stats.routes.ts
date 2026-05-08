import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as StatsController from '../controllers/stats.controller';

const router = Router();

router.get('/', authenticate, StatsController.getStats);

export default router;
