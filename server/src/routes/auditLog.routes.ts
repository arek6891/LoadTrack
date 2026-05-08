import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as AuditLogController from '../controllers/auditLog.controller';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN', 'LEADER']), AuditLogController.getAuditLogs);

export default router;
