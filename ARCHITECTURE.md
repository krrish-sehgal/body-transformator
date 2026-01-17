# Architecture & Implementation Details

## Database Schema (Detailed)

### SQLite Schema Definition (Drizzle ORM)

```typescript
// lib/db/schema.ts

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const foods = sqliteTable('foods', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  caloriesPer100g: real('calories_per_100g').notNull(),
  proteinPer100g: real('protein_per_100g').notNull(),
  carbsPer100g: real('carbs_per_100g').notNull(),
  fatsPer100g: real('fats_per_100g').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const dailyLogs = sqliteTable('daily_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: text('date').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const logEntries = sqliteTable('log_entries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  dailyLogId: text('daily_log_id').notNull().references(() => dailyLogs.id, { onDelete: 'cascade' }),
  foodId: text('food_id').notNull().references(() => foods.id, { onDelete: 'cascade' }),
  quantityGrams: real('quantity_grams').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const bodyMetrics = sqliteTable('body_metrics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: text('date').notNull(),
  weightKg: real('weight_kg'),
  waistCm: real('waist_cm'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  activityLevel: text('activity_level', { enum: ['sedentary', 'light', 'moderate', 'active'] }).notNull().default('moderate'),
  goal: text('goal', { enum: ['maintenance', 'cut', 'bulk', 'recomp'] }).notNull().default('maintenance'),
  targetCalories: real('target_calories'),
  proteinRatio: real('protein_ratio'), // g per kg bodyweight
  fatRatio: real('fat_ratio'), // g per kg bodyweight
  heightCm: real('height_cm'),
  age: integer('age'),
  gender: text('gender', { enum: ['male', 'female'] }),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
```

### Indexes

```typescript
// Add indexes for common queries
export const dailyLogsDateIndex = index('daily_logs_date_idx').on(dailyLogs.date);
export const bodyMetricsDateIndex = index('body_metrics_date_idx').on(bodyMetrics.date);
export const logEntriesDailyLogIdIndex = index('log_entries_daily_log_id_idx').on(logEntries.dailyLogId);
```

---

## Type Definitions

```typescript
// types/index.ts

import { z } from 'zod';

// Food types
export const FoodSchema = z.object({
  id: z.string(),
  name: z.string(),
  caloriesPer100g: z.number(),
  proteinPer100g: z.number(),
  carbsPer100g: z.number(),
  fatsPer100g: z.number(),
  createdAt: z.string(),
});

export type Food = z.infer<typeof FoodSchema>;

// Daily Log types
export const LogEntrySchema = z.object({
  id: z.string(),
  dailyLogId: z.string(),
  foodId: z.string(),
  quantityGrams: z.number(),
  createdAt: z.string(),
});

export const DailyLogSchema = z.object({
  id: z.string(),
  date: z.string(),
  entries: z.array(LogEntrySchema.extend({ food: FoodSchema })),
  totalCalories: z.number(),
  totalProtein: z.number(),
  totalCarbs: z.number(),
  totalFats: z.number(),
});

export type DailyLog = z.infer<typeof DailyLogSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;

// Body Metrics types
export const BodyMetricSchema = z.object({
  id: z.string(),
  date: z.string(),
  weightKg: z.number().nullable(),
  waistCm: z.number().nullable(),
  createdAt: z.string(),
});

export type BodyMetric = z.infer<typeof BodyMetricSchema>;

// User Settings types
export const ActivityLevelSchema = z.enum(['sedentary', 'light', 'moderate', 'active']);
export const GoalSchema = z.enum(['maintenance', 'cut', 'bulk', 'recomp']);

export const UserSettingsSchema = z.object({
  id: z.string(),
  activityLevel: ActivityLevelSchema,
  goal: GoalSchema,
  targetCalories: z.number().nullable(),
  proteinRatio: z.number().nullable(),
  fatRatio: z.number().nullable(),
  heightCm: z.number().nullable(),
  age: z.number().nullable(),
  gender: z.enum(['male', 'female']).nullable(),
  updatedAt: z.string(),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
```

---

## Calculation Logic

### Maintenance Calories Calculation

```typescript
// lib/calculations/maintenance.ts

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate maintenance calories
 */
export function calculateMaintenanceCalories(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): number {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate goal-adjusted calories
 */
export function calculateTargetCalories(
  maintenance: number,
  goal: 'maintenance' | 'cut' | 'bulk' | 'recomp'
): number {
  switch (goal) {
    case 'maintenance':
      return maintenance;
    case 'cut':
      return maintenance - 500;
    case 'bulk':
      return maintenance + 500;
    case 'recomp':
      return maintenance + 100; // Slight surplus for muscle gain
    default:
      return maintenance;
  }
}
```

### Macro Distribution

