# Setup Guide

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git (optional)

## Initial Setup Steps

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

### 2. Install Dependencies

```bash
npm install drizzle-orm better-sqlite3 react-hook-form zod @hookform/resolvers recharts date-fns
npm install -D drizzle-kit @types/better-sqlite3
```

### 3. Configure Drizzle

Create `drizzle.config.ts`:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './data/transformatator.db',
  },
} satisfies Config;
```

### 4. Create Database Directory

```bash
mkdir -p data
echo "*.db" >> .gitignore
```

### 5. Generate Initial Migration

```bash
npx drizzle-kit generate
```

### 6. Run Migration

```bash
npx drizzle-kit push
```

### 7. Seed Initial Data

Create a script to seed foods:

```bash
# Add to package.json scripts:
"seed": "tsx lib/db/seed.ts"
```

Run it:
```bash
npm run seed
```

## Development Workflow

### Database Changes

1. Update `lib/db/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Review migration files in `lib/db/migrations/`
4. Apply: `npx drizzle-kit push` (or migrate in code)

### Running Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Drizzle ORM (if available)

## Git Ignore Additions

```
# Database
data/*.db
data/*.db-journal

# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env*.local

# Misc
.DS_Store
```

