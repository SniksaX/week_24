import { db } from './DB.Init';

type UserRow = {
  id: number;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
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

  create(): User {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;

    const info = db
      .query(
        `INSERT INTO users (email, password, createdAt, updatedAt)
         VALUES (?, ?, ?, ?)`,
      )
      .run(this.email, this.password, now.toISOString(), now.toISOString());

    this.id = Number(info.lastInsertRowid);
    return this;
  }

  update(): void {
    this.updatedAt = new Date();
    db.query(
      `UPDATE users SET email = ?, password = ?, updatedAt = ? WHERE id = ?`,
    ).run(this.email, this.password, this.updatedAt.toISOString(), this.id);
  }

  delete(): void {
    db.query(`DELETE FROM users WHERE id = ?`).run(this.id);
  }

  static findOne(email: string): User | null {
    const row = db
      .query<UserRow, [string]>(`SELECT * FROM users WHERE email = ?`)
      .get(email);

    if (!row) return null;
    return new User(
      row.id,
      row.email,
      row.password,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    );
  }

  static findById(id: number): User | null {
    const row = db
      .query<UserRow, [number]>(`SELECT * FROM users WHERE id = ?`)
      .get(id);
    if (!row) return null;
    return new User(
      row.id,
      row.email,
      row.password,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    );
  }
}

export default User;