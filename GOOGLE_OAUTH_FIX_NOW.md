# URGENT: Fix Google OAuth Settings

## The Problem
Your Google OAuth is configured with OLD redirect URIs from a different Replit project. You need to update them NOW.

## Step-by-Step Fix

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Find Your OAuth 2.0 Client ID
Look for the OAuth client with ID: `7722196239-b284cth5bu24rm0g8kfkgpbe9q340jll`

### 3. Remove OLD Redirect URIs
Delete these if they exist:
- `https://akbn-ashutoshlreplit2.replit.app/api/oauth/google/callback`
- Any other old Replit domains
- Any `gigfloww.com` URLs

### 4. Add CURRENT Redirect URIs
Add these EXACT URLs (copy-paste them):

**For Development (Replit):**
```
https://d57ee13b-41d0-44ac-a4f2-0e0922e5d728-00-3le74twooe1gs.pike.replit.dev/api/auth/google/callback
https://d57ee13b-41d0-44ac-a4f2-0e0922e5d728-00-3le74twooe1gs.pike.replit.dev/api/auth/google/simple/callback
https://d57ee13b-41d0-44ac-a4f2-0e0922e5d728-00-3le74twooe1gs.pike.replit.dev/api/auth/gmail/callback
```

**For Production (when you deploy):**
```
https://ai-jobhunter.com/api/auth/google/callback
https://ai-jobhunter.com/api/auth/google/simple/callback
https://ai-jobhunter.com/api/auth/gmail/callback
```

### 5. Save Changes
Click "Save" at the bottom of the OAuth client settings

### 6. Test Login
After saving, wait 1-2 minutes for changes to propagate, then test the login again.

## Important Notes
- The redirect URIs must match EXACTLY (including https://, no trailing slashes)
- Google OAuth changes can take a few minutes to take effect
- Make sure you're editing the correct OAuth client (check the Client ID)

## Your Current Server Routes
Your server is configured to handle these OAuth routes:
- `/api/auth/google` - Main Google login
- `/api/auth/google/simple` - Simple Google login (used by your frontend)
- `/api/auth/gmail` - Gmail authorization

The frontend is using `/api/auth/google/simple` when you click "Sign in with Google".