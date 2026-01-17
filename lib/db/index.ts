import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'transformatator.db');
const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON'); // Enable foreign keys

export const db = drizzle(sqlite, { schema });

// Run migrations on first import (only in development)
if (process.env.NODE_ENV !== 'production') {
  try {
    migrate(db, { migrationsFolder: './lib/db/migrations' });
  } catch (error) {
    // Migrations might not exist yet, that's okay
    console.log('No migrations found, run: npm run db:generate');
  }
}

