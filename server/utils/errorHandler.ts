import { Response } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Centralized error handling utility for API responses
 * Provides consistent error handling across all route handlers
 * 
 * @param err - The error object
 * @param res - Express response object
 * @param message - Default error message to display
 */
export const handleApiError = (err: unknown, res: Response, message: string): void => {
  console.error(`[ERROR] ${message}:`, err);
  
  // Handle validation errors
  if (err instanceof ZodError) {
    res.status(400).json({ message: fromZodError(err).message });
    return;
  }
  
  // Handle HTTP errors with status codes
  const status = (err as any)?.status || 500;
  
  // Provide different error messages based on environment
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? "Internal Server Error" 
    : (err as Error)?.message || message;
  
  res.status(status).json({ message: errorMessage });
};
