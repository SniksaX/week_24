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

export type GithubConfig = GoogleConfig;

export type GoogleProfile = { sub: string; email: string };

export type GithubEmail = { value: string; primary?: boolean; verified?: boolean };

export type OAuthIdentity = { id: string; email: string };

export type AuthResult = { token: string; email: string };

declare global {
  namespace Express {
    interface User {
      email: string;
    }
  }
}