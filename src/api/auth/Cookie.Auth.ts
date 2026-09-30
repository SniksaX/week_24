import type { Request, Response } from 'express';
import { AUTH_COOKIE, OAUTH_COOKIE } from '../Config';
import type { CookieConfig } from '../types/Types';

function setCookie(res: Response, cookie: CookieConfig, value: string): void {
  res.cookie(cookie.name, value, { ...cookie.options, maxAge: cookie.maxAge });
}

function clearCookie(res: Response, cookie: CookieConfig): void {
  res.clearCookie(cookie.name, cookie.options);
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const item = part.trim();
    const eq = item.indexOf('=');
    if (eq === -1 || item.slice(0, eq) !== name) continue;
    return decodeURIComponent(item.slice(eq + 1));
  }
  return undefined;
}

export function setAuthCookie(res: Response, token: string): void {
  setCookie(res, AUTH_COOKIE, token);
}

export function clearAuthCookie(res: Response): void {
  clearCookie(res, AUTH_COOKIE);
}

export function readAuthCookie(req: Request): string | undefined {
  return readCookie(req, AUTH_COOKIE.name);
}

export function setOAuthCookie(res: Response, value: string): void {
  setCookie(res, OAUTH_COOKIE, value);
}

export function clearOAuthCookie(res: Response): void {
  clearCookie(res, OAUTH_COOKIE);
}

export function readOAuthCookie(req: Request): string | undefined {
  return readCookie(req, OAUTH_COOKIE.name);
}