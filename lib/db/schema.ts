import { pgTable, text, real, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table for authentication
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User profiles (one per user)
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weightKg: real('weight_kg').notNull(),
  heightCm: real('height_cm').notNull(),
  age: integer('age').notNull(),
  bodyFatPercent: real('body_fat_percent').notNull(),
  gender: text('gender', { enum: ['male', 'female'] }).notNull(),
  activityLevel: text('activity_level', { 
    enum: ['sedentary', 'light', 'moderate', 'active'] 
  }).notNull().default('moderate'),
  targetCalories: real('target_calories'),
  targetProtein: real('target_protein'),
  targetFats: real('target_fats'),
  targetCarbs: real('target_carbs'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Foods are stored in lib/config/foods.json, but users can also add custom foods
// Custom foods are stored in the database
export const customFoods = pgTable('custom_foods', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  // Values per 100g (for gram-based) or per piece
  caloriesPer100g: real('calories_per_100g'),
  proteinPer100g: real('protein_per_100g'),
  carbsPer100g: real('carbs_per_100g'),
  fatsPer100g: real('fats_per_100g'),
  // Per-piece values (for piece-based foods)
  unit: text('unit').notNull().default('g'), // 'g', 'piece', 'tsp', 'tbsp', 'slice'
  unitSize: real('unit_size'),
  caloriesPerPiece: real('calories_per_piece'),
  proteinPerPiece: real('protein_per_piece'),
  carbsPerPiece: real('carbs_per_piece'),
  fatsPerPiece: real('fats_per_piece'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Daily logs (one per user per day)
export const dailyLogs = pgTable('daily_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // Format: YYYY-MM-DD
  // Daily totals (cached for quick access)
  totalCalories: real('total_calories'),
  totalProtein: real('total_protein'),
  totalCarbs: real('total_carbs'),
  totalFats: real('total_fats'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Log entries (foods eaten in a day)
// foodName references the name in lib/config/foods.json
export const logEntries = pgTable('log_entries', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  dailyLogId: text('daily_log_id').notNull().references(() => dailyLogs.id, { onDelete: 'cascade' }),
  foodName: text('food_name').notNull(), // Name from foods.json
  quantity: real('quantity').notNull(), // In grams
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Body metrics tracking
export const bodyMetrics = pgTable('body_metrics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // Format: YYYY-MM-DD
  weightKg: real('weight_kg'),
  bodyFatPercent: real('body_fat_percent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

