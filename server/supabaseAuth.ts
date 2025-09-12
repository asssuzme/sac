import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Extend Request type to include session
declare module "express-session" {
  interface SessionData {
    userId?: string;
    googleAccessToken?: string;
    googleRefreshToken?: string;
  }
}

interface AuthRequest extends Request {
  user?: User;
}

export function setupSupabaseAuth(app: Express) {
  // Middleware to check if user is authenticated
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (authReq.session?.userId) {
      try {
        const user = await storage.getUser(authReq.session.userId);
        if (user) {
          authReq.user = user;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    next();
  });

  // Handle Supabase authentication callback
  app.post('/api/auth/supabase/callback', async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const { userId, email, accessToken, refreshToken, userMetadata } = req.body;

      if (!userId || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Upsert user in our database
      const user = await storage.upsertUser({
        id: userId,
        email: email,
        firstName: userMetadata?.first_name || userMetadata?.given_name || null,
        lastName: userMetadata?.last_name || userMetadata?.family_name || null,
        profileImageUrl: userMetadata?.avatar_url || userMetadata?.picture || null,
      });

      // Store session data - use the actual user ID from database
      authReq.session.userId = user.id;
      authReq.session.googleAccessToken = accessToken;
      authReq.session.googleRefreshToken = refreshToken;

      // Save session explicitly
      authReq.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
          return res.status(500).json({ error: 'Failed to save session' });
        }
        
        res.json({ success: true, userId: user.id });
      });
    } catch (error) {
      console.error('Error in Supabase callback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user endpoint
  app.get('/api/auth/user', async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json(authReq.user);
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
}

// Middleware to protect routes
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};