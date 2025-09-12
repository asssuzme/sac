import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { verifyToken, extractToken } from '../_lib/auth';
import { getDb } from '../_lib/db';
import { jobScrapingRequests, insertJobScrapingRequestSchema } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const submitSchema = z.object({
  search: z.string(),
  location: z.string(),
  workType: z.enum(['remote', 'hybrid', 'onsite']),
  jobTitle: z.string().optional(),
  experienceLevel: z.enum(['internship', 'entry', 'associate', 'mid-senior', 'director', 'executive']).optional(),
  datePosted: z.enum(['any', 'month', 'week', '24h']),
  easyApply: z.boolean(),
  limit: z.number().min(1).max(1000),
  companyType: z.array(z.string()).optional(),
  jobType: z.array(z.string()).optional(),
  salary: z.enum(['any', '40k+', '60k+', '80k+', '100k+', '120k+', '140k+', '160k+', '180k+', '200k+']).optional(),
  seniorityLevel: z.array(z.string()).optional(),
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
    const body = submitSchema.parse(req.body);
    
    const db = getDb();
    
    // Create a new job scraping request
    const [request] = await db
      .insert(jobScrapingRequests)
      .values({
        userId: payload.userId,
        linkedinUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(body.search)}&location=${encodeURIComponent(body.location)}`,
        resumeText: null,
        status: 'pending',
        results: [],
      })
      .returning();

    // In a production environment, you would trigger the actual scraping job here
    // For now, we'll just return the created request
    
    res.status(200).json({
      requestId: request.id,
      status: 'pending',
      message: 'Job scraping request submitted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error submitting job scraping request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}