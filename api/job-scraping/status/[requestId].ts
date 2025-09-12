import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { verifyToken, extractToken } from '../../_lib/auth';
import { getDb } from '../../_lib/db';
import { jobScrapingRequests } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';

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

    const { requestId } = req.query;
    if (!requestId || typeof requestId !== 'string') {
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    const db = getDb();
    
    // Get the job scraping request
    const [request] = await db
      .select()
      .from(jobScrapingRequests)
      .where(
        and(
          eq(jobScrapingRequests.id, requestId),
          eq(jobScrapingRequests.userId, payload.userId)
        )
      )
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.status(200).json({
      id: request.id,
      status: request.status,
      results: request.results,
      error: request.error,
      createdAt: request.createdAt,
      completedAt: request.completedAt,
    });
  } catch (error) {
    console.error('Error fetching job scraping status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}