# Step-by-Step Guide to Fix Google OAuth

## The Problem
Google is blocking the login because this URL is not in your OAuth app's settings:
```
https://c05d4b50-6255-406b-853e-f8eff1ef387c-00-2171d433m1jzt.picard.replit.dev/api/auth/google/simple/callback
```

## Quick Fix Steps:

### 1. Open Google Cloud Console
Go to: https://console.cloud.google.com/apis/credentials

### 2. Find Your OAuth Client
Look for the OAuth 2.0 Client ID that starts with:
`7722196239-b284cth5bu24rm0g8kfkgpbe9q340jll...`

### 3. Click to Edit
Click on that OAuth client to open the edit page

### 4. Add the Redirect URI
- Scroll down to "Authorized redirect URIs"
- Click the "ADD URI" button
- Copy and paste this EXACT URL:
```
https://c05d4b50-6255-406b-853e-f8eff1ef387c-00-2171d433m1jzt.picard.replit.dev/api/auth/google/simple/callback
```

### 5. Save Changes
- Click the blue "SAVE" button at the bottom
- Wait 2-3 minutes for Google to update

### 6. Test Again
Come back here and click "Sign in with Google" again

## Important:
- The URL must be EXACTLY as shown above (with `/simple/callback` at the end)
- Make sure there are no extra spaces when you paste it
- It can take up to 5 minutes for Google to recognize the new URL