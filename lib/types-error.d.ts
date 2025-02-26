// Custom error type to replace 'any' in error handling
export type ApiError = {
  message: string;
  code?: string;
  status?: number;
  [key: string]: unknown;
}; 