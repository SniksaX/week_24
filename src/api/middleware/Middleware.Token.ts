import { SignJWT, jwtVerify } from 'jose';

const raw = process.env.JWT_SECRET ?? 'dev-jwt-secret';

if (!raw) 
    throw new Error('JWT_SECRET is not set');
const secret: Uint8Array = new TextEncoder().encode(raw);

export class Token {
    public static async sign(email: string) : Promise<string> {
        return await new SignJWT({ email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('15m')
            .sign(secret);
    }

    public static  async verify(token: string) : Promise<string> {
        const { payload } = await jwtVerify(token, secret);
        if (!payload.email) {
            throw new Error('Invalid token');
        }
        return payload.email as string;
    }
}