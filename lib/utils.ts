import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a date from various input types (Firebase Timestamp, Date, string, number)
 * @param dateInput The date input which could be Firebase Timestamp, Date, string, or number
 * @param defaultValue Value to return if the date is invalid or null/undefined
 * @returns Formatted date string or the defaultValue if the date is invalid
 */
export function safeFormatDate(dateInput: any, defaultValue: string = 'N/A'): string {
  if (!dateInput) return defaultValue;
  
  try {
    // Handle Firebase Timestamp objects
    if (typeof dateInput.toDate === 'function') {
      return dateInput.toDate().toLocaleDateString();
    }
    
    // Handle Date objects
    if (dateInput instanceof Date) {
      return dateInput.toLocaleDateString();
    }
    
    // Handle string or number timestamps
    if (typeof dateInput === 'string' || typeof dateInput === 'number') {
      return new Date(dateInput).toLocaleDateString();
    }
    
    return defaultValue;
  } catch (error) {
    console.error('Error formatting date:', error);
    return defaultValue;
  }
}

/**
 * Safely converts various date input types to a JavaScript Date object
 * @param dateInput The date input which could be Firebase Timestamp, Date, string, or number
 * @returns A JavaScript Date object, or null if conversion fails
 */
export function getDateFromAny(dateInput: any): Date | null {
  if (!dateInput) return null;
  
  try {
    // Handle Firebase Timestamp objects
    if (dateInput && typeof dateInput.toDate === 'function') {
      return dateInput.toDate();
    }
    
    // Handle Date objects
    if (dateInput instanceof Date) {
      return dateInput;
    }
    
    // Handle string or number timestamps
    if (typeof dateInput === 'string' || typeof dateInput === 'number') {
      return new Date(dateInput);
    }
    
    return null;
  } catch (error) {
    console.error('Error converting to Date:', error);
    return null;
  }
}

/**
 * Formats a date for input fields (YYYY-MM-DD format)
 * @param dateInput The date input which could be Firebase Timestamp, Date, string, or number
 * @param defaultValue Value to return if the date is invalid
 * @returns Date string in YYYY-MM-DD format or defaultValue
 */
export function formatDateForInput(dateInput: any, defaultValue: string = ''): string {
  if (!dateInput) return defaultValue;
  
  try {
    const date = getDateFromAny(dateInput);
    if (!date) return defaultValue;
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return defaultValue;
  }
} 