import bcrypt from 'bcrypt';
import User from '../db/DB.Model.User';
import { Token } from '../middleware/Middleware.Token';


class AuthService {
  async login(email: string, password: string): Promise<{ token: string; email: string }> {
    const user = User.findOne(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return { token: await Token.sign(user.email), email: user.email };
  }

  async register(email: string, password: string): Promise<{ token: string; email: string }> {
    if (User.findOne(email)) {
      throw new Error('User already exists');
    }
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
    const hashed = await bcrypt.hash(password, rounds);
    const user = new User(0, email, hashed, new Date(), new Date());
    user.create();  
    return { token: await Token.sign(user.email), email: user.email };
  }
}

export default new AuthService();
