import type { NextFunction, Request, Response } from 'express';
import { readAuthCookie } from '../auth/Cookie.Auth';
import { PUBLIC_PATHS } from '../Config';
import { Token } from './Middleware.Token';

export async function authInterceptor(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.path.startsWith('/api') || PUBLIC_PATHS.has(`${req.method} ${req.path}`)) {
    next();
    return;
  }

  const token = readAuthCookie(req);
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    req.user = { email: await Token.verify(token) };
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}