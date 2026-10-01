import { randomBytes } from 'node:crypto';
import {
  GITHUB,
  GITHUB_AUTH_URL,
  GITHUB_EMAILS_URL,
  GITHUB_SCOPE,
  GITHUB_TOKEN_URL,
} from '../Config';
import type {
  GithubAuthRequest,
  GithubConfig,
  GithubEmail,
  GithubTokenResponse,
} from '../types/Types';

function requireConfig(): GithubConfig {
  if (!GITHUB) throw new Error('GitHub auth is not configured');
  return GITHUB;
}

export function isGithubEnabled(): boolean {
  return GITHUB !== null;
}

export function createGithubAuthRequest(): GithubAuthRequest {
  const { clientId, redirectUri } = requireConfig();
  const state = randomBytes(32).toString('base64url');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: GITHUB_SCOPE,
    state,
  });
  return { url: `${GITHUB_AUTH_URL}?${params}`, state };
}

export async function exchangeGithubCode(code: string): Promise<string> {
  const { clientId, clientSecret, redirectUri } = requireConfig();
  const tokenRes = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) throw new Error('GitHub token exchange failed');

  const data = (await tokenRes.json()) as GithubTokenResponse;
  if (typeof data.access_token !== 'string') throw new Error('Missing access_token');

  const emailsRes = await fetch(GITHUB_EMAILS_URL, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'auth-app',
    },
  });
  if (!emailsRes.ok) throw new Error('GitHub emails request failed');

  const emails = (await emailsRes.json()) as GithubEmail[];
  const primary = emails.find((e) => e.primary && e.verified);
  if (!primary) throw new Error('No verified primary email');
  return primary.email;
}