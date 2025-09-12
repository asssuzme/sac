import type { Express, Request, Response } from "express";
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

// Store pending auth states
const authStates = new Map<string, { timestamp: number }>();

// Generate random state for CSRF protection
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Clean up old auth states
function cleanupAuthStates() {
  const now = Date.now();
  for (const [state, data] of authStates.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      authStates.delete(state);
    }
  }
}

export function setupSimpleGoogleAuth(app: Express) {
  // Simple auth check middleware
  app.use((req: AuthRequest, res, next) => {
    if (req.session?.userId) {
      storage.getUser(req.session.userId)
        .then(user => {
          if (user) {
            req.user = user;
          }
          next();
        })
        .catch(() => next());
    } else {
      next();
    }
  });

  // Initiate Google OAuth flow
  app.get('/api/auth/google/simple', (req, res) => {
    const state = generateState();
    authStates.set(state, { timestamp: Date.now() });
    cleanupAuthStates();

    // Dynamically determine base URL from the actual request
    const host = req.get('host') || '';
    let baseUrl: string;
    
    // Check if we're on production domain
    if (host.includes('ai-jobhunter.com')) {
      baseUrl = 'https://ai-jobhunter.com';
    } else if (process.env.REPLIT_DOMAINS && host.includes('replit.dev')) {
      // Use the current Replit domain from the request
      baseUrl = `https://${host}`;
    } else if (host.includes('localhost')) {
      baseUrl = `http://${host}`;
    } else {
      // Fallback to the actual host from the request
      baseUrl = `${req.protocol}://${host}`;
    }
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: `${baseUrl}/api/auth/google/simple/callback`,
      response_type: 'code',
      scope: 'openid email profile https://www.googleapis.com/auth/gmail.send',
      access_type: 'offline',
      prompt: 'consent',
      state: state
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('OAuth flow initiated from host:', host);
    console.log('Using redirect URI:', `${baseUrl}/api/auth/google/simple/callback`);
    
    res.redirect(authUrl);
  });

  // Handle Google OAuth callback
  app.get('/api/auth/google/simple/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('/?error=auth_failed');
    }

    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      console.error('Missing code or state');
      return res.redirect('/?error=invalid_response');
    }

    // Verify state
    if (!authStates.has(state)) {
      console.error('Invalid state');
      return res.redirect('/?error=invalid_state');
    }
    authStates.delete(state);

    try {
      // Dynamically determine base URL from the actual request
      const host = req.get('host') || '';
      let baseUrl: string;
      
      // Check if we're on production domain
      if (host.includes('ai-jobhunter.com')) {
        baseUrl = 'https://ai-jobhunter.com';
      } else if (process.env.REPLIT_DOMAINS && host.includes('replit.dev')) {
        // Use the current Replit domain from the request
        baseUrl = `https://${host}`;
      } else if (host.includes('localhost')) {
        baseUrl = `http://${host}`;
      } else {
        // Fallback to the actual host from the request
        baseUrl = `${req.protocol}://${host}`;
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code: code,
          redirect_uri: `${baseUrl}/api/auth/google/simple/callback`,
          grant_type: 'authorization_code'
        })
      });

      const tokens = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokens);
        return res.redirect('/?error=token_exchange_failed');
      }

      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });

      const googleUser = await userResponse.json();
      
      if (!userResponse.ok) {
        console.error('Failed to get user info:', googleUser);
        return res.redirect('/?error=user_info_failed');
      }

      // Create or update user in database
      const userData = {
        googleId: googleUser.id,
        email: googleUser.email,
        firstName: googleUser.given_name || '',
        lastName: googleUser.family_name || '',
        profileImageUrl: googleUser.picture || ''
      };

      const user = await storage.upsertUser(userData);

      // Store user session
      req.session!.userId = user.id;
      req.session!.googleAccessToken = tokens.access_token;
      req.session!.googleRefreshToken = tokens.refresh_token;

      console.log('User authenticated successfully:', user.email);
      res.redirect('/');
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/?error=server_error');
    }
  });

  // Simple logout
  app.get('/api/auth/logout', (req, res) => {
    req.session?.destroy(() => {
      res.redirect('/');
    });
  });

  // Simple user endpoint
  app.get('/api/auth/simple/user', (req: AuthRequest, res) => {
    if (req.user) {
      res.json({
        ...req.user,
        googleAccessToken: req.session?.googleAccessToken
      });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });
}

// Simple auth check
export function isSimpleAuthenticated(req: AuthRequest, res: Response, next: Function) {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}