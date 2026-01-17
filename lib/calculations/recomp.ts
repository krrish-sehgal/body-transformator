/**
 * Body Recomposition Calculation Formulas
 * All formulas are transparent and shown step-by-step
 * All hardcoded values are loaded from lib/config/recomp-config.json
 */

import { recompConfig } from '@/lib/config';

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

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
 * Uses activity multiplier from config
 */
export function calculateMaintenanceCalories(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): number {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  return Math.round(bmr * recompConfig.activity.multiplier);
}

/**
 * Calculate body recomposition calories
 * Uses subtract method: Maintenance - subtractValue
 */
export function calculateRecompCalories(maintenance: number): number {
  return maintenance - recompConfig.recomp.subtractValue;
}

/**
 * Calculate deficit percentage
 * Deficit % = (Maintenance - Recomp) / Maintenance × 100
 */
export function calculateDeficitPercentage(maintenance: number, recompCalories: number): number {
  const deficit = maintenance - recompCalories;
  return Math.round((deficit / maintenance) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate protein requirement (grams)
 * Uses protein ratio from config
 */
export function calculateProteinRequirement(weightKg: number, ratio?: number): number {
  const proteinRatio = ratio ?? recompConfig.protein.ratioPerKg;
  return Math.round(weightKg * proteinRatio);
}

/**
 * Calculate fat requirement (grams)
 * Uses fat ratio from config
 */
export function calculateFatRequirement(weightKg: number, ratio?: number): number {
  const fatRatio = ratio ?? recompConfig.fat.ratioPerKg;
  return Math.round(weightKg * fatRatio);
}

/**
 * Calculate carb requirement (grams)
 * Calculates from remaining calories, then caps at max for recomposition
 * carbs = min(calculated_from_remaining_calories, max_cap)
 */
export function calculateCarbRequirement(
  totalCalories: number,
  proteinGrams: number,
  fatGrams: number
): number {
  // Calculate calories from protein and fat
  const proteinCalories = proteinGrams * recompConfig.protein.caloriesPerGram;
  const fatCalories = fatGrams * recompConfig.fat.caloriesPerGram;
  
  // Calculate remaining calories for carbs
  const remainingCalories = totalCalories - proteinCalories - fatCalories;
  
  // Calculate carbs from remaining calories
  const calculatedCarbs = Math.round(remainingCalories / recompConfig.carbs.caloriesPerGram);
  
  // Cap at max for recomposition (min of calculated and max cap)
  return Math.min(calculatedCarbs, recompConfig.carbs.max);
}

/**
 * Calculate all macro targets for recomp
 */
export interface RecompTargets {
  bmr: number;
  maintenance: number;
  recompCalories: number;
  deficitPercentage: number;
  protein: number;
  fats: number;
  carbs: number;
  // Breakdown for display
  proteinCalories: number;
  fatCalories: number;
  carbCalories: number;
}

export function calculateRecompTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  proteinRatio?: number,
  fatRatio?: number
): RecompTargets {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const maintenance = calculateMaintenanceCalories(weightKg, heightCm, age, gender, activityLevel);
  
  // Calculate target recomp calories using subtract method (for carb calculation)
  const targetRecompCalories = calculateRecompCalories(maintenance);
  
  // Calculate macros (using config defaults if not provided)
  const protein = calculateProteinRequirement(weightKg, proteinRatio);
  const fats = calculateFatRequirement(weightKg, fatRatio);
  
  // Calculate carbs from remaining calories (based on target), capped at max
  const carbs = calculateCarbRequirement(targetRecompCalories, protein, fats);
  
  // Calculate actual calories from macros (using calories per gram from config)
  const proteinCalories = protein * recompConfig.protein.caloriesPerGram;
  const fatCalories = fats * recompConfig.fat.caloriesPerGram;
  const carbCalories = carbs * recompConfig.carbs.caloriesPerGram;
  
  // Actual recomp calories = sum of macro calories (may be less than target if carbs are capped)
  const recompCalories = proteinCalories + fatCalories + carbCalories;
  const deficitPercentage = calculateDeficitPercentage(maintenance, recompCalories);

  return {
    bmr: Math.round(bmr),
    maintenance,
    recompCalories, // Actual sum of macros
    deficitPercentage,
    protein,
    fats,
    carbs,
    proteinCalories,
    fatCalories,
    carbCalories,
  };
}

