import { createHash, randomBytes } from 'node:crypto';
import { jwtVerify } from 'jose';
import {
  GOOGLE,
  GOOGLE_AUTH_URL,
  GOOGLE_ISSUERS,
  GOOGLE_JWKS,
  GOOGLE_SCOPE,
  GOOGLE_TOKEN_URL,
} from '../Config';
import type {
  GoogleAuthRequest,
  GoogleConfig,
  GoogleProfile,
  GoogleTokenResponse,
} from '../types/Types';

function requireConfig(): GoogleConfig {
  if (!GOOGLE) throw new Error('Google auth is not configured');
  return GOOGLE;
}

export function isGoogleEnabled(): boolean {
  return GOOGLE !== null;
}

export function createAuthRequest(): GoogleAuthRequest {
  const { clientId, redirectUri } = requireConfig();
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  return { url: `${GOOGLE_AUTH_URL}?${params}`, state, verifier };
}

export async function exchangeCode(code: string, verifier: string): Promise<GoogleProfile> {
  const { clientId, clientSecret, redirectUri } = requireConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error('Google token exchange failed');

  const data = (await res.json()) as GoogleTokenResponse;
  if (typeof data.id_token !== 'string') throw new Error('Missing id_token');

  const { payload } = await jwtVerify(data.id_token, GOOGLE_JWKS, {
    issuer: GOOGLE_ISSUERS,
    audience: clientId,
  });
  if (
    typeof payload.sub !== 'string' ||
    typeof payload.email !== 'string' ||
    payload.email_verified !== true
  ) {
    throw new Error('Invalid Google identity');
  }
  return { sub: payload.sub, email: payload.email };
}