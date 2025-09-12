# Production Deployment Fix Guide

## Issue
The application works fine in development but has authentication issues in production at https://gigfloww.com

## Changes Made

### 1. Session Cookie Configuration
- Updated session configuration to properly detect production environment
- Set cookie domain to `.gigfloww.com` for production to work across subdomains
- Ensured secure cookies with `sameSite: 'none'` for cross-origin requests

### 2. CORS Configuration
- Added production domains to allowed origins:
  - https://gigfloww.com
  - https://www.gigfloww.com
  - https://service-genie-ashutoshlathrep.replit.app

### 3. Gmail OAuth Callback URLs
- Fixed OAuth callback URLs to use the correct production domain
- Instead of relying on `req.protocol` and `req.get('host')` which can be unreliable behind proxies
- Now explicitly uses `https://gigfloww.com` in production

### 4. Environment Detection
- Improved production detection using multiple checks:
  - `NODE_ENV === 'production'`
  - Presence of `REPL_SLUG` environment variable
  - Presence of `REPLIT_DOMAINS` environment variable

## Required Supabase Configuration

Make sure you have added these URLs to your Supabase project settings:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to "Redirect URLs":
   - https://gigfloww.com/auth/callback
   - https://www.gigfloww.com/auth/callback
   - https://service-genie-ashutoshlathrep.replit.app/auth/callback
   - http://localhost:5000/auth/callback
   - http://localhost:3000/auth/callback

## Required Google OAuth Configuration

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to "Authorized JavaScript origins":
   - https://gigfloww.com
   - https://www.gigfloww.com
   - https://service-genie-ashutoshlathrep.replit.app
4. Add to "Authorized redirect URIs":
   - https://gigfloww.com/api/auth/gmail/callback
   - https://www.gigfloww.com/api/auth/gmail/callback
   - https://service-genie-ashutoshlathrep.replit.app/api/auth/gmail/callback

## Environment Variables

Ensure these are set in your Replit Secrets:
- `SESSION_SECRET` - A random secret for session encryption
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
- `SENDGRID_API_KEY` - Your SendGrid API key (if using SendGrid)
- `OPENAI_API_KEY` - Your OpenAI API key

## Testing Production

After making these changes:
1. Clear your browser cookies for gigfloww.com
2. Try signing in again at https://gigfloww.com
3. Check the browser console for any errors
4. Check the Replit logs for any server-side errors