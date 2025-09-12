# Authentication Fixed! 

## What was wrong
The database was trying to insert duplicate email addresses, causing a constraint violation. This happened because the upsert operation wasn't working correctly.

## What I fixed
1. Changed the upsert logic to first check if a user exists by ID
2. If user exists, we update their information
3. If user doesn't exist, we create a new one
4. This prevents duplicate email constraint violations

## Testing Steps

1. Clear your browser cookies/cache for the Replit domain
2. Visit: https://service-genie-ashutoshlathrep.replit.app
3. Click "Sign in with Google"
4. Complete the Google authentication

## Important: Supabase Configuration

Make sure your Supabase project has these redirect URLs:
- https://service-genie-ashutoshlathrep.replit.app/auth/callback
- http://localhost:5000/auth/callback
- http://localhost:3000/auth/callback

Remove any gigfloww.com URLs from Supabase.

## If you still see errors

1. Check browser console for errors
2. Check network tab for failed requests
3. The server logs now include better error messages

The authentication should work now!