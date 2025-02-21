import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Create a new database file if it doesn't exist
const sqlite = new Database('sqlite.db');

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
  );
`);

export const db = drizzle(sqlite, { schema });