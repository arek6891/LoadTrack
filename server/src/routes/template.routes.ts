import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as TemplateController from '../controllers/template.controller';

const router = Router();

router.get('/', authenticate, TemplateController.getTemplates);
router.get('/default/:type', authenticate, TemplateController.getDefaultTemplate);
router.post('/', authenticate, authorize(['ADMIN']), TemplateController.createTemplate);
router.patch('/:id', authenticate, authorize(['ADMIN']), TemplateController.updateTemplate);
router.delete('/:id', authenticate, authorize(['ADMIN']), TemplateController.deleteTemplate);

export default router;
