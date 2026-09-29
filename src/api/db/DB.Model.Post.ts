import { db } from './DB.Init';

type PostRow = {
  id: number;
  userId: number;
  body: string;
  createdAt: Date | string;
};

class Post {
  id: number;
  userId: number;
  body: string;
  createdAt: Date;

  constructor(id: number, userId: number, body: string, createdAt: Date) {
    this.id = id;
    this.userId = userId;
    this.body = body;
    this.createdAt = createdAt;
  }

  async create(): Promise<Post> {
    const now = new Date();
    this.createdAt = now;
    const result = await db`
      INSERT INTO posts (userId, body, \`createdAt\`)
      VALUES (${this.userId}, ${this.body}, ${now})
    `;
    this.id = Number(result.lastInsertRowid);
    return this;
  }

  static async listByUser(userId: number): Promise<Post[]> {
    const rows = await db`
      SELECT * FROM posts WHERE userId = ${userId} ORDER BY id DESC
    `;
    return rows.map((row: PostRow) => new Post(row.id, row.userId, row.body, new Date(row.createdAt)));
  }

  static async deleteForUser(id: number, userId: number): Promise<boolean> {
    const result = await db`DELETE FROM posts WHERE id = ${id} AND userId = ${userId}`;
    return result.affectedRows > 0;
  }
}

export default Post;
