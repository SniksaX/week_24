import type { Request, Response } from 'express';
import { AUTH_COOKIE } from '../Config';

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE.name, token, { ...AUTH_COOKIE.options, maxAge: AUTH_COOKIE.maxAge });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE.name, AUTH_COOKIE.options);
}

export function readAuthCookie(req: Request): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const item = part.trim();
    const eq = item.indexOf('=');
    if (eq === -1 || item.slice(0, eq) !== AUTH_COOKIE.name) continue;
    return decodeURIComponent(item.slice(eq + 1));
  }
  return undefined;
}