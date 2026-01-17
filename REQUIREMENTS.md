# Body Recomposition Tracker - Requirements

## Core Focus
Single-user body recomposition app (lose fat + gain muscle simultaneously).

## User Flow

1. **Login Page** (`/login`)
   - Username + Password
   - Bcrypt for password hashing
   - Simple form

2. **Onboarding/Setup** (`/setup` - first time only)
   - Collect initial data:
     - Weight (kg)
     - Height (cm)
     - Age
     - Body Fat % (approx)
     - Gender (for BMR calculation)
     - Activity Level
   - Calculate and display initial targets

3. **Dashboard** (`/`)
   - Show calculation formulas (transparent)
   - Daily macro targets (carbs, protein, calories)
   - Today's progress vs targets
   - Quick food entry
   - Body metrics tracking

## Food Database

Hardcoded Indian foods (seed data):

| Food | Quantity | Carbs (g) | Protein (g) | Calories | Notes |
|------|----------|-----------|-------------|----------|-------|
| Roti (plain) | 30g (1 medium) | 18-20 | 3-4 | 100-110 | per roti |
| Rice (cooked) | 100g | 28 | 2.5 | 130 | per 100g |
| Brown Bread | 1 slice | 14-15 | 3 | ~75 | per slice |
| Potato (cooked) | 100g | 17 | 2 | ~80 | per 100g |
| Paneer | 200g | 6-8 | 34-38 | 420-460 | per 200g |
| Chicken (breast, cooked) | 200g | 0 | 42-46 | 220-240 | per 200g |
| Curd (plain) | 100g | 4-5 | 4 | 60 | per 100g |
| Rajma (cooked) | 100g | 20 | 8-9 | ~120 | per 100g |
| Soya Chunks | 60g raw (~180g cooked) | 20-22 | 30-32 | ~200 | per 60g raw |
| Fruits (medium) | 1 fruit | 20-25 | - | - | per fruit |

## Calculation Formulas (Must Display)

### Body Recomposition Calories
```
BMR (Mifflin-St Jeor):
  Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
  Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161

Activity Multiplier:
  Sedentary: 1.2
  Light: 1.375
  Moderate: 1.55
  Active: 1.725

Maintenance = BMR × Activity Multiplier

Recomp Calories = Maintenance ± 100-200 kcal
(usually slight surplus: Maintenance + 150 kcal)
```

### Protein Requirement
```
Protein (g) = 2.2 × weight(kg)
(or higher: 2.5-3.0g per kg for recomp)

Example: 70kg → 154g protein (2.2 × 70)
```

### Fat Requirement
```
Fat (g) = 1.0 × weight(kg)
(or 0.8-1.2g per kg)

Example: 70kg → 70g fat (1.0 × 70)
         Fat Calories = 70 × 9 = 630 kcal
```

### Carb Requirement
```
Remaining calories after protein and fat:

1. Protein Calories = Protein(g) × 4
2. Fat Calories = Fat(g) × 9
3. Carb Calories = Total Calories - Protein Calories - Fat Calories
4. Carb (g) = Carb Calories / 4

Example:
  Total: 2500 kcal
  Protein: 154g × 4 = 616 kcal
  Fat: 70g × 9 = 630 kcal
  Carbs: 2500 - 616 - 630 = 1254 kcal
  Carbs (g): 1254 / 4 = 313.5g
```

## Design Principles

- **User-friendly**: Clean, simple, not cluttered
- **Transparent math**: Show formulas and step-by-step calculations
- **Data-first**: Focus on accuracy, not flashy animations
- **Single user**: Simple authentication, no multi-user complexity

## Database Schema

```typescript
// users table
id: string (uuid)
username: string (unique)
password_hash: string (bcrypt)
created_at: timestamp

// user_profiles table (one per user)
id: string (uuid)
user_id: string (FK)
weight_kg: number
height_cm: number
age: number
body_fat_percent: number
gender: 'male' | 'female'
activity_level: 'sedentary' | 'light' | 'moderate' | 'active'
target_calories: number (calculated)
target_protein: number (calculated)
target_fats: number (calculated)
target_carbs: number (calculated)
created_at: timestamp
updated_at: timestamp

// foods table
id: string (uuid)
name: string
calories_per_100g: number (or per unit)
protein_per_100g: number
carbs_per_100g: number
fats_per_100g: number
unit: string ('g' | 'piece' | 'slice')
unit_size: number (e.g., 30 for roti, 100 for rice)
created_at: timestamp

// daily_logs table
id: string (uuid)
user_id: string (FK)
date: date
created_at: timestamp

// log_entries table
id: string (uuid)
daily_log_id: string (FK)
food_id: string (FK)
quantity: number (in grams or units)
created_at: timestamp

// body_metrics table
id: string (uuid)
user_id: string (FK)
date: date
weight_kg: number?
body_fat_percent: number?
created_at: timestamp
```

