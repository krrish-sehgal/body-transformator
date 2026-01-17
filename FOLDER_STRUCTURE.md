# Folder Structure Reference

```
transformatator/
│
├── app/                                    # Next.js App Router
│   ├── layout.tsx                          # Root layout (metadata, fonts)
│   ├── page.tsx                            # Redirect or landing (will be dashboard)
│   ├── globals.css                         # Global styles (Tailwind)
│   │
│   ├── (dashboard)/                        # Dashboard route group
│   │   ├── layout.tsx                      # Dashboard layout (nav, header)
│   │   ├── page.tsx                        # Dashboard home (/) - daily totals, charts
│   │   │
│   │   ├── log/
│   │   │   └── page.tsx                    # Food entry (/log)
│   │   │
│   │   ├── foods/
│   │   │   └── page.tsx                    # Food list (/foods)
│   │   │
│   │   ├── metrics/
│   │   │   └── page.tsx                    # Body metrics (/metrics)
│   │   │
│   │   ├── history/
│   │   │   └── page.tsx                    # Log history (/history)
│   │   │
│   │   └── settings/
│   │       └── page.tsx                    # Settings (/settings)
│   │
│   └── api/                                # API routes (if using REST)
│       ├── foods/
│       ├── logs/
│       ├── metrics/
│       └── settings/
│
├── components/                             # React components
│   ├── ui/                                 # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── dashboard/                          # Dashboard components
│   │   ├── DailyTotals.tsx                 # Today's macro totals
│   │   ├── MacroProgress.tsx               # Progress bars vs targets
│   │   ├── RecentLogs.tsx                  # Recent log entries
│   │   └── QuickStats.tsx                  # Summary stats
│   │
│   ├── food/                               # Food-related components
│   │   ├── FoodEntryForm.tsx               # Add food to log
│   │   ├── FoodList.tsx                    # List all foods
│   │   ├── FoodCard.tsx                    # Individual food card
│   │   └── FoodSearch.tsx                  # Food search/select
│   │
│   ├── log/                                # Log-related components
│   │   ├── LogEntryForm.tsx                # Main entry form
│   │   ├── LogEntryList.tsx                # List of entries for a day
│   │   └── LogEntryItem.tsx                # Individual entry item
│   │
│   ├── metrics/                            # Metrics components
│   │   ├── MetricsForm.tsx                 # Add weight/waist
│   │   ├── MetricsChart.tsx                # Weight/waist chart
│   │   ├── MetricsHistory.tsx              # Metrics history table
│   │   └── MetricsCard.tsx                 # Single metric card
│   │
│   └── charts/                             # Shared chart components
│       ├── LineChart.tsx
│       ├── BarChart.tsx
│       └── ChartWrapper.tsx
│
├── lib/                                    # Shared utilities & logic
│   ├── db/                                 # Database code
│   │   ├── schema.ts                       # Drizzle schema definitions
│   │   ├── index.ts                        # DB connection & client
│   │   ├── seed.ts                         # Seed data script
│   │   └── migrations/                     # Generated migration files
│   │
│   ├── calculations/                       # Calculation logic
│   │   ├── maintenance.ts                  # Maintenance calories (BMR)
│   │   ├── macros.ts                       # Macro distribution
│   │   ├── goals.ts                        # Goal adjustments
│   │   └── totals.ts                       # Daily totals calculation
│   │
│   ├── actions/                            # Server Actions (Next.js)
│   │   ├── foods.ts                        # Food CRUD actions
│   │   ├── logs.ts                         # Log CRUD actions
│   │   ├── metrics.ts                      # Metrics CRUD actions
│   │   └── settings.ts                     # Settings actions
│   │
│   ├── utils/                              # Utility functions
│   │   ├── date.ts                         # Date helpers (date-fns wrappers)
│   │   ├── format.ts                       # Formatting (numbers, dates)
│   │   └── validate.ts                     # Validation helpers
│   │
│   └── validations/                        # Zod schemas
│       ├── food.ts
│       ├── log.ts
│       ├── metrics.ts
│       └── settings.ts
│
├── types/                                  # TypeScript type definitions
│   ├── index.ts                            # Main type exports
│   ├── food.ts
│   ├── log.ts
│   ├── metrics.ts
│   └── settings.ts
│
├── public/                                 # Static assets
│   ├── icons/
│   └── images/
│
├── data/                                   # SQLite database (gitignored)
│   └── transformatator.db
│
├── .env.local                              # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── drizzle.config.ts                       # Drizzle ORM config
│
└── docs/                                   # Documentation (optional)
    ├── PROJECT_PLAN.md
    ├── ARCHITECTURE.md
    ├── SETUP_GUIDE.md
    └── FOLDER_STRUCTURE.md (this file)
```

## File Naming Conventions

- **Components:** PascalCase (e.g., `FoodEntryForm.tsx`)
- **Utilities:** camelCase (e.g., `calculateMaintenance.ts`)
- **Types:** camelCase (e.g., `food.ts`, `metrics.ts`)
- **Routes:** kebab-case folders (e.g., `app/log-food/`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `ACTIVITY_MULTIPLIERS`)

## Component Organization

### UI Components (`components/ui/`)
- Pure presentation components
- No business logic
- Reusable across app
- Examples: Button, Input, Card, Modal

### Feature Components (`components/food/`, `components/metrics/`)
- Feature-specific components
- May contain business logic
- Composed of UI components
- Examples: FoodEntryForm, MetricsChart

### Page Components (`app/**/page.tsx`)
- Route handlers
- Fetch data (Server Components)
- Compose feature components
- Minimal logic (delegate to lib/)

## Data Flow

```
User Action
  ↓
Client Component (components/)
  ↓
Server Action (lib/actions/)
  ↓
Database (lib/db/)
  ↓
Response/Revalidation
  ↓
UI Update
```

