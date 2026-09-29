import type { Request, Response } from 'express';
import { clearAuthCookie, setAuthCookie } from './Cookie.Auth';
import AuthService from './Service.Auth';

class AuthController {
  me(req: Request, res: Response): void {
    res.json({ user: req.user });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    try {
      const { token, email: userEmail } = await AuthService.login(email, password);
      setAuthCookie(res, token);
      res.json({ user: { email: userEmail } });
    } catch {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  }

  async register(req: Request, res: Response) {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    try {
      const { token, email: userEmail } = await AuthService.register(email, password);
      setAuthCookie(res, token);
      res.status(201).json({ user: { email: userEmail } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const status = message === 'User already exists' ? 409 : 400;
      res.status(status).json({ message });
    }
  }

  logout(_req: Request, res: Response) {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
  }
}

export default new AuthController();
