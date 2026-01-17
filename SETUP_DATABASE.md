# Step-by-Step: Create Database & Run Migrations

## Part 1: Create Vercel Postgres Database

### Step 1: Go to Your Vercel Project
1. Open: https://vercel.com/krrish-sehgals-projects/body-transformator
2. Or go to https://vercel.com/dashboard and find "body-transformator"

### Step 2: Navigate to Storage
1. In your project dashboard, click on the **"Storage"** tab (in the top navigation)
2. If you don't see it, click **"Settings"** first, then look for **"Storage"** in the sidebar

### Step 3: Create Postgres Database
1. Click the **"Create Database"** button
2. Select **"Postgres"** from the options
3. You'll see a form with:
   - **Name**: Keep default or name it (e.g., "body-transformator-db")
   - **Region**: Choose closest to you (e.g., "Washington, D.C., USA (East)")
   - **Plan**: Select **"Hobby"** (Free tier)
4. Click **"Create"**

### Step 4: Wait for Database Creation
- Vercel will create the database (takes ~30 seconds)
- Once created, you'll see the database in the Storage tab
- **Important**: Vercel automatically adds `POSTGRES_URL` to your environment variables

### Step 5: Get Your Connection String
1. Click on your database name in the Storage tab
2. Go to the **".env.local"** tab or **"Settings"** tab
3. You'll see `POSTGRES_URL` - copy this value
   - It looks like: `postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb`
4. **Note**: You can also find this in **Settings → Environment Variables**

---

## Part 2: Run Migrations

You have **TWO options**. Choose the easier one for you:

---

### Option A: Run Migrations Locally (Easier - Recommended)

#### Step 1: Get Connection String
1. Go to Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Find `POSTGRES_URL` and copy its value
3. Or go to **Storage** → Click your database → Copy the connection string

#### Step 2: Set Environment Variable Locally
Open your terminal in the project directory and run:

```bash
# Replace with your actual connection string from Vercel
export POSTGRES_URL="postgres://default:xxxxx@xxxxx.vercel-storage.com:5432/verceldb"
```

**OR** create a `.env.local` file in the project root:

```bash
# Create .env.local file
echo 'POSTGRES_URL=your-connection-string-here' > .env.local
```

#### Step 3: Run Migrations
```bash
# This will create all the tables in your database
npm run db:push
```

You should see output like:
```
✓ Pushing schema to database...
✓ Tables created successfully
```

#### Step 4: Verify (Optional)
You can check if tables were created:
```bash
# Open Drizzle Studio to see your database
npm run db:studio
```
This opens a web interface at http://localhost:4983 where you can see all tables.

---

### Option B: Run Migrations via Vercel (One-time Auto-migration)

#### Step 1: Add Environment Variable
1. Go to Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add:
   - **Key**: `RUN_MIGRATIONS`
   - **Value**: `true`
   - **Environment**: Select all (Production, Preview, Development)
4. Click **"Save"**

#### Step 2: Redeploy
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~2-3 minutes)

#### Step 3: Remove Migration Flag (Important!)
After the first successful deployment:
1. Go back to **Settings** → **Environment Variables**
2. Find `RUN_MIGRATIONS`
3. Either delete it or change value to `false`
4. This prevents migrations from running on every deploy

---

## Part 3: Verify Everything Works

### Test the App
1. Visit: https://body-transformator.vercel.app
2. Try to **Sign Up** with a new account
3. If it works, the database is set up correctly! ✅

### Check Vercel Logs (if there are errors)
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"View Function Logs"** or check the build logs
4. Look for any database connection errors

---

## Troubleshooting

### Error: "POSTGRES_URL is required"
- Make sure you created the database in Vercel
- Check that `POSTGRES_URL` exists in Vercel Environment Variables
- If running locally, make sure you set it in `.env.local`

### Error: "relation does not exist" or "table not found"
- Migrations haven't run yet
- Run `npm run db:push` locally with the connection string
- Or use Option B above to auto-run migrations

### Error: "connection refused" or "timeout"
- Check your connection string is correct
- Make sure the database is created and active in Vercel
- Try copying the connection string again from Vercel dashboard

### Can't find Storage tab
- Make sure you're on the project page (not dashboard)
- Try: Project → Settings → Storage
- Or use the search bar in Vercel to find "Storage"

---

## Quick Command Reference

```bash
# Set connection string (replace with your actual URL)
export POSTGRES_URL="your-connection-string"

# Run migrations
npm run db:push

# View database (optional)
npm run db:studio

# Generate new migrations (if you change schema)
npm run db:generate
```

---

## Need Help?

If you get stuck:
1. Check Vercel logs for error messages
2. Make sure the database is created and active
3. Verify `POSTGRES_URL` is set correctly
4. Try Option A (local migration) - it's usually easier to debug

