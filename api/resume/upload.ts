import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { verifyToken, extractToken } from '../_lib/auth';
import { getDb } from '../_lib/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const uploadSchema = z.object({
  resumeText: z.string(),
});

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

    // Validate request body
    const body = uploadSchema.parse(req.body);
    
    const db = getDb();
    
    // Update user's resume
    await db
      .update(users)
      .set({ resumeText: body.resumeText })
      .where(eq(users.id, payload.userId));

    res.status(200).json({ success: true, message: 'Resume uploaded successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}