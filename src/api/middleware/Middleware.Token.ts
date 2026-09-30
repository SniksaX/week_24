import { SignJWT, jwtVerify } from 'jose';
import { JWT_ALG, JWT_EXPIRES_IN, JWT_SECRET } from '../Config';

export class Token {
  static sign(email: string): Promise<string> {
    return new SignJWT({ email })
      .setProtectedHeader({ alg: JWT_ALG })
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(JWT_SECRET);
  }

  static async verify(token: string): Promise<string> {
    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: [JWT_ALG] });
    if (typeof payload.email !== 'string') throw new Error('Invalid token');
    return payload.email;
  }
}