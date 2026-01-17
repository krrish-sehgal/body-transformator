# Vercel Postgres Setup Guide

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel project: https://vercel.com/krrish-sehgals-projects/body-transformator
2. Click on the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a plan (Hobby/Free tier is fine for development)
6. Select a region (choose closest to you)
7. Click **Create**

## Step 2: Get Connection String

After creating the database:

1. Vercel will automatically add the `POSTGRES_URL` environment variable
2. You can verify this in **Settings** → **Environment Variables**
3. The connection string should look like: `postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb`

## Step 3: Run Migrations

You have two options:

### Option A: Run migrations via Vercel CLI (Recommended)

```bash
# Set the POSTGRES_URL locally (get it from Vercel dashboard)
export POSTGRES_URL="your-connection-string-here"

# Generate migrations (if needed)
npm run db:generate

# Push schema to database
npm run db:push
```

### Option B: Run migrations on Vercel (One-time)

1. Go to your Vercel project settings
2. Go to **Environment Variables**
3. Add a new variable:
   - **Key**: `RUN_MIGRATIONS`
   - **Value**: `true`
4. Redeploy your app
5. After first deploy, remove or set `RUN_MIGRATIONS` to `false`

## Step 4: Verify Deployment

1. Visit your app: https://body-transformator.vercel.app
2. Try to sign up/login
3. If you see database errors, check Vercel logs

## Troubleshooting

### Database connection errors
- Verify `POSTGRES_URL` is set in Vercel environment variables
- Check that the database is created and active
- Ensure migrations have run

### Migration errors
- Run `npm run db:push` locally with the connection string
- Or use the Vercel CLI: `vercel env pull` to get env vars locally

### Local Development

For local development, you can:

1. Use the Vercel Postgres connection string locally (not recommended for production data)
2. Or set up a local PostgreSQL instance:
   ```bash
   # Install PostgreSQL locally or use Docker
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   
   # Then set in .env.local:
   POSTGRES_URL=postgresql://postgres:password@localhost:5432/transformatator
   ```

## Notes

- The app will automatically run migrations on first startup if `RUN_MIGRATIONS=true`
- After initial setup, you can remove the `RUN_MIGRATIONS` variable
- All database operations now use PostgreSQL instead of SQLite

