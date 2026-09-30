import type { Request, Response } from 'express';
import { APP_URL } from '../Config';
import {
  clearAuthCookie,
  clearOAuthCookie,
  readOAuthCookie,
  setAuthCookie,
  setOAuthCookie,
} from './Cookie.Auth';
import { createAuthRequest, exchangeCode, isGoogleEnabled } from './Google.Auth';
import AuthService from './Service.Auth';

class AuthController {
  me(req: Request, res: Response): void {
    res.json({ user: req.user });
  }

  async login(req: Request, res: Response): Promise<void> {
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

  async register(req: Request, res: Response): Promise<void> {
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

  logout(_req: Request, res: Response): void {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
  }

  googleStart(_req: Request, res: Response): void {
    if (!isGoogleEnabled()) {
      res.status(503).json({ message: 'Google auth is not configured' });
      return;
    }
    const { url, state, verifier } = createAuthRequest();
    setOAuthCookie(res, `${state}.${verifier}`);
    res.redirect(url);
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    const { code, state } = req.query;
    const stored = readOAuthCookie(req);
    clearOAuthCookie(res);

    const [expected, verifier] = stored?.split('.') ?? [];
    if (
      typeof code !== 'string' ||
      typeof state !== 'string' ||
      !expected ||
      !verifier ||
      state !== expected
    ) {
      res.redirect(`${APP_URL}?error=google_auth`);
      return;
    }

    try {
      const profile = await exchangeCode(code, verifier);
      const { token } = await AuthService.loginWithGoogle(profile);
      setAuthCookie(res, token);
      res.redirect(APP_URL);
    } catch {
      res.redirect(`${APP_URL}?error=google_auth`);
    }
  }
}

export default new AuthController();