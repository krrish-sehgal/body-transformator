import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Get database URL from environment variables
// Vercel Postgres provides POSTGRES_URL
// For local dev, use DATABASE_URL or POSTGRES_URL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
}

// Create postgres client
const client = postgres(connectionString, {
  max: 1, // Limit connections for serverless
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Run migrations (only in development or on first deploy)
// In production, migrations should be run separately
if (process.env.NODE_ENV !== 'production' || process.env.RUN_MIGRATIONS === 'true') {
  migrate(db, { migrationsFolder: './lib/db/migrations' })
    .then(() => {
      console.log('✅ Migrations completed');
    })
    .catch((error) => {
      // Don't fail if migrations already ran
      if (error.message?.includes('already exists')) {
        console.log('ℹ️ Migrations already applied');
      } else {
        console.error('❌ Migration error:', error);
      }
    });
}
