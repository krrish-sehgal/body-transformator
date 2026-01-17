# Configuration Guide

All hardcoded values for recomp calculations are now centralized in a single JSON configuration file.

## Configuration File

**Location:** `lib/config/recomp-config.json`

## How to Change Values

Simply edit `lib/config/recomp-config.json` to change any value. The changes will automatically apply to:
- Calculation logic (`lib/calculations/recomp.ts`)
- Dashboard display (`app/dashboard/DashboardClient.tsx`)
- Setup page display (`app/setup/page.tsx`)

## Configuration Values

### Activity Multiplier
```json
"activity": {
  "multiplier": 1.45,
  "description": "Fixed activity multiplier for recomp"
}
```

### Recomp Calories
```json
"recomp": {
  "method": "multiply",
  "multiplier": 0.85,              // Main method: Maintenance × 0.85
  "alternativeMethod": "subtract",
  "alternativeValue": 300,         // Alternative: Maintenance - 300
  "description": "Recomp calories = Maintenance × multiplier OR Maintenance - alternativeValue"
}
```

### Protein
```json
"protein": {
  "ratioPerKg": 1.9,               // Protein = 1.9 × weight (kg)
  "caloriesPerGram": 4,
  "description": "Protein requirement in grams per kg bodyweight"
}
```

### Fat
```json
"fat": {
  "ratioPerKg": 0.8,               // Fat = 0.8 × weight (kg)
  "caloriesPerGram": 9,
  "description": "Fat requirement in grams per kg bodyweight"
}
```

### Carbs (Capped)
```json
"carbs": {
  "capped": true,
  "min": 220,                      // Minimum carb cap
  "max": 240,                      // Maximum carb cap
  "target": 230,                   // Target carb amount (used in calculations)
  "caloriesPerGram": 4,
  "description": "Carbs are capped for recomposition (not calculated from remaining calories)"
}
```

## Example: Changing Values

To change the activity multiplier from 1.45 to 1.5:

1. Open `lib/config/recomp-config.json`
2. Change `"multiplier": 1.45` to `"multiplier": 1.5` in the `activity` section
3. Save the file
4. Restart the dev server (if needed)

That's it! The change will automatically apply everywhere.

## Notes

- All values are read from the config at runtime
- No need to change multiple files
- The config file is the single source of truth
- TypeScript provides type safety through `lib/config/index.ts`

