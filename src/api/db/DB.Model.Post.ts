import { db } from './DB.Init';

type PostRow = {
  id: number;
  userId: number;
  body: string;
  createdAt: string;
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

  create(): Post {
    const now = new Date();
    this.createdAt = now;
    const info = db
      .query(`INSERT INTO posts (userId, body, createdAt) VALUES (?, ?, ?)`)
      .run(this.userId, this.body, now.toISOString());
    this.id = Number(info.lastInsertRowid);
    return this;
  }

  static listByUser(userId: number): Post[] {
    const rows = db
      .query<PostRow, [number]>(
        `SELECT * FROM posts WHERE userId = ? ORDER BY id DESC`,
      )
      .all(userId);
    return rows.map((row) => new Post(row.id, row.userId, row.body, new Date(row.createdAt)));
  }

  static deleteForUser(id: number, userId: number): boolean {
    const info = db
      .query(`DELETE FROM posts WHERE id = ? AND userId = ?`)
      .run(id, userId);
    return info.changes > 0;
  }
}

export default Post;
