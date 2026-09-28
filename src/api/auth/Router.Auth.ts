import { Router } from 'express';
import AuthController from './Controller.Auth';

const router = Router();

router.get('/me', AuthController.me);
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', AuthController.logout);

export default router;