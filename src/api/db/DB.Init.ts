import { SQL } from 'bun';
import { DB } from '../Config';

export const db = new SQL({
  adapter: 'mariadb',
  ...DB,
  allowPublicKeyRetrieval: true,
});

await db`
  CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    googleId VARCHAR(255) NULL UNIQUE,
    hasPaid BOOLEAN NOT NULL DEFAULT FALSE,
    \`createdAt\` DATETIME(3) NOT NULL,
    \`updatedAt\` DATETIME(3) NOT NULL
  )
`;

await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS googleId VARCHAR(255) NULL UNIQUE`;
await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS hasPaid BOOLEAN NOT NULL DEFAULT FALSE`;
await db`ALTER TABLE users MODIFY password VARCHAR(255) NULL`;

await db`
  CREATE TABLE IF NOT EXISTS posts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    body TEXT NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL,
    CONSTRAINT fk_posts_user FOREIGN KEY (userId) REFERENCES users (id)
  )
`;