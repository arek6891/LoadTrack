import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as UserController from '../controllers/user.controller';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), UserController.getUsers);
router.post('/register', authenticate, authorize(['ADMIN']), UserController.registerUser);
router.patch('/:id', authenticate, authorize(['ADMIN']), UserController.updateUser);
router.delete('/:id', authenticate, authorize(['ADMIN']), UserController.deleteUser);
router.post('/login', UserController.login);

export default router;
