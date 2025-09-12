import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../_lib/db';
import { gmailCredentials } from '../../../shared/schema';
import { google } from 'googleapis';
import { sql } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    const { userId } = JSON.parse(state as string);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.VERCEL_URL || 'http://localhost:5173'}/api/auth/gmail/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    const db = getDb();
    
    // Store or update Gmail credentials
    await db
      .insert(gmailCredentials)
      .values({
        userId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
        isActive: true,
      })
      .onConflictDoUpdate({
        target: gmailCredentials.userId,
        set: {
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token || sql`${gmailCredentials.refreshToken}`,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
          isActive: true,
        },
      });

    // Redirect back to the app
    res.redirect(302, '/settings?gmail=success');
  } catch (error) {
    console.error('Error in Gmail callback:', error);
    res.redirect(302, '/settings?gmail=error');
  }
}