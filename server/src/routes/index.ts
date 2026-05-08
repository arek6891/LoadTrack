import { Router } from 'express';
import userRoutes from './user.routes';
import packageRoutes from './package.routes';
import palletRoutes from './pallet.routes';
import locationRoutes from './location.routes';
import loadingRoutes from './loading.routes';
import searchRoutes from './search.routes';
import statsRoutes from './stats.routes';
import auditLogRoutes from './auditLog.routes';
import reportRoutes from './report.routes';
import templateRoutes from './template.routes';
import importRoutes from './import.routes';

const router = Router();

router.use('/auth', userRoutes); // prefix /api/auth
router.use('/users', userRoutes); // prefix /api/users
router.use('/packages', packageRoutes);
router.use('/pallets', palletRoutes);
router.use('/move', palletRoutes);
router.use('/locations', locationRoutes);
router.use('/loadings', loadingRoutes);
router.use('/search', searchRoutes);
router.use('/stats', statsRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/reports', reportRoutes);
router.use('/label-templates', templateRoutes);
router.use('/import', importRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
