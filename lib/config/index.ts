import configData from './recomp-config.json';

/**
 * Centralized configuration for recomp calculations
 * Edit recomp-config.json to change all hardcoded values
 */
export const recompConfig = {
  activity: configData.activity,
  recomp: configData.recomp,
  protein: configData.protein,
  fat: configData.fat,
  carbs: configData.carbs,
} as const;

export type RecompConfig = typeof recompConfig;

