import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Extend the session interface to include csrfToken
declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}

/**
 * Middleware to set up CSRF protection
 * Generates a CSRF token and stores it in the session
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const setupCsrf = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(20).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

/**
 * Middleware to validate CSRF token
 * Checks if the token in the request matches the one in the session
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const validateCsrf = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF validation for GET requests as they should be idempotent
  if (req.method === 'GET') {
    next();
    return;
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token || token !== req.session?.csrfToken) {
    res.status(403).json({ message: "Invalid CSRF token" });
    return;
  }
  
  next();
};
