/**
 * Security Middleware for Production
 * Implements authentication, rate limiting, and API protection
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Rate limiting configuration
 */
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

/**
 * Authentication middleware
 * Checks if user is authenticated via session
 */
export async function requireAuth(req: any, res: Response, next: NextFunction) {
  try {
    // Check if user is in session
    if (!req.session?.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Verify user exists in database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      // Clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Please log in again'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * Admin authentication middleware
 * Checks if user has admin privileges
 */
export async function requireAdmin(req: any, res: Response, next: NextFunction) {
  try {
    // First check basic authentication
    if (!req.session?.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access admin resources'
      });
    }

    // Check if user is admin (you can customize this logic)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Please log in again'
      });
    }

    // Check admin status (customize based on your user schema)
    // For now, checking if email matches admin email
    const adminEmails = ['ashutoshlath@gmail.com', 'support@ai-jobhunter.com'];
    if (!adminEmails.includes(user.email || '')) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      error: 'Authorization error',
      message: 'An error occurred during authorization'
    });
  }
}

/**
 * Rate limiting middleware
 * Prevents API abuse by limiting requests per IP
 */
export function rateLimit(maxRequests: number = RATE_LIMIT_MAX_REQUESTS) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Get or create rate limit entry for this IP
    let entry = rateLimits.get(ip);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
      rateLimits.set(ip, entry);
      return next();
    }
    
    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds`,
        retryAfter
      });
    }
    
    // Increment counter
    entry.count++;
    next();
  };
}

/**
 * API key validation middleware
 * For endpoints that require API key authentication
 */
export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide a valid API key'
    });
  }
  
  // Validate API key (customize based on your implementation)
  // For now, checking against environment variable
  const validApiKey = process.env.INTERNAL_API_KEY;
  if (validApiKey && apiKey !== validApiKey) {
    return res.status(401).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is invalid'
    });
  }
  
  next();
}

/**
 * CORS configuration for production
 */
export function configureCors(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    
    next();
  };
}

/**
 * Security headers middleware
 * Adds security headers to all responses
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent caching of sensitive data
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  next();
}

/**
 * Input validation middleware
 * Sanitizes and validates request inputs
 */
export function validateInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        // Remove any script tags or dangerous content
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    }
  }
  
  // Validate JSON body size
  if (req.body && JSON.stringify(req.body).length > 1024 * 1024) { // 1MB limit
    return res.status(413).json({ 
      error: 'Payload too large',
      message: 'Request body exceeds maximum size limit'
    });
  }
  
  next();
}

/**
 * Error handling middleware
 * Catches and formats errors for production
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    // Known error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Invalid request data'
      });
    }
    
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // Generic error response
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
  
  // Development error response with details
  res.status(err.status || 500).json({
    error: err.name || 'Error',
    message: err.message || 'An error occurred',
    stack: err.stack
  });
}

/**
 * Cleanup function for rate limit entries
 * Removes expired entries to prevent memory leak
 */
export function cleanupRateLimits() {
  const now = Date.now();
  Array.from(rateLimits.entries()).forEach(([ip, entry]) => {
    if (entry.resetTime < now) {
      rateLimits.delete(ip);
    }
  });
}

// Cleanup rate limits every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

export default {
  requireAuth,
  requireAdmin,
  rateLimit,
  validateApiKey,
  configureCors,
  securityHeaders,
  validateInput,
  errorHandler
};