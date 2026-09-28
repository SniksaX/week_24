import { Database } from "bun:sqlite";

export const db = new Database(process.env.SQLITE_PATH ?? "week_24.sqlite", {
  readonly: false,
  create: true,    
  safeIntegers: false,
  strict: false,
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    body TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);
