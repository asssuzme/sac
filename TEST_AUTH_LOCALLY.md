# Test Authentication Fix Locally First

## Problem
Session persistence is failing on production. Need to test the OAuth flow locally first to ensure the fix works.

## Changes Made
1. **Dynamic callback URL**: Changed from hardcoded domain to relative path `/api/auth/google/callback`
2. **Added detailed logging**: Track session IDs through OAuth flow
3. **Disabled failureFlash**: Can cause session conflicts
4. **Enhanced session handling**: Better error tracking

## Local Test Steps

### Step 1: Test Development OAuth
```bash
# Start with dev login to verify sessions work
curl -s "http://localhost:5000/api/auth/dev-login" -L -c dev_cookies.txt

# Check if session persists
curl -s "http://localhost:5000/api/auth/user" -b dev_cookies.txt
```
Expected: User data returned

### Step 2: Test Real Google OAuth Locally
1. Go to: http://localhost:5000
2. Click "Sign in with Google"
3. Complete Google OAuth
4. Check if you stay logged in

### Step 3: Check Session Logs
Watch server logs for:
- "OAuth initiation from host: localhost:5000"
- "OAuth callback received from: localhost:5000"
- "Session ID before auth: [session-id]"
- "Setting session userId: [user-id]"
- "Session saved successfully"

## If Local Works

### Step 4: Test Production
Only after local OAuth works, test on production:
1. Go to: https://gigfloww.com
2. Sign in with Google
3. Check logs for same session flow

## Expected Logs for Success
```
OAuth initiation from host: gigfloww.com
OAuth callback received from: gigfloww.com
Session ID before auth: abc123
Google OAuth callback with profile: 123456789 user@email.com
Setting session userId: 123456789
Session saved successfully
Regular OAuth login completed
```

## If Still Failing
The issue might be:
1. **Google Cloud Console**: Wrong authorized domains
2. **Session store**: Need persistent session storage for production
3. **Environment variables**: Missing or incorrect OAuth credentials