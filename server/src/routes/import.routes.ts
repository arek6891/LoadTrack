import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth';
import * as ImportController from '../controllers/import.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authenticate, authorize(['ADMIN', 'LEADER']), upload.single('file'), ImportController.massImport);

export default router;
