# Setup Instructions

## Initial Setup

1. **Generate database migrations:**
   ```bash
   npm run db:generate
   ```

2. **Apply migrations:**
   ```bash
   npm run db:push
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Seed the foods database:**
   - Open your browser and go to: `http://localhost:3000/api/seed`
   - Or use curl: `curl http://localhost:3000/api/seed`
   - This will populate the database with the Indian foods

5. **Create your account:**
   - Go to `http://localhost:3000/login`
   - Click "Sign Up" tab
   - Create a username and password
   - Complete the setup form with your body metrics

## Important Notes

### Authentication Flow

Currently, the app uses a placeholder for userId (`temp-user-id`). You'll need to implement proper session management:

**Option 1: Next.js Cookies (Recommended)**
- Use `cookies()` from `next/headers` in server components
- Store userId in a cookie after login
- Read it in server actions

**Option 2: JWT Tokens**
- Generate JWT after login
- Store in httpOnly cookie
- Verify in middleware

**Option 3: NextAuth.js**
- Full authentication solution
- Handles sessions, providers, etc.

For now, the app will work but you'll need to manually update the userId in:
- `app/dashboard/page.tsx` (line with `const userId = 'temp-user-id'`)
- `app/setup/page.tsx` (where userId is needed)

### Quick Fix for Testing

After creating an account on the login page, check the database or logs to get your actual userId, then temporarily hardcode it in the dashboard page for testing.

## Database Location

The SQLite database is stored at: `./data/transformatator.db`

## Available Routes

- `/` - Redirects to `/login`
- `/login` - Login/Sign up page
- `/setup` - User onboarding (first time only)
- `/dashboard` - Main dashboard with calculations and food tracking
- `/api/seed` - API endpoint to seed foods database

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` again
- Check that all dependencies are installed

### Database errors
- Make sure migrations have been run: `npm run db:push`
- Check that the `data/` directory exists and is writable
- Delete `data/transformatator.db` and run migrations again if needed

### "Foods not found"
- Make sure you've seeded the database by visiting `/api/seed`
- Check the database using `npm run db:studio`

### TypeScript errors
- Run `npm run build` to see all TypeScript errors
- Make sure all types are correctly imported

