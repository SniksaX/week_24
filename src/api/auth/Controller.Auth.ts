import type { Request, RequestHandler, Response } from 'express';
import { APP_URL, GITHUB, GOOGLE } from '../Config';
import type { OAuthIdentity } from '../types/Types';
import { clearAuthCookie, setAuthCookie } from './Cookie.Auth';
import passport from './Passport.Auth';
import AuthService from './Service.Auth';

type Provider = 'google' | 'github';

const ENABLED: Record<Provider, boolean> = { google: GOOGLE !== null, github: GITHUB !== null };

const START_OPTIONS = {
  google: { session: false, prompt: 'select_account' },
  github: { session: false },
} as const;

function start(provider: Provider): RequestHandler {
  return (req, res, next) => {
    if (!ENABLED[provider]) {
      res.status(503).json({ message: `${provider} auth is not configured` });
      return;
    }
    passport.authenticate(provider, START_OPTIONS[provider])(req, res, next);
  };
}

function callback(provider: Provider): RequestHandler {
  const failure = `${APP_URL}?error=${provider}_auth`;
  return (req, res, next) => {
    if (!ENABLED[provider]) {
      res.redirect(failure);
      return;
    }
    passport.authenticate(
      provider,
      { session: false },
      async (error: unknown, identity: OAuthIdentity | false) => {
        if (error || !identity) {
          res.redirect(failure);
          return;
        }
        try {
          const { token } =
            provider === 'google'
              ? await AuthService.loginWithGoogle({ sub: identity.id, email: identity.email })
              : await AuthService.loginWithGithub(identity.email);
          setAuthCookie(res, token);
          res.redirect(APP_URL);
        } catch {
          res.redirect(failure);
        }
      },
    )(req, res, next);
  };
}

class AuthController {
  googleStart = start('google');
  googleCallback = callback('google');
  githubStart = start('github');
  githubCallback = callback('github');

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
}

export default new AuthController();