import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ReportController from '../controllers/report.controller';

const router = Router();

router.get('/inventory', authenticate, ReportController.getInventoryReport);
router.get('/detailed', authenticate, ReportController.getDetailedReport);

export default router;
