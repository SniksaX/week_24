import { db } from './DB.Init';

type UserRow = {
  id: number;
  email: string;
  password: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

class User {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  async create(): Promise<User> {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;

    const result = await db`
      INSERT INTO users (email, password, \`createdAt\`, \`updatedAt\`)
      VALUES (${this.email}, ${this.password}, ${now}, ${now})
    `;

    this.id = Number(result.lastInsertRowid);
    return this;
  }

  async update(): Promise<void> {
    this.updatedAt = new Date();
    await db`
      UPDATE users
      SET email = ${this.email}, password = ${this.password}, \`updatedAt\` = ${this.updatedAt}
      WHERE id = ${this.id}
    `;
  }

  async delete(): Promise<void> {
    await db`DELETE FROM users WHERE id = ${this.id}`;
  }

  static async findOne(email: string): Promise<User | null> {
    const rows = await db`SELECT * FROM users WHERE email = ${email}`;
    return rowToUser(rows[0]);
  }

  static async findById(id: number): Promise<User | null> {
    const rows = await db`SELECT * FROM users WHERE id = ${id}`;
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
  );
}

export default User;
