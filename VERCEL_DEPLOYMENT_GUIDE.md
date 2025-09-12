# Vercel Deployment Guide

This guide outlines the complete conversion of the autoapply.ai application from Express.js with session-based authentication to Vercel serverless functions with JWT authentication.

## Architecture Changes

### Before (Express.js)
- Session-based authentication with cookies
- Single Express server handling all routes
- In-memory session storage
- Database connections managed by Express middleware

### After (Vercel Serverless)
- JWT token-based authentication
- Individual serverless functions for each API endpoint
- Tokens stored in localStorage and sent via Authorization headers
- Database connections created per request

## Key Files Created

### API Endpoints
- `api/auth/user.ts` - Get current user info
- `api/auth/logout.ts` - Logout (client-side token removal)
- `api/auth/supabase/callback.ts` - Handle Supabase OAuth callback
- `api/auth/gmail/authorize.ts` - Generate Gmail OAuth URL
- `api/auth/gmail/callback.ts` - Handle Gmail OAuth callback
- `api/auth/gmail/status.ts` - Check Gmail connection status
- `api/auth/gmail/unlink.ts` - Disconnect Gmail account
- `api/dashboard/stats.ts` - Get dashboard statistics
- `api/job-scraping/submit.ts` - Submit job scraping request
- `api/job-scraping/status/[requestId].ts` - Get scraping status
- `api/email/generate.ts` - Generate AI email content
- `api/email/send.ts` - Send emails via Gmail or SendGrid
- `api/resume/upload.ts` - Upload resume text
- `api/applications/list.ts` - List email applications

### Utility Libraries
- `api/_lib/auth.ts` - JWT token creation and verification
- `api/_lib/db.ts` - Database connection utility
- `api/_lib/cors.ts` - CORS headers management

### Client Updates
- `client/src/lib/auth-token.ts` - Token management utilities
- Updated `client/src/lib/queryClient.ts` to use Authorization headers
- Updated `client/src/hooks/useAuth.ts` for JWT-based auth
- Updated `client/src/pages/auth-callback.tsx` to store JWT tokens

## Environment Variables Required

For Vercel deployment, set these environment variables:

```bash
# Database
DATABASE_URL=your_neon_database_url

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Google OAuth (for user authentication and Gmail API)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# SendGrid (for email sending fallback)
SENDGRID_API_KEY=your_sendgrid_api_key

# OpenAI (for email generation)
OPENAI_API_KEY=your_openai_api_key

# Supabase (for OAuth authentication)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   In the Vercel dashboard, go to your project settings and add all required environment variables.

5. **Update Supabase Redirect URLs**:
   Add your Vercel domain to Supabase OAuth redirect URLs:
   - `https://your-app.vercel.app/auth/callback`

6. **Update CORS Origins**:
   The `api/_lib/cors.ts` file includes production domain allowlist. Update with your actual Vercel URL.

## Authentication Flow

1. User clicks "Sign in with Google" on landing page
2. Supabase handles OAuth flow and redirects to `/auth/callback`
3. Callback page extracts session data and sends to `/api/auth/supabase/callback`
4. Backend creates JWT token and returns it
5. Frontend stores JWT in localStorage
6. All subsequent API calls include `Authorization: Bearer <token>` header
7. Backend verifies JWT on each request

## Database Considerations

- Database connections are created per request in serverless functions
- Using Neon's serverless PostgreSQL with connection pooling
- All database operations use the Drizzle ORM for type safety

## Benefits of Serverless Architecture

- **Scalability**: Automatic scaling based on demand
- **Cost Efficiency**: Pay only for actual usage
- **Global Distribution**: Functions deployed globally for low latency
- **Zero Maintenance**: No server management required
- **High Availability**: Built-in redundancy and failover

## Testing the Deployment

After deployment, test these key flows:

1. **Authentication**: Sign in with Google and verify JWT token storage
2. **API Endpoints**: Test dashboard stats, job scraping, email generation
3. **Gmail Integration**: Test Gmail OAuth flow and email sending
4. **Database Operations**: Verify all CRUD operations work correctly

## Troubleshooting

- **CORS Issues**: Check allowed origins in `api/_lib/cors.ts`
- **JWT Errors**: Verify JWT_SECRET is set correctly
- **Database Errors**: Check DATABASE_URL and connection pooling
- **OAuth Issues**: Verify redirect URLs in Supabase and Google Console