# Detailed Google OAuth Fix Guide

## Step 1: Verify Your Google Cloud Console Settings

1. Go to: https://console.cloud.google.com
2. Make sure you're in the correct project (check the project name in the top bar)
3. Navigate to **APIs & Services** → **Credentials**

## Step 2: Find Your OAuth Client

Look for your OAuth 2.0 Client ID. It might be named:
- "Web client 1"
- "OAuth Web Client"
- Or a custom name you gave it

Click on it to edit.

## Step 3: Check Current Redirect URIs

In the **Authorized redirect URIs** section, you should see existing URIs.

## Step 4: Add Localhost URI

Click **+ ADD URI** and add EXACTLY:
```
http://localhost:5000/api/auth/google/callback
```

**Common Mistakes to Avoid:**
- ❌ Don't use `https://` - use `http://`
- ❌ Don't add a trailing slash
- ❌ Don't use port 3000 - use 5000
- ✅ Copy-paste exactly: `http://localhost:5000/api/auth/google/callback`

## Step 5: Save and Wait

1. Click **SAVE** at the bottom
2. Wait 1-2 minutes for changes to propagate
3. You might see a "Changes may take some time" message

## Step 6: Clear Browser Data (Important!)

Sometimes Google caches the old settings. Try:
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

OR

Open an incognito/private window and try from there.

## Step 7: Test Again

Go to http://localhost:5000 and try signing in again.

## Alternative: Check Your Client ID and Secret

Make sure your `.env` file has the correct:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

These should match what's in your Google Cloud Console.

## Still Not Working?

If it's still not working after 5 minutes:
1. Double-check the URI is exactly: `http://localhost:5000/api/auth/google/callback`
2. Make sure you clicked SAVE in Google Console
3. Try a different browser or incognito mode
4. Check if you have multiple OAuth clients and you're editing the right one