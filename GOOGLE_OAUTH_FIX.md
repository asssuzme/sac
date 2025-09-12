# Google OAuth Configuration Instructions

## Your Current Credentials
- **Client ID**: 7722196239-b284cth5bu24rm0g8kfkgpbe9q340jll.apps.googleusercontent.com
- **Client Secret**: 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

## Required Redirect URI
You must add this EXACT URL to your Google OAuth app:
```
https://c05d4b50-6255-406b-853e-f8eff1ef387c-00-2171d433m1jzt.picard.replit.dev/api/auth/google/simple/callback
```

## Steps to Fix:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID (the one with ID: 7722196239-b284cth5bu24rm0g8kfkgpbe9q340jll...)
5. In the "Authorized redirect URIs" section, click "ADD URI"
6. Paste exactly: `https://c05d4b50-6255-406b-853e-f8eff1ef387c-00-2171d433m1jzt.picard.replit.dev/api/auth/google/simple/callback`
7. Click "SAVE" at the bottom

## Important Notes:
- The URI must match EXACTLY (including the `/simple` part)
- It may take a few minutes for changes to propagate
- Make sure you're editing the correct OAuth client (check the client ID matches)

## After Adding the URI:
1. Wait 2-3 minutes for Google to update
2. Try signing in again by clicking "Sign in with Google" on the landing page