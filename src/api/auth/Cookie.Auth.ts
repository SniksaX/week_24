import type { Request, Response } from 'express';

const NAME = 'token';

const options = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 1000 * 60 * 15,
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(NAME, token, options);
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export function readAuthCookie(req: Request): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const item = part.trim();
    const eq = item.indexOf('=');
    if (eq === -1 || item.slice(0, eq) !== NAME) continue;
    return decodeURIComponent(item.slice(eq + 1));
  }

  return undefined;
}
