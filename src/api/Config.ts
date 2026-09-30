import { createRemoteJWKSet } from 'jose';
import type { CookieConfig, DbConfig, GoogleConfig } from './types/Types';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function loadGoogle(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export const PORT = Number(process.env.PORT ?? 3000);
export const APP_URL = process.env.APP_URL ?? '/';
export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

export const JWT_ALG = 'HS256';
export const JWT_EXPIRES_IN = '15m';
export const JWT_SECRET: Uint8Array = new TextEncoder().encode(required('JWT_SECRET'));

export const DB: DbConfig = {
  hostname: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3307),
  username: process.env.DB_USER ?? 'week_24',
  password: process.env.DB_PASSWORD ?? 'week_24',
  database: process.env.DB_NAME ?? 'week_24',
};

export const AUTH_COOKIE: CookieConfig = {
  name: 'token',
  maxAge: 1000 * 60 * 15,
  options: { httpOnly: true, sameSite: 'lax', path: '/' },
};

export const OAUTH_COOKIE: CookieConfig = {
  name: 'g_oauth',
  maxAge: 1000 * 60 * 10,
  options: { httpOnly: true, sameSite: 'lax', path: '/api/auth/google' },
};

export const GOOGLE: GoogleConfig | null = loadGoogle();
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_SCOPE = 'openid email';
export const GOOGLE_ISSUERS: string[] = ['https://accounts.google.com', 'accounts.google.com'];
export const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  'GET /health',
  'POST /api/auth/login',
  'POST /api/auth/register',
  'POST /api/auth/logout',
  'GET /api/auth/google',
  'GET /api/auth/google/callback',
]);