import { SQL } from 'bun';

export const db = new SQL({
  adapter: 'mariadb',
  hostname: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? '',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'test_week_24',
  allowPublicKeyRetrieval: true,
});

await db`
  CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL,
    \`updatedAt\` DATETIME(3) NOT NULL
  )
`;

await db`
  CREATE TABLE IF NOT EXISTS posts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    body TEXT NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL,
    CONSTRAINT fk_posts_user FOREIGN KEY (userId) REFERENCES users (id)
  )
`;
