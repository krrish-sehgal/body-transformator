# Fitness & Nutrition Tracking App - Project Plan

## Overview
A personal web app for tracking food intake, body metrics, and calculating macro targets with simple, transparent math.

---

## Milestones

### MVP (Minimum Viable Product)
**Goal:** Core functionality for daily tracking and basic calculations

**Features:**
- Hardcoded food database with macros (calories, protein, carbs, fats)
- Daily food log entry (select food, enter quantity)
- Manual body metrics entry (weight, waist)
- Calculate maintenance calories using simple formula
- View daily macro totals vs. maintenance targets
- Basic list view of recent logs

**Pages/Routes:**
- `/` - Dashboard (today's totals, recent logs)
- `/log` - Food entry page
- `/foods` - View/manage hardcoded food list
- `/metrics` - Body metrics entry/history

**Data Models:**
- `Food` - { id, name, calories, protein, carbs, fats (per 100g) }
- `DailyLog` - { id, date, entries: [{ foodId, quantity }], bodyWeight?, waist? }
- `BodyMetric` - { id, date, weight?, waist? }

**Database Schema (MVP):**
```typescript
// foods table
id: string (uuid)
name: string
calories_per_100g: number
protein_per_100g: number
carbs_per_100g: number
fats_per_100g: number
created_at: timestamp

// daily_logs table
id: string (uuid)
date: date (unique, indexed)
created_at: timestamp
updated_at: timestamp

// log_entries table (foods eaten in a day)
id: string (uuid)
daily_log_id: string (FK)
food_id: string (FK)
quantity_grams: number
created_at: timestamp

// body_metrics table
id: string (uuid)
date: date (indexed)
weight_kg: number?
waist_cm: number?
created_at: timestamp
```

---

### v1.0
**Goal:** Full calculation features and progress tracking

**Features (MVP +):**
- Calculate maintenance/cut/recomp/bulk calories based on:
  - Body weight
  - Activity level (sedentary/light/moderate/active)
  - Goal selection (maintenance/cut/bulk/recomp)
- Macro distribution calculator (protein/fat/carbs split)
- Body metrics history view (list + simple line chart)
- Daily log history view
- Week/Month summary views

**Pages/Routes:**
- `/` - Enhanced dashboard with charts
- `/log` - Same as MVP
- `/foods` - Same as MVP
- `/metrics` - Enhanced with charts
- `/history` - View past logs
- `/settings` - Activity level, goals, macro preferences

**Data Models (MVP +):**
- `UserSettings` - { activityLevel, goal, macroSplit?, targetCalories? }

**Additional Schema:**
```typescript
// user_settings table (single row)
id: string (uuid)
activity_level: 'sedentary' | 'light' | 'moderate' | 'active'
goal: 'maintenance' | 'cut' | 'bulk' | 'recomp'
target_calories: number? (calculated)
protein_ratio: number? (g per kg bodyweight or %)
fat_ratio: number? (g per kg bodyweight or %)
updated_at: timestamp
```

---

### v2.0
**Goal:** Advanced analytics and workout tracking

**Features (v1.0 +):**
- Workout consistency tracking (log workout days)
- Progress photos (optional)
- Advanced charts (trends, correlations)
- Export data (CSV/JSON)
- PWA support for offline use
- Custom food recipes (combine foods)
- Meal templates (save common meals)

**Pages/Routes:**
- All v1.0 routes
- `/workouts` - Log and view workout history
- `/analytics` - Advanced charts and insights
- `/recipes` - Manage recipes and templates

**Data Models (v1.0 +):**
- `Workout` - { id, date, type?, notes? }
- `Recipe` - { id, name, ingredients: [{ foodId, quantity }] }
- `MealTemplate` - { id, name, foods: [{ foodId, quantity }] }

---

## Database Recommendation

### Option 1: SQLite (Recommended for MVP → v1)
**Pros:**
- Zero setup (file-based)
- Perfect for single-user app
- Works offline out of the box
- Can migrate to Postgres later
- Excellent local dev experience

**Cons:**
- Not ideal for multiple concurrent users (but not needed here)
- Manual migration management

**Library:** `better-sqlite3` (Node.js) or `@libsql/client` (Turso) if you want cloud sync later

### Option 2: PostgreSQL (Recommended for production-ready)
**Pros:**
- Industry standard
- Great tooling (Prisma/Drizzle)
- Easy to host (Supabase, Railway, Neon)

**Cons:**
- Requires setup/local DB
- Overkill for single-user initially

**Recommendation:** Start with SQLite, migrate to Postgres if you need cloud hosting later.

### ORM Recommendation: **Drizzle ORM**
- Lightweight, TypeScript-first
- Works great with SQLite and Postgres
- Excellent type safety
- Simple migrations

---

## Calculation Formulas

### Maintenance Calories (Mifflin-St Jeor Equation)
```
BMR (men) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
BMR (women) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161

Activity Multipliers:
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725

Maintenance = BMR × Activity Multiplier
```

### Goal Adjustments
- **Maintenance:** Maintenance calories
- **Cut:** Maintenance - 500 kcal (1 lb/week loss)
- **Bulk:** Maintenance + 500 kcal (1 lb/week gain)
- **Recomp:** Maintenance ± 100-200 kcal (varies by training day)

### Macro Distribution (Standard)
- **Protein:** 2.2g per kg bodyweight (or 30-35% of calories)
- **Fats:** 0.8-1g per kg bodyweight (or 25-30% of calories)
- **Carbs:** Remaining calories

---

## Tech Stack Recommendations

### Charts
- **Recharts** - Simple, React-native, works well with Next.js
- Alternative: **Chart.js** (if you prefer canvas-based)

### Forms
- **React Hook Form** - Lightweight, performant
- Validation: **Zod** - TypeScript-first schema validation

### Database ORM
- **Drizzle ORM** - As mentioned above

### Date Handling
- **date-fns** - Lightweight, tree-shakeable

### UI Components (Optional)
- **shadcn/ui** - Unstyled, accessible components (or vanilla CSS)
- **Tailwind CSS** - Utility-first CSS (recommended for speed)

---

## Next.js App Router Folder Structure

```
transformatator/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout
│   │   ├── page.tsx                # Dashboard home (/)
│   │   ├── log/
│   │   │   └── page.tsx            # Food entry (/log)
│   │   ├── foods/
│   │   │   └── page.tsx            # Food list (/foods)
│   │   ├── metrics/
│   │   │   └── page.tsx            # Body metrics (/metrics)
│   │   ├── history/
│   │   │   └── page.tsx            # Log history (/history)
│   │   └── settings/
│   │       └── page.tsx            # Settings (/settings)
│   ├── api/                        # API routes (if needed)
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── chart.tsx
│   │   └── ...
│   ├── food/
│   │   ├── FoodEntryForm.tsx
│   │   ├── FoodList.tsx
│   │   └── FoodCard.tsx
│   ├── metrics/
│   │   ├── MetricsForm.tsx
│   │   ├── MetricsChart.tsx
│   │   └── MetricsHistory.tsx
│   ├── dashboard/
│   │   ├── DailyTotals.tsx
│   │   ├── MacroProgress.tsx
│   │   └── RecentLogs.tsx
│   └── log/
│       └── LogEntryForm.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema definitions
│   │   ├── index.ts                # DB connection
│   │   └── migrations/             # Migration files
│   ├── calculations/
│   │   ├── maintenance.ts          # Maintenance calc
│   │   ├── macros.ts               # Macro distribution
│   │   └── goals.ts                # Goal adjustments
│   ├── utils/
│   │   ├── date.ts                 # Date helpers
│   │   └── format.ts               # Formatting helpers
│   └── validations/
│       └── schemas.ts              # Zod schemas
├── types/
│   └── index.ts                    # TypeScript types
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js (if using Tailwind)
```

---

## Implementation Notes

### Food Database Initialization
- Start with ~20-30 common foods you actually eat
- Store as seed data in the database
- Can add via UI later

### Data Entry Flow
1. User selects date (defaults to today)
2. Search/select food from hardcoded list
3. Enter quantity in grams
4. System calculates: quantity × (macros per 100g) / 100
5. Accumulate totals for the day

### Calculations
- All formulas should be visible in code (no black boxes)
- Show step-by-step math in UI for transparency
- Store calculated targets in settings, but recalculate when body weight changes

### Offline Support (v2)
- Use Service Workers
- IndexedDB for local storage
- Sync when online

---

## Next Steps

1. Initialize Next.js project with TypeScript
2. Set up Drizzle ORM with SQLite
3. Create database schema
4. Build MVP food list and entry forms
5. Implement basic calculations
6. Add charts for metrics tracking

