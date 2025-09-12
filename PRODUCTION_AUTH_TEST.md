# Production Authentication Test

## Current Issue
Users can't authorize Gmail on production because they're not staying logged in after Google OAuth.

## Root Cause
Session cookies are not persisting properly on gigfloww.com due to:
1. Cookie domain settings
2. Secure cookie requirements
3. SameSite policy issues

## Quick Fix Applied
Changed session cookie domain from `.gigfloww.com` to `gigfloww.com` to prevent subdomain cookie issues.

## How to Test

### Step 1: Check Current Authentication Status
Visit: https://gigfloww.com/api/auth/user
- Should return user data if logged in
- Returns "Unauthorized" if session is broken

### Step 2: Try Basic Google Login
1. Go to: https://gigfloww.com
2. Click "Sign in with Google"
3. Complete Google OAuth
4. Check if you stay logged in after redirect

### Step 3: Test Gmail Authorization
1. Ensure you're logged in from Step 2
2. Try to send an email (which triggers Gmail auth)
3. Should redirect to Google for Gmail permissions
4. Should redirect back successfully

## Expected Flow
1. User signs in with Google → Session created
2. User tries to send email → Gmail auth required
3. Gmail auth succeeds → Email sends successfully

## If Still Failing
The issue might be:
1. **Different Google project**: Check if production uses different OAuth credentials
2. **Verification status**: OAuth app might need to be published/verified
3. **API limits**: Check Google Cloud Console for API quota issues