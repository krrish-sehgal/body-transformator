'use server';

import { db } from '@/lib/db';
import { dailyLogs, logEntries, userProfiles, customFoods } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getTodayDateString } from '@/lib/utils/date';
import foodsData from '@/lib/config/foods.json';
import { sql } from 'drizzle-orm';

// Get all foods - from foods.json + custom foods from database
export async function getAllFoods(userId?: string) {
  try {
    // Get foods from JSON
    const jsonFoods = foodsData as Array<{
      name: string;
      caloriesPer100g?: number;
      proteinPer100g?: number;
      carbsPer100g?: number;
      fatsPer100g?: number;
      unit: string;
      unitSize?: number;
      caloriesPerPiece?: number;
      proteinPerPiece?: number;
      carbsPerPiece?: number;
      fatsPerPiece?: number;
      notes?: string;
    }>;
    
    // Get custom foods from database (for this user)
    let dbFoods: any[] = [];
    if (userId) {
      dbFoods = await db
        .select()
        .from(customFoods)
        .where(eq(customFoods.userId, userId));
    }
    
    // Merge and format
    const allFoods = [
      ...jsonFoods.map(food => ({
        id: food.name,
        name: food.name,
        caloriesPer100g: food.caloriesPer100g || 0,
        proteinPer100g: food.proteinPer100g || 0,
        carbsPer100g: food.carbsPer100g || 0,
        fatsPer100g: food.fatsPer100g || 0,
        unit: food.unit,
        unitSize: food.unitSize,
        caloriesPerPiece: food.caloriesPerPiece,
        proteinPerPiece: food.proteinPerPiece,
        carbsPerPiece: food.carbsPerPiece,
        fatsPerPiece: food.fatsPerPiece,
        notes: food.notes,
        isCustom: false,
      })),
      ...dbFoods.map(food => ({
        id: food.id, // Use DB id for custom foods
        name: food.name,
        caloriesPer100g: food.caloriesPer100g || 0,
        proteinPer100g: food.proteinPer100g || 0,
        carbsPer100g: food.carbsPer100g || 0,
        fatsPer100g: food.fatsPer100g || 0,
        unit: food.unit,
        unitSize: food.unitSize,
        caloriesPerPiece: food.caloriesPerPiece,
        proteinPerPiece: food.proteinPerPiece,
        carbsPerPiece: food.carbsPerPiece,
        fatsPerPiece: food.fatsPerPiece,
        notes: food.notes,
        isCustom: true,
      })),
    ];
    
    // Sort by name
    return allFoods.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting foods:', error);
    return [];
  }
}

