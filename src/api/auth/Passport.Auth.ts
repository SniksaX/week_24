import session from 'express-session';
import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GITHUB, GOOGLE, OAUTH_SESSION } from '../Config';
import type { GithubEmail, OAuthIdentity } from '../types/Types';

type Done = (error: unknown, user?: OAuthIdentity | false) => void;

if (GOOGLE) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE.clientId,
        clientSecret: GOOGLE.clientSecret,
        callbackURL: GOOGLE.redirectUri,
        scope: ['openid', 'email'],
        state: true,
        pkce: true,
      },
      (_accessToken: string, _refreshToken: string, profile, done: Done) => {
        const email = profile.emails?.find((e) => e.verified)?.value;
        done(null, email ? { id: profile.id, email } : false);
      },
    ),
  );
}

if (GITHUB) {
  passport.use(
    new GithubStrategy(
      {
        clientID: GITHUB.clientId,
        clientSecret: GITHUB.clientSecret,
        callbackURL: GITHUB.redirectUri,
        scope: ['user:email'],
        state: true,
        allRawEmails: true,
      },
      (
        _accessToken: string,
        _refreshToken: string,
        profile: { id: string; emails?: unknown },
        done: Done,
      ) => {
        const emails = (profile.emails ?? []) as GithubEmail[];
        const email = emails.find((e) => e.primary && e.verified)?.value;
        done(null, email ? { id: profile.id, email } : false);
      },
    ),
  );
}

export const oauthSession = session(OAUTH_SESSION);

export default passport;