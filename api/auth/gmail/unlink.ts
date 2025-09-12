import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { verifyToken, extractToken } from '../../_lib/auth';
import { getDb } from '../../_lib/db';
import { gmailCredentials } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
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
    
    // Deactivate Gmail credentials
    await db
      .update(gmailCredentials)
      .set({ isActive: false })
      .where(eq(gmailCredentials.userId, payload.userId));

    res.status(200).json({ success: true, message: 'Gmail account unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking Gmail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}