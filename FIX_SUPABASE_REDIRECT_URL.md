# Fix Supabase OAuth Redirect URL

## Issue
Safari cannot connect to localhost:3000 during OAuth callback, even though we have a redirect server running.

## Solution
The best solution is to update your Supabase project settings to redirect directly to port 5000 where your app runs.

### Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Go to "URL Configuration"

3. **Update the Redirect URLs**
   - Find the field "Redirect URLs"
   - Add BOTH of these URLs (one per line):
     - `http://localhost:5000/*`
     - `https://c05d4b50-6255-406b-853e-f8eff1ef387c-00-2171d433m1jzt.picard.replit.dev/*`
   - Make sure to include the wildcard `/*` at the end of each URL

4. **Save Changes**
   - Click "Save" to apply the changes

5. **Wait for Changes to Propagate**
   - Changes may take 1-2 minutes to take effect

6. **Test Again**
   - Try signing in with Google again
   - The OAuth flow should now redirect directly to port 5000

## Alternative Solution (if you can't change Supabase settings)

If you cannot change the Supabase redirect URL, try using a different browser:
- Chrome typically handles localhost redirects better than Safari
- Firefox also works well with localhost redirects

## Why This Happens

Safari has stricter security policies for localhost connections, especially with redirects. The OAuth callback URL contains many parameters, making it very long, which can cause issues with Safari's connection handling.

## Verification

After updating the Supabase settings, the OAuth flow should work as:
1. Click "Sign in with Google"
2. Authenticate with Google
3. Google → Supabase → localhost:5000 (directly)
4. Authentication completes successfully

No redirect from port 3000 will be needed anymore.