import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as DiagnosticsController from '../controllers/diagnostics.controller';

const router = Router();

router.get('/stream-tests', authenticate, authorize(['ADMIN']), DiagnosticsController.streamTestLogs);

export default router;
