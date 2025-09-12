import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../../_lib/cors';
import { createToken } from '../../_lib/auth';
import { getDb } from '../../_lib/db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email, accessToken, refreshToken, userMetadata } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    
    // Upsert user in database
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: email,
        firstName: userMetadata?.first_name || userMetadata?.given_name || null,
        lastName: userMetadata?.last_name || userMetadata?.family_name || null,
        profileImageUrl: userMetadata?.avatar_url || userMetadata?.picture || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: email,
          firstName: userMetadata?.first_name || userMetadata?.given_name || null,
          lastName: userMetadata?.last_name || userMetadata?.family_name || null,
          profileImageUrl: userMetadata?.avatar_url || userMetadata?.picture || null,
        },
      })
      .returning();

    // Create JWT token
    const token = await createToken(user);

    res.status(200).json({ success: true, token, userId: user.id });
  } catch (error) {
    console.error('Error in Supabase callback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}