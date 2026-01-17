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
 * Uses local timezone to ensure consistency
 */
export function getTodayDateString(): string {
  const now = new Date();
  // Use local timezone to avoid UTC issues
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

