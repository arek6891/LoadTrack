import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ReportController from '../controllers/report.controller';

const router = Router();

router.get('/inventory', authenticate, ReportController.getInventoryReport);

export default router;
