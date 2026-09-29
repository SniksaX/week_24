import { Router } from 'express';
import AuthController from './Controller.Auth';
import { authInterceptor } from '../middleware/Middleware.Auth';

const router = Router();

router.get('/me', authInterceptor, AuthController.me);
router.post('/login', authInterceptor, AuthController.login);
router.post('/register', authInterceptor, AuthController.register);
router.post('/logout', authInterceptor, AuthController.logout);

export default router;