import { OAuth2Client } from 'google-auth-library';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

// Production domain configuration
const PRODUCTION_DOMAIN = 'ai-jobhunter.com';

// Helper to determine the base URL
export function getBaseUrl(req: Request): string {
  const host = req.get('host') || '';
  
  // Always check for production domain first
  if (host.includes(PRODUCTION_DOMAIN)) {
    return `https://${PRODUCTION_DOMAIN}`;
  }
  
  // Check for localhost
  if (host.includes('localhost')) {
    return `http://${host}`;
  }
  
  // Default to https for any other domain (including Replit)
  return `https://${host}`;
}

// Create OAuth client with proper redirect URI
export function createOAuthClient(req: Request): OAuth2Client {
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  
  console.log('Creating OAuth client with redirect URI:', redirectUri);
  
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

// Generate Google OAuth URL
export function getGoogleAuthUrl(req: Request): string {
  const client = createOAuthClient(req);
  
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent'
  });
}

// Handle Google OAuth callback
export async function handleGoogleCallback(req: Request, res: Response) {
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(`/?error=${error}`);
    }
    
    if (!code || typeof code !== 'string') {
      return res.redirect('/?error=no_code');
    }
    
    // Create OAuth client with the same redirect URI
    const client = createOAuthClient(req);
    
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    // Get user info
    const oauth2 = new OAuth2Client();
    oauth2.setCredentials(tokens);
    
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    const profile = await response.json();
    
    // Upsert user in database
    const [user] = await db
      .insert(users)
      .values({
        id: profile.id,
        email: profile.email,
        firstName: profile.given_name || null,
        lastName: profile.family_name || null,
        profileImageUrl: profile.picture || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: profile.email,
          firstName: profile.given_name || null,
          lastName: profile.family_name || null,
          profileImageUrl: profile.picture || null,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Set session
    (req as any).session.userId = user.id;
    
    // Save session
    await new Promise<void>((resolve, reject) => {
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          console.log('Session saved for user:', user.email);
          resolve();
        }
      });
    });
    
    res.redirect('/?auth=success');
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}

// Auth middleware
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      (req as any).session.destroy(() => {});
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}