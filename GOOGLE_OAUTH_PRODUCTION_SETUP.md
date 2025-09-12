# Google OAuth Production Setup Guide

## Issue
When users try to authorize Gmail sending on gigfloww.com, they get an "invalid_credentials" error.

## Root Cause
The Google OAuth 2.0 application needs to have the production callback URL configured in Google Cloud Console.

## Required Google Cloud Console Configuration

1. **Go to Google Cloud Console** → APIs & Services → Credentials
2. **Find your OAuth 2.0 Client ID** (the one used for GOOGLE_CLIENT_ID)
3. **Edit the OAuth client**
4. **Add Authorized Redirect URIs**:
   - `https://gigfloww.com/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (for development)

## Current OAuth Callback URLs Required
- **Development**: `http://localhost:5000/api/auth/google/callback`
- **Production**: `https://gigfloww.com/api/auth/google/callback`

## Additional Requirements for Gmail Sending
1. **OAuth Consent Screen** must be configured with:
   - App name: "autoapply.ai" or "GigFloww"
   - Support email
   - Developer contact information
   
2. **Scopes** should include:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile` 
   - `../auth/gmail.send`

## Testing
After adding the redirect URI:
1. Users should be able to sign in with Google on gigfloww.com
2. Gmail authorization for sending emails should work without "invalid_credentials" error

## Alternative Solution
If OAuth setup is complex, consider using mailto: links as fallback for email sending.