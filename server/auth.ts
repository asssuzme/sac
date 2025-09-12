import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Simple authentication middleware
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);
    
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get current user
export async function getCurrentUser(req: Request, res: Response) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);
    
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Handle Supabase callback
export async function handleSupabaseCallback(req: Request, res: Response) {
  try {
    const { userId, email, userMetadata } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
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
    
    // Set session
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      res.json({ success: true, userId: user.id });
    });
  } catch (error) {
    console.error('Supabase callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Logout
export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
}