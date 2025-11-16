import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurifyServer = DOMPurify(window);

// Initialize DOMPurify for server-side use
export { DOMPurifyServer as DOMPurify };

/**
 * Middleware to verify JWT token and set user context
 * Addresses Broken Access Control by enforcing authentication
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware for role-based authorization
 * Addresses Broken Access Control
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

/**
 * CSRF protection middleware using double-submit cookie pattern
 * Addresses CSRF vulnerabilities
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const token = req.body._csrf || req.headers['x-csrf-token'];
  const cookieToken = req.cookies._csrf;
  if (!token || token !== cookieToken) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }
  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust as needed
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});

/**
 * Rate limiting middleware
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Input sanitization middleware
 * Addresses XSS by sanitizing all inputs
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return DOMPurifyServer.sanitize(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
};