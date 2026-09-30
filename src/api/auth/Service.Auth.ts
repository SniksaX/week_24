import bcrypt from 'bcrypt';
import User from '../db/DB.Model.User';
import { Token } from '../middleware/Middleware.Token';
import { BCRYPT_ROUNDS } from '../Config';
import type { AuthResult, GoogleProfile } from '../types/Types';

class AuthService {
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await User.findOne(email);
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return { token: await Token.sign(user.email), email: user.email };
  }

  async register(email: string, password: string): Promise<AuthResult> {
    if (await User.findOne(email)) {
      throw new Error('User already exists');
    }
    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await new User(0, email, hashed, new Date(), new Date()).create();
    return { token: await Token.sign(user.email), email: user.email };
  }

  async loginWithGoogle(profile: GoogleProfile): Promise<AuthResult> {
    let user = await User.findByGoogleId(profile.sub);
    if (!user) {
      user = await User.findOne(profile.email);
      if (user) {
        user.googleId = profile.sub;
        await user.update();
      } else {
        user = await new User(0, profile.email, null, new Date(), new Date(), profile.sub).create();
      }
    }
    return { token: await Token.sign(user.email), email: user.email };
  }
}

export default new AuthService();