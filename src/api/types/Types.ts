import type { CookieOptions } from 'express';

export type UserRow = {
  id: number;
  email: string;
  password: string | null;
  googleId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type PostRow = {
  id: number;
  userId: number;
  body: string;
  createdAt: Date | string;
};

export type DbConfig = {
  hostname: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type CookieConfig = {
  name: string;
  maxAge: number;
  options: CookieOptions;
};

export type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GoogleProfile = { sub: string; email: string };

export type GoogleAuthRequest = { url: string; state: string; verifier: string };

export type GoogleTokenResponse = { id_token?: unknown };

export type GithubConfig = GoogleConfig;

export type GithubAuthRequest = { url: string; state: string };

export type GithubTokenResponse = { access_token?: unknown };

export type GithubEmail = { email: string; primary: boolean; verified: boolean };

export type AuthResult = { token: string; email: string };

export type AuthUser = { email: string };

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}