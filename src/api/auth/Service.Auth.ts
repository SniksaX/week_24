import bcrypt from 'bcrypt';
import User from '../db/DB.Model.User';

export type SessionUser = {
  id: number;
  email: string;
};

class AuthService {
  async login(email: string, password: string): Promise<SessionUser> {
    const user = User.findOne(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    return { id: user.id, email: user.email };
  }

  async register(email: string, password: string): Promise<SessionUser> {
    if (User.findOne(email)) {
      throw new Error('User already exists');
    }
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
    const hashed = await bcrypt.hash(password, rounds);
    const user = new User(0, email, hashed, new Date(), new Date());
    user.create();
    return { id: user.id, email: user.email };
  }
}

export default new AuthService();
