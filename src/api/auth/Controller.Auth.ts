import type { Request, Response } from 'express';
import AuthService from './Service.Auth';

class AuthController {
  me(req: Request, res: Response) {
    res.json({ user: req.session.user });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    try {
      const user = await AuthService.login(email, password);
      req.session.user = user;
      res.status(200).json({ user });
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
      const user = await AuthService.register(email, password);
      req.session.user = user;
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const status = message === 'User already exists' ? 409 : 400;
      res.status(status).json({ message });
    }
  }

  logout(req: Request, res: Response) {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).json({ message: 'Logout failed' });
        return;
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  }
}

export default new AuthController();
