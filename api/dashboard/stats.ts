import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { verifyToken, extractToken } from '../_lib/auth';
import { getDb } from '../_lib/db';
import { jobScrapingRequests, emailApplications } from '../../shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

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
    
    // Get counts for dashboard stats
    const [scrapingCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(jobScrapingRequests)
      .where(eq(jobScrapingRequests.userId, payload.userId));

    const [applicationCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(emailApplications)
      .where(eq(emailApplications.userId, payload.userId));

    // Get recent activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentScrapingCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(jobScrapingRequests)
      .where(
        and(
          eq(jobScrapingRequests.userId, payload.userId),
          gte(jobScrapingRequests.createdAt, sevenDaysAgo)
        )
      );

    const [recentApplicationCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(emailApplications)
      .where(
        and(
          eq(emailApplications.userId, payload.userId),
          gte(emailApplications.sentAt, sevenDaysAgo)
        )
      );

    // Get recent searches for history display
    console.log('🔍 DEBUG: Fetching recent searches for user:', payload.userId);
    const recentSearches = await db
      .select()
      .from(jobScrapingRequests)
      .where(eq(jobScrapingRequests.userId, payload.userId))
      .orderBy(desc(jobScrapingRequests.createdAt))
      .limit(10);
    console.log('🔍 DEBUG: Found', recentSearches.length, 'recent searches');

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json({
      totalJobsScraped: scrapingCount?.count || 0,
      totalApplicationsSent: applicationCount?.count || 0,
      activeJobSearches: recentScrapingCount?.count || 0,
      pendingApplications: 0,
      recentSearches: recentSearches,
      recentActivity: {
        jobsScrapedThisWeek: recentScrapingCount?.count || 0,
        applicationsSentThisWeek: recentApplicationCount?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}