import type { SessionOptions } from 'express-session';
import type { CookieConfig, DbConfig, GithubConfig, GoogleConfig } from './types/Types';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function loadOAuth(prefix: 'GOOGLE' | 'GITHUB'): GoogleConfig | null {
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];
  const redirectUri = process.env[`${prefix}_REDIRECT_URI`];
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

export const OAUTH_SESSION: SessionOptions = {
  name: 'oauth',
  secret: required('JWT_SECRET'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', path: '/api/auth', maxAge: 1000 * 60 * 10 },
};

export const GOOGLE: GoogleConfig | null = loadOAuth('GOOGLE');
export const GITHUB: GithubConfig | null = loadOAuth('GITHUB');

export const STRIPE_SECRET_KEY = required('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET = required('STRIPE_WEBHOOK_SECRET');
export const POST_ACCESS_PRICE = {
  currency: 'usd',
  unitAmount: 99900,
  name: 'Posting access',
} as const;

export const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  'GET /health',
  'POST /api/auth/login',
  'POST /api/auth/register',
  'POST /api/auth/logout',
  'GET /api/auth/google',
  'GET /api/auth/google/callback',
  'GET /api/auth/github',
  'GET /api/auth/github/callback',
  'POST /api/stripe/webhook',
]);