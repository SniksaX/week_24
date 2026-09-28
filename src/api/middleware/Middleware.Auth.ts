import type { NextFunction, Request, Response } from 'express';

const PUBLIC_PATHS = new Set([
  'GET /health',
  'POST /api/auth/login',
  'POST /api/auth/register',
]);

export function authInterceptor(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith('/api')) {
    next();
    return;
  }

  const key = `${req.method} ${req.path}`;
  if (PUBLIC_PATHS.has(key)) {
    next();
    return;
  }

  if (!req.session.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
}
