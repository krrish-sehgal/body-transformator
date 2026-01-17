# Body Recomposition Tracker

A personal web app for tracking body recomposition (lose fat + gain muscle) with transparent calculation formulas.

## Features

- **Authentication**: Simple username/password login with bcrypt
- **Onboarding**: Collect user data (weight, height, age, body fat %, gender, activity level)
- **Transparent Calculations**: See exactly how your macro targets are calculated
  - BMR (Mifflin-St Jeor Equation)
  - Maintenance Calories
  - Recomp Calories
  - Protein, Carbs, and Fats requirements
- **Food Tracking**: Track daily food intake against your targets
- **Indian Foods Database**: Pre-loaded with common Indian foods (roti, rice, paneer, chicken, etc.)

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **SQLite** with **Drizzle ORM**
- **bcrypt** for password hashing
- **Tailwind CSS** for styling
- **React Hook Form** + **Zod** for form validation

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Database Migrations

```bash
npm run db:generate
```

### 3. Run Migrations

```bash
npm run db:push
```

### 4. Seed Foods Database

First, update the seed script to use the correct import (we'll need to adjust for Next.js). You can run it manually or add it to package.json:

```bash
# Add to package.json scripts:
# "seed": "tsx lib/db/seed.ts"
npm run seed
```

Or run it programmatically when the app starts (already set up in lib/db/index.ts).

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
transformatator/
├── app/
│   ├── dashboard/         # Main dashboard page
│   ├── login/            # Login/signup page
│   ├── setup/            # User onboarding
│   └── layout.tsx        # Root layout
├── lib/
│   ├── actions/          # Server actions
│   ├── calculations/     # Recomp calculation formulas
│   ├── db/              # Database schema & connection
│   └── utils/           # Utility functions
└── components/          # React components
```

## Database Schema

- **users**: Authentication (username, password hash)
- **user_profiles**: User data and calculated targets
- **foods**: Hardcoded food database with macros
- **daily_logs**: Daily food log entries
- **log_entries**: Individual food entries per day
- **body_metrics**: Body weight and body fat tracking

## Calculation Formulas

All formulas are transparent and displayed in the dashboard:

1. **BMR**: Mifflin-St Jeor Equation (adjusted for gender)
2. **Maintenance**: BMR × Activity Multiplier
3. **Recomp Calories**: Maintenance + 150 kcal
4. **Protein**: 2.2g per kg bodyweight
5. **Fats**: 1.0g per kg bodyweight
6. **Carbs**: Remaining calories after protein and fat

## Notes

- Currently using a placeholder for userId (`temp-user-id`)
- You'll need to implement proper session/auth management (NextAuth.js, JWT, or cookies)
- Database file is stored in `/data/transformatator.db` (gitignored)

## Next Steps

1. Implement proper authentication/session management
2. Add body metrics tracking page
3. Add charts for progress visualization
4. Add food search/filtering
5. Add history view for past logs

