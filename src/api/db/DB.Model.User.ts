import { db } from './DB.Init';
import type { UserRow } from '../types/Types';

class User {
  id: number;
  email: string;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
  googleId: string | null;
  hasPaid: boolean;

  constructor(
    id: number,
    email: string,
    password: string | null,
    createdAt: Date,
    updatedAt: Date,
    googleId: string | null = null,
    hasPaid = false,
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.googleId = googleId;
    this.hasPaid = hasPaid;
  }

  async create(): Promise<User> {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
    const result = await db`
      INSERT INTO users (email, password, googleId, \`createdAt\`, \`updatedAt\`)
      VALUES (${this.email}, ${this.password}, ${this.googleId}, ${now}, ${now})
    `;
    this.id = Number(result.lastInsertRowid);
    return this;
  }

  async update(): Promise<void> {
    this.updatedAt = new Date();
    await db`
      UPDATE users
      SET email = ${this.email}, password = ${this.password}, googleId = ${this.googleId},
          \`updatedAt\` = ${this.updatedAt}
      WHERE id = ${this.id}
    `;
  }

  async delete(): Promise<void> {
    await db`DELETE FROM users WHERE id = ${this.id}`;
  }

  static async markPaid(id: number): Promise<void> {
    await db`UPDATE users SET hasPaid = TRUE, \`updatedAt\` = ${new Date()} WHERE id = ${id}`;
  }

  static async findOne(email: string): Promise<User | null> {
    const rows = await db`SELECT * FROM users WHERE email = ${email}`;
    return rowToUser(rows[0]);
  }

  static async findById(id: number): Promise<User | null> {
    const rows = await db`SELECT * FROM users WHERE id = ${id}`;
    return rowToUser(rows[0]);
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    const rows = await db`SELECT * FROM users WHERE googleId = ${googleId}`;
    return rowToUser(rows[0]);
  }
}

function rowToUser(row: UserRow | undefined): User | null {
  if (!row) return null;
  return new User(
    row.id,
    row.email,
    row.password,
    new Date(row.createdAt),
    new Date(row.updatedAt),
    row.googleId,
    Boolean(row.hasPaid),
  );
}

export default User;