export async function getDailyLog(userId: string, date?: string) {
  try {
    const targetDate = date || getTodayDateString();
    
    const [log] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, targetDate)))
      .limit(1);

    if (!log) {
      return null;
    }

    // Get log entries from database
    const dbEntries = await db
      .select()
      .from(logEntries)
      .where(eq(logEntries.dailyLogId, log.id));

    // Load foods from JSON
    const jsonFoods = foodsData as Array<{
      name: string;
      caloriesPer100g?: number;
      proteinPer100g?: number;
      carbsPer100g?: number;
      fatsPer100g?: number;
      unit: string;
      unitSize?: number;
      caloriesPerPiece?: number;
      proteinPerPiece?: number;
      carbsPerPiece?: number;
      fatsPerPiece?: number;
      notes?: string;
    }>;

    // Load custom foods from database
    const dbCustomFoods = await db
      .select()
      .from(customFoods)
      .where(eq(customFoods.userId, userId));

    // Merge foods (custom foods override JSON foods with same name)
    const allFoods = [
      ...jsonFoods,
      ...dbCustomFoods.map(f => ({
        name: f.name,
        caloriesPer100g: f.caloriesPer100g || undefined,
        proteinPer100g: f.proteinPer100g || undefined,
        carbsPer100g: f.carbsPer100g || undefined,
        fatsPer100g: f.fatsPer100g || undefined,
        unit: f.unit,
        unitSize: f.unitSize || undefined,
        caloriesPerPiece: f.caloriesPerPiece || undefined,
        proteinPerPiece: f.proteinPerPiece || undefined,
        carbsPerPiece: f.carbsPerPiece || undefined,
        fatsPerPiece: f.fatsPerPiece || undefined,
        notes: f.notes || undefined,
      })),
    ];

    // Create a map for quick lookup (custom foods take precedence)
    const foodMap = new Map<string, typeof allFoods[0]>();
    jsonFoods.forEach(f => foodMap.set(f.name, f));
    dbCustomFoods.forEach(f => foodMap.set(f.name, {
      name: f.name,
      caloriesPer100g: f.caloriesPer100g || undefined,
      proteinPer100g: f.proteinPer100g || undefined,
      carbsPer100g: f.carbsPer100g || undefined,
      fatsPer100g: f.fatsPer100g || undefined,
      unit: f.unit,
      unitSize: f.unitSize || undefined,
      caloriesPerPiece: f.caloriesPerPiece || undefined,
      proteinPerPiece: f.proteinPerPiece || undefined,
      carbsPerPiece: f.carbsPerPiece || undefined,
      fatsPerPiece: f.fatsPerPiece || undefined,
      notes: f.notes || undefined,
    }));

    // Resolve food data from JSON by name
    const entries = dbEntries.map(entry => {
      const food = foodMap.get(entry.foodName);
      if (!food) {
        // Food not found in JSON (might have been removed), use default values
        console.warn(`Food "${entry.foodName}" not found in foods.json or custom foods`);
        return {
          id: entry.id,
          foodId: entry.foodName,
          quantity: entry.quantity,
          food: {
            id: entry.foodName,
            name: entry.foodName,
            caloriesPer100g: 0,
            proteinPer100g: 0,
            carbsPer100g: 0,
            fatsPer100g: 0,
            unit: 'g',
            unitSize: undefined,
          },
        };
      }

      return {
        id: entry.id,
        foodId: entry.foodName,
        quantity: entry.quantity,
        food: {
          id: food.name,
          name: food.name,
          caloriesPer100g: food.caloriesPer100g || 0,
          proteinPer100g: food.proteinPer100g || 0,
          carbsPer100g: food.carbsPer100g || 0,
          fatsPer100g: food.fatsPer100g || 0,
          unit: food.unit || 'g',
          unitSize: food.unitSize !== null && food.unitSize !== undefined ? Number(food.unitSize) : undefined,
          caloriesPerPiece: food.caloriesPerPiece || undefined,
          proteinPerPiece: food.proteinPerPiece || undefined,
          carbsPerPiece: food.carbsPerPiece || undefined,
          fatsPerPiece: food.fatsPerPiece || undefined,
        },
      };
    });

    // Calculate totals
    const totals = entries.reduce(
      (acc, entry) => {
        // If food has per-piece values and unit is "piece", use per-piece calculation
        // Quantity is stored as piece count (1, 2, 3...)
        if (entry.food.unit === 'piece' && entry.food.caloriesPerPiece) {
          const pieces = entry.quantity; // For pieces, quantity IS the piece count
          return {
            calories: acc.calories + (entry.food.caloriesPerPiece || 0) * pieces,
            protein: acc.protein + (entry.food.proteinPerPiece || 0) * pieces,
            carbs: acc.carbs + (entry.food.carbsPerPiece || 0) * pieces,
            fats: acc.fats + (entry.food.fatsPerPiece || 0) * pieces,
          };
        }
        
        // Otherwise use per-100g calculation for gram-based foods
        const multiplier = entry.quantity / 100;
        return {
          calories: acc.calories + (entry.food.caloriesPer100g || 0) * multiplier,
          protein: acc.protein + (entry.food.proteinPer100g || 0) * multiplier,
          carbs: acc.carbs + (entry.food.carbsPer100g || 0) * multiplier,
          fats: acc.fats + (entry.food.fatsPer100g || 0) * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const roundedTotals = {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fats: Math.round(totals.fats),
    };

    // Update daily log with totals (cache for calendar view)
    await db
      .update(dailyLogs)
      .set({
        totalCalories: roundedTotals.calories,
        totalProtein: roundedTotals.protein,
        totalCarbs: roundedTotals.carbs,
        totalFats: roundedTotals.fats,
        updatedAt: sql`NOW()`,
      })
      .where(eq(dailyLogs.id, log.id));

    return {
      ...log,
      entries,
      totals: roundedTotals,
    };
  } catch (error) {
    console.error('Error getting daily log:', error);
    return null;
  }
}

export async function addFoodEntry(userId: string, foodIdOrName: string, quantity: number, date?: string) {
  try {
    const targetDate = date || getTodayDateString();

    // Get or create daily log
    let [log] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, targetDate)))
      .limit(1);

    if (!log) {
      [log] = await db
        .insert(dailyLogs)
        .values({ userId, date })
        .returning();
    }

    // Resolve food name - if it's a custom food ID, get the name from DB
    let foodName: string;
    if (foodIdOrName.includes('-') && foodIdOrName.length > 20) {
      // Likely a UUID (custom food)
      const [customFood] = await db
        .select({ name: customFoods.name })
        .from(customFoods)
        .where(eq(customFoods.id, foodIdOrName))
        .limit(1);
      foodName = customFood?.name || foodIdOrName;
    } else {
      // Regular food from JSON (name is used as id)
      foodName = foodIdOrName;
    }

    // Add entry (store food name)
    await db.insert(logEntries).values({
      dailyLogId: log.id,
      foodName, // Store food name
      quantity,
    });

    // Recalculate and update totals for the day
    await getDailyLog(userId, targetDate);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding food entry:', error);
    return { success: false, error: 'Failed to add food entry' };
  }
}