```typescript
// lib/calculations/macros.ts

/**
 * Calculate macro targets in grams
 */
export function calculateMacroTargets(
  targetCalories: number,
  weightKg: number,
  proteinRatio: number = 2.2, // g per kg
  fatRatio: number = 0.9 // g per kg
): {
  protein: number;
  fats: number;
  carbs: number;
  calories: number;
} {
  // Protein: 2.2g per kg bodyweight (or 4 cal/g)
  const proteinGrams = Math.round(weightKg * proteinRatio);
  const proteinCalories = proteinGrams * 4;

  // Fats: 0.9g per kg bodyweight (or 9 cal/g)
  const fatGrams = Math.round(weightKg * fatRatio);
  const fatCalories = fatGrams * 9;

  // Carbs: remaining calories (or 4 cal/g)
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbGrams = Math.round(carbCalories / 4);

  return {
    protein: proteinGrams,
    fats: fatGrams,
    carbs: carbGrams,
    calories: targetCalories,
  };
}
```

---

## API Route Structure (Server Actions or API Routes)

### Option 1: Server Actions (Recommended for Next.js App Router)

```typescript
// app/actions/foods.ts
'use server';

import { db } from '@/lib/db';
import { foods } from '@/lib/db/schema';

export async function getAllFoods() {
  return await db.select().from(foods).orderBy(foods.name);
}

export async function getDailyLog(date: string) {
  // Implementation
}

export async function createLogEntry(dailyLogId: string, foodId: string, quantityGrams: number) {
  // Implementation
}
```

### Option 2: API Routes

```
app/api/
├── foods/
│   ├── route.ts          # GET /api/foods
│   └── [id]/
│       └── route.ts      # GET/PUT/DELETE /api/foods/[id]
├── logs/
│   ├── route.ts          # GET/POST /api/logs
│   └── [date]/
│       └── route.ts      # GET /api/logs/[date]
├── metrics/
│   ├── route.ts          # GET/POST /api/metrics
│   └── [date]/
│       └── route.ts      # GET /api/metrics/[date]
└── settings/
    └── route.ts          # GET/PUT /api/settings
```

---

## Seed Data Example

```typescript
// lib/db/seed.ts

import { db } from './index';
import { foods } from './schema';

const SEED_FOODS = [
  { name: 'Chicken Breast (raw)', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatsPer100g: 3.6 },
  { name: 'Eggs (whole)', caloriesPer100g: 143, proteinPer100g: 13, carbsPer100g: 1.1, fatsPer100g: 9.5 },
  { name: 'White Rice (cooked)', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatsPer100g: 0.3 },
  { name: 'Oatmeal (cooked)', caloriesPer100g: 68, proteinPer100g: 2.4, carbsPer100g: 12, fatsPer100g: 1.4 },
  { name: 'Peanut Butter', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatsPer100g: 50 },
  { name: 'Banana', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatsPer100g: 0.3 },
  { name: 'Broccoli (raw)', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatsPer100g: 0.4 },
  { name: 'Salmon (raw)', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatsPer100g: 12 },
  { name: 'Greek Yogurt (plain)', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatsPer100g: 0.4 },
  { name: 'Sweet Potato (cooked)', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatsPer100g: 0.1 },
];

export async function seedFoods() {
  // Check if foods already exist
  const existing = await db.select().from(foods).limit(1);
  if (existing.length > 0) {
    console.log('Foods already seeded');
    return;
  }

  // Insert seed foods
  await db.insert(foods).values(
    SEED_FOODS.map(food => ({
      ...food,
      id: crypto.randomUUID(),
    }))
  );

  console.log(`Seeded ${SEED_FOODS.length} foods`);
}
```

---

## Component Structure Examples

### Food Entry Form Component

```typescript
// components/log/FoodEntryForm.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const entrySchema = z.object({
  foodId: z.string().min(1, 'Select a food'),
  quantityGrams: z.number().min(1, 'Enter quantity'),
});

export function FoodEntryForm({ foods, onSubmit }: Props) {
  const form = useForm({
    resolver: zodResolver(entrySchema),
  });

  // Implementation
}
```

### Chart Component (Recharts)

```typescript
// components/metrics/MetricsChart.tsx

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MetricsChart({ data }: { data: BodyMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="weight" />
        <YAxis yAxisId="waist" orientation="right" />
        <Tooltip />
        <Line yAxisId="weight" type="monotone" dataKey="weightKg" stroke="#8884d8" name="Weight (kg)" />
        <Line yAxisId="waist" type="monotone" dataKey="waistCm" stroke="#82ca9d" name="Waist (cm)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## Environment Variables

```bash
# .env.local

# Database (SQLite - file path)
DATABASE_URL=./data/transformatator.db

# Or if using Postgres
# DATABASE_URL=postgresql://user:password@localhost:5432/transformatator
```

---

## Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "drizzle-orm": "^0.29.0",
    "better-sqlite3": "^9.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/better-sqlite3": "^7.6.0",
    "typescript": "^5.2.0",
    "drizzle-kit": "^0.20.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

