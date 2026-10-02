import { Router } from 'express';
import AuthController from './Controller.Auth';
import { authInterceptor } from '../middleware/Middleware.Auth';
import { oauthSession } from './Passport.Auth';

const router = Router();

router.get('/me', authInterceptor, AuthController.me);
router.post('/login', authInterceptor, AuthController.login);
router.post('/register', authInterceptor, AuthController.register);
router.post('/logout', authInterceptor, AuthController.logout);
router.get('/google', oauthSession, AuthController.googleStart);
router.get('/google/callback', oauthSession, AuthController.googleCallback);
router.get('/github', oauthSession, AuthController.githubStart);
router.get('/github/callback', oauthSession, AuthController.githubCallback);

export default router;