export async function deleteFoodEntry(entryId: string, userId: string) {
  try {
    // Get the entry to find which day it belongs to
    const [entry] = await db
      .select({ dailyLogId: logEntries.dailyLogId })
      .from(logEntries)
      .where(eq(logEntries.id, entryId))
      .limit(1);

    if (!entry) {
      return { success: false, error: 'Entry not found' };
    }

    // Get the date from the daily log
    const [dailyLog] = await db
      .select({ date: dailyLogs.date })
      .from(dailyLogs)
      .where(eq(dailyLogs.id, entry.dailyLogId))
      .limit(1);

    // Delete the entry
    await db.delete(logEntries).where(eq(logEntries.id, entryId));

    // Recalculate and update totals for the day
    if (dailyLog) {
      await getDailyLog(userId, dailyLog.date);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting food entry:', error);
    return { success: false, error: 'Failed to delete entry' };
  }
}

// Get all daily logs for a user (for calendar view)
export async function getAllDailyLogs(userId: string) {
  try {
    const logs = await db
      .select({
        date: dailyLogs.date,
        totalCalories: dailyLogs.totalCalories,
        totalProtein: dailyLogs.totalProtein,
        totalCarbs: dailyLogs.totalCarbs,
        totalFats: dailyLogs.totalFats,
      })
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, userId))
      .orderBy(desc(dailyLogs.date));

    // Convert null to undefined for compatibility
    return logs.map(log => ({
      date: log.date,
      totalCalories: log.totalCalories ?? undefined,
      totalProtein: log.totalProtein ?? undefined,
      totalCarbs: log.totalCarbs ?? undefined,
      totalFats: log.totalFats ?? undefined,
    }));
  } catch (error) {
    console.error('Error getting all daily logs:', error);
    return [];
  }
}

// Add custom food
export async function addCustomFood(
  userId: string,
  data: {
    name: string;
    unit: string;
    // Per-100g values (for gram-based foods)
    caloriesPer100g?: number;
    proteinPer100g?: number;
    carbsPer100g?: number;
    fatsPer100g?: number;
    // Per-piece values (for piece-based foods)
    unitSize?: number;
    caloriesPerPiece?: number;
    proteinPerPiece?: number;
    carbsPerPiece?: number;
    fatsPerPiece?: number;
    notes?: string;
  }
) {
  try {
    const [newFood] = await db
      .insert(customFoods)
      .values({
        userId,
        ...data,
      })
      .returning();

    return { success: true, foodId: newFood.id, foodName: newFood.name };
  } catch (error) {
    console.error('Error adding custom food:', error);
    return { success: false, error: 'Failed to add custom food' };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return profile || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

