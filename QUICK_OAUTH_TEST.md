# Quick OAuth Test for Production

## Changes Made
1. **Removed duplicate CORS configuration** - was causing conflicts
2. **Changed session sameSite from 'none' to 'lax'** - better browser compatibility
3. **Removed explicit cookie domain** - let browser handle it automatically
4. **Added custom session name** - `gigfloww_session` for easier debugging
5. **Enhanced logging** - better session tracking in OAuth callback

## How to Test on Production

### Step 1: Basic Session Test
```bash
curl -s "https://gigfloww.com/api/auth/user"
```
Expected: `{"message":"Unauthorized"}` (because not logged in)

### Step 2: Try OAuth Flow
1. Go to: https://gigfloww.com
2. Click "Sign in with Google"
3. Watch the network tab for:
   - Redirect to Google OAuth
   - Callback with session cookie
   - Should stay logged in after redirect

### Step 3: Check Session Persistence
After OAuth login:
```bash
curl -s "https://gigfloww.com/api/auth/user" -H "Cookie: gigfloww_session=<session_from_browser>"
```
Expected: User data JSON

### Step 4: Test Gmail Authorization
1. Make sure you're logged in from Step 2
2. Try to send an email (which triggers Gmail auth)
3. Should redirect to Google for Gmail permissions
4. Should redirect back successfully

## Key Changes for Session Persistence

1. **SameSite Policy**: Changed from 'none' to 'lax' 
   - 'none' requires HTTPS and can be blocked by browsers
   - 'lax' works better with redirect flows

2. **No Explicit Domain**: Removed `domain: 'gigfloww.com'`
   - Let browser automatically set based on request
   - Avoids subdomain conflicts

3. **Custom Session Name**: `gigfloww_session`
   - Easier to identify in browser dev tools
   - Avoids conflicts with default `connect.sid`

## If Still Failing
Check browser console for:
- Cookie being set after OAuth callback
- Session cookie included in subsequent requests
- CORS errors or cookie warnings