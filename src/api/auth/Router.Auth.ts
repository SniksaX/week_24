import { Router } from 'express';
import AuthController from './Controller.Auth';
import { authInterceptor } from '../middleware/Middleware.Auth';

const router = Router();

router.get('/me', authInterceptor, AuthController.me);
router.post('/login', authInterceptor, AuthController.login);
router.post('/register', authInterceptor, AuthController.register);
router.post('/logout', authInterceptor, AuthController.logout);
router.get('/google', AuthController.googleStart);
router.get('/google/callback', AuthController.googleCallback);
router.get('/github', AuthController.githubStart);
router.get('/github/callback', AuthController.githubCallback);

export default router;