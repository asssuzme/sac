import type { Express, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users, gmailCredentials } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { getGmailAuthUrl, handleGmailCallback } from "../gmailOAuth";
import { requireAuth } from "../googleAuth";

export function registerGmailAuthRoutes(app: Express) {
  // Gmail OAuth authorization - handles both JSON and redirect
  app.get("/api/auth/gmail/authorize", async (req: any, res) => {
    try {
      // Check if user is authenticated
      const userId = req.session?.userId;
      const returnUrl = req.query.returnUrl as string || '/';
      
      console.log('Gmail auth attempt - Session userId:', userId, 'ReturnUrl:', returnUrl);
      
      if (!userId) {
        console.log('No session found for Gmail auth');
        return res.status(401).json({ message: 'Unauthorized - Please log in first' });
      }
      
      // Get user from database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user) {
        console.log('User not found for Gmail auth:', userId);
        req.session.destroy(() => {});
        return res.status(401).json({ message: 'Unauthorized - Invalid session' });
      }
      
      // Check for existing Gmail credentials
      const [existingCreds] = await db
        .select()
        .from(gmailCredentials)
        .where(eq(gmailCredentials.userId, user.id))
        .limit(1);
      
      // Determine if we should force consent
      // Only force consent if there's no existing refresh token
      const forceConsent = !existingCreds || !existingCreds.refreshToken;
      
      console.log('Gmail auth check:', {
        userId: user.id,
        hasExistingCreds: !!existingCreds,
        hasRefreshToken: !!(existingCreds?.refreshToken),
        forceConsent
      });
      
      // Generate auth URL with returnUrl and conditional consent
      const authUrl = getGmailAuthUrl(user.id, req, forceConsent, returnUrl);
      console.log('Generated Gmail auth URL for user:', user.email, 'ForceConsent:', forceConsent);
      
      // Redirect directly to Google OAuth instead of returning JSON
      res.redirect(authUrl);
    } catch (error) {
      console.error('Gmail authorization error:', error);
      res.status(500).json({ 
        error: 'Failed to initiate Gmail authorization',
        message: (error as Error).message 
      });
    }
  });

  // Gmail OAuth callback
  app.get("/api/auth/gmail/callback", async (req, res) => {
    const { code, state } = req.query;
    
    if (!code || !state) {
      console.error('Missing code or state in Gmail callback');
      return res.redirect('/?error=gmail_auth_failed&reason=missing_params');
    }

    try {
      console.log('Processing Gmail callback with code:', typeof code);
      const result = await handleGmailCallback(code as string, state as string, req);
      
      console.log('Gmail callback result:', {
        userId: result.userId,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
        expiresAt: result.expiresAt,
        returnUrl: result.returnUrl
      });
      
      // Store tokens in database
      await db
        .insert(gmailCredentials)
        .values({
          userId: result.userId,
          accessToken: result.accessToken!,
          refreshToken: result.refreshToken!,
          expiresAt: new Date(result.expiresAt || Date.now() + 3600 * 1000),
          isActive: true,
        })
        .onConflictDoUpdate({
          target: gmailCredentials.userId,
          set: {
            accessToken: result.accessToken!,
            refreshToken: result.refreshToken || sql`${gmailCredentials.refreshToken}`,
            expiresAt: new Date(result.expiresAt || Date.now() + 3600 * 1000),
            isActive: true,
            updatedAt: new Date(),
          },
        });

      console.log('Gmail credentials stored successfully for user:', result.userId);
      
      // Redirect to returnUrl with success indicator
      const returnUrl = result.returnUrl || '/';
      const separator = returnUrl.includes('?') ? '&' : '?';
      res.redirect(`${returnUrl}${separator}gmail=success&auto_apply=true`);
    } catch (error) {
      console.error('Gmail callback error:', error);
      res.redirect(`/?error=gmail_auth_failed&reason=${encodeURIComponent((error as Error).message)}`);
    }
  });

  // Gmail status
  app.get("/api/auth/gmail/status", requireAuth, async (req: any, res) => {
    try {
      const [creds] = await db
        .select()
        .from(gmailCredentials)
        .where(eq(gmailCredentials.userId, req.user!.id))
        .limit(1);

      const isConnected = creds && creds.isActive && creds.expiresAt > new Date();
      const needsRefresh = creds && creds.isActive && creds.expiresAt <= new Date();
      
      console.log('Gmail status check:', {
        userId: req.user!.id,
        hasCreds: !!creds,
        isActive: creds?.isActive,
        expiresAt: creds?.expiresAt,
        isConnected,
        needsRefresh
      });
      
      res.json({ 
        authorized: isConnected,
        isConnected,
        needsRefresh,
        expiresAt: creds?.expiresAt
      });
    } catch (error) {
      console.error('Gmail status check error:', error);
      res.status(500).json({ 
        authorized: false,
        error: 'Failed to check Gmail status' 
      });
    }
  });

  // Unlink Gmail
  app.post("/api/auth/gmail/unlink", requireAuth, async (req: any, res) => {
    try {
      await db
        .update(gmailCredentials)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(gmailCredentials.userId, req.user!.id));

      console.log('Gmail unlinked for user:', req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Gmail unlink error:', error);
      res.status(500).json({ 
        error: 'Failed to unlink Gmail' 
      });
    }
  });
}