# Production OAuth URL Fix

## Issue Identified
The OAuth callback URL in Google Cloud Console is likely still set to a fixed URL instead of allowing dynamic callbacks.

## Current Setup Issue
When using relative callback URLs (`/api/auth/google/callback`), Google OAuth requires the authorized redirect URI to be configured correctly in Google Cloud Console.

## Fix Required in Google Cloud Console

### Step 1: Update Authorized Redirect URIs
Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Your OAuth Client

**Current (incorrect):** 
- https://gigfloww.com/api/auth/google/callback

**Should be (correct):**
- https://gigfloww.com/api/auth/google/callback
- http://localhost:5000/api/auth/google/callback

### Step 2: Ensure Both Domains Are Authorized
**Authorized JavaScript origins:**
- https://gigfloww.com
- http://localhost:5000

**Authorized redirect URIs:**
- https://gigfloww.com/api/auth/google/callback
- http://localhost:5000/api/auth/google/callback

## Why This Fixes It
1. **Dynamic callbacks work**: Passport.js can handle relative URLs when domain is authorized
2. **Both environments work**: Development and production use same OAuth app
3. **Session persistence**: Removes hardcoded domain conflicts

## Test After Update
1. Wait 5-10 minutes for Google to propagate changes
2. Test OAuth flow: https://gigfloww.com → Sign in with Google
3. Should redirect properly and maintain session

## Alternative Fix (If Console Access Limited)
Revert to hardcoded callback URL but fix session persistence:
```typescript
callbackURL: req.get('host')?.includes('gigfloww.com') 
  ? 'https://gigfloww.com/api/auth/google/callback'
  : 'http://localhost:5000/api/auth/google/callback'
```