import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { verifyToken, extractToken } from '../../_lib/auth';
import { getDb } from '../../_lib/db';
import { gmailCredentials } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = getDb();
    
    // Check Gmail credentials status
    const [creds] = await db
      .select({
        isActive: gmailCredentials.isActive,
        expiresAt: gmailCredentials.expiresAt,
      })
      .from(gmailCredentials)
      .where(eq(gmailCredentials.userId, payload.userId))
      .limit(1);

    const isConnected = creds && creds.isActive && creds.expiresAt > new Date();

    res.status(200).json({ 
      isConnected: !!isConnected,
      expiresAt: creds?.expiresAt || null,
    });
  } catch (error) {
    console.error('Error checking Gmail status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}