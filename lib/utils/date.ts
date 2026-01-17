import { format } from 'date-fns';

/**
 * Format date to YYYY-MM-DD for database storage
 */
export function formatDateForDB(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return formatDateForDB(new Date());
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

