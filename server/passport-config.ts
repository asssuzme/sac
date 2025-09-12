import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Function to get callback URL dynamically
function getCallbackURL(req?: any): string {
  if (req && req.get) {
    const host = req.get('host') || '';
    
    // Check if we're on production domain
    if (host.includes('ai-jobhunter.com')) {
      return 'https://ai-jobhunter.com/api/auth/google/callback';
    } else if (host.includes('replit.dev')) {
      return `https://${host}/api/auth/google/callback`;
    } else if (host.includes('localhost')) {
      return `http://${host}/api/auth/google/callback`;
    }
    return `${req.protocol}://${host}/api/auth/google/callback`;
  }
  
  // Fallback for initialization (will be overridden per request)
  if (process.env.REPLIT_DOMAINS) {
    const domains = process.env.REPLIT_DOMAINS.split(',');
    return `https://${domains[0]}/api/auth/google/callback`;
  }
  return `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`;
}

console.log('=== GOOGLE OAUTH CONFIGURATION ===');
console.log('REPLIT_DOMAINS:', process.env.REPLIT_DOMAINS);
console.log('Initial callback URL:', getCallbackURL());
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('================================');

// Configure Google OAuth strategy - basic profile only
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: getCallbackURL(),
      passReqToCallback: true, // This allows us to access the request in the callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth callback with profile:', profile.id, profile.emails?.[0]?.value);
        console.log('Tokens received:', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });
        
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // Find user by email first
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        let user;
        if (existingUser.length > 0) {
          // Update existing user
          [user] = await db
            .update(users)
            .set({
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
            })
            .where(eq(users.email, email))
            .returning();
        } else {
          // Create new user
          [user] = await db
            .insert(users)
            .values({
              id: profile.id,
              email: email,
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
            })
            .returning();
        }

        // Pass tokens in authInfo for Gmail authorization
        return done(null, user, { accessToken, refreshToken });
      } catch (error) {
        console.error('OAuth error:', error);
        return done(error as Error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    done(null, user || null);
  } catch (error) {
    done(error);
  }
});

export default passport;