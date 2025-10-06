import type { Express } from 'express';
import { getGoogleAuthUrl, handleGoogleCallback, requireAuth } from './googleAuth';
import { db } from './db';
import { users, gmailCredentials } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';

// Gmail-specific OAuth functions
function getGmailAuthUrl(req: any, returnUrl?: string, autoApply?: boolean): string {
  const host = req.get('host') || '';
  const baseUrl = host.includes('ai-jobhunter.com') 
    ? 'https://ai-jobhunter.com'
    : host.includes('localhost')
    ? `http://${host}`
    : `https://${host}`;
  
  const redirectUri = `${baseUrl}/api/auth/gmail/callback`;
  
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
  
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent',
    state: JSON.stringify({ 
      userId: req.user.id,
      returnUrl: returnUrl || '/',
      autoApply: autoApply || false
    })
  });
}

export function setupAuthRoutes(app: Express) {
  // === MAIN AUTH ROUTES ===
  
  // Get current user
  app.get('/api/auth/user', async (req: any, res) => {
    const userId = req.session?.userId;
    
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
        req.session.destroy(() => {});
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Google OAuth login
  app.get('/api/auth/google', (req, res) => {
    const authUrl = getGoogleAuthUrl(req);
    res.redirect(authUrl);
  });
  
  // Google OAuth callback
  app.get('/api/auth/google/callback', handleGoogleCallback);
  
  // Logout
  app.post('/api/auth/logout', (req: any, res) => {
    // Store session ID for logging
    const sessionId = req.sessionID;
    
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      
      // FIXED: Clear cookie with correct options matching session config
      // Detect HTTPS environment (Replit or production)
      const isReplitEnv = !!process.env.REPLIT_DOMAINS;
      const isProduction = process.env.NODE_ENV === 'production';
      const isHTTPS = isReplitEnv || isProduction;
      
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: isHTTPS,  // Match session config
        sameSite: isHTTPS ? 'none' : 'lax'  // Match session config
      });
      
      console.log('User logged out successfully, session destroyed:', sessionId);
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // === GMAIL AUTH ROUTES ===
  // Note: Gmail authorization is handled by registerGmailAuthRoutes in server/routes/gmail-auth.ts
  
  // Gmail callback - DISABLED (handled by routes.ts)
  /*
  app.get('/api/auth/gmail/callback', async (req: any, res) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        return res.redirect(`/?gmail_error=${error}`);
      }
      
      if (!code || typeof code !== 'string') {
        return res.redirect('/?gmail_error=no_code');
      }
      
      // Decode base64 state parameter first
      const decodedState = Buffer.from(state as string, 'base64').toString('utf-8');
      const { userId, returnUrl, autoApply } = JSON.parse(decodedState);
      
      // Get the proper redirect URI
      const host = req.get('host') || '';
      const baseUrl = host.includes('ai-jobhunter.com')
        ? 'https://ai-jobhunter.com'
        : host.includes('localhost')
        ? `http://${host}`
        : `https://${host}`;
      
      const redirectUri = `${baseUrl}/api/auth/gmail/callback`;
      
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      const { tokens } = await client.getToken(code);
      
      // Save Gmail credentials
      await db
        .insert(gmailCredentials)
        .values({
          userId,
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token || '',
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
          isActive: true,
        })
        .onConflictDoUpdate({
          target: gmailCredentials.userId,
          set: {
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token || undefined,
            expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
            isActive: true,
            updatedAt: new Date(),
          },
        });
      
      // Redirect back to the original page with auto-apply flag
      const redirectPath = autoApply 
        ? `${returnUrl || '/'}${returnUrl?.includes('?') ? '&' : '?'}gmail=success&auto_apply=true`
        : '/?gmail=success';
      res.redirect(redirectPath);
    } catch (error) {
      console.error('Gmail callback error:', error);
      res.redirect('/?gmail_error=callback_failed');
    }
  });
  */
  
  // Gmail status
  app.get('/api/auth/gmail/status', requireAuth, async (req: any, res) => {
    try {
      const [credentials] = await db
        .select()
        .from(gmailCredentials)
        .where(eq(gmailCredentials.userId, req.user.id))
        .limit(1);
      
      const isConnected = credentials && credentials.isActive && credentials.expiresAt > new Date();
      res.json({ authorized: isConnected });
    } catch (error) {
      console.error('Error checking Gmail status:', error);
      res.status(500).json({ message: 'Failed to check Gmail status' });
    }
  });
  
  // === DEBUG ROUTES ===
  
  // OAuth debug info
  app.get('/api/oauth-debug', (req, res) => {
    const host = req.get('host') || '';
    const baseUrl = host.includes('ai-jobhunter.com')
      ? 'https://ai-jobhunter.com'
      : host.includes('localhost')
      ? `http://${host}`
      : `https://${host}`;
    
    res.json({
      host,
      baseUrl,
      googleCallbackUrl: `${baseUrl}/api/auth/google/callback`,
      gmailCallbackUrl: `${baseUrl}/api/auth/gmail/callback`,
      clientId: process.env.GOOGLE_CLIENT_ID?.slice(0, 20) + '...',
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      requiredRedirectUris: [
        `${baseUrl}/api/auth/google/callback`,
        `${baseUrl}/api/auth/gmail/callback`
      ]
    });
  });
}