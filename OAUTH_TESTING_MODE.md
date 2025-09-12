# How to Enable Testing Mode for Google OAuth

## Option 1: Add Test Users (Recommended for Development)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "OAuth consent screen"
3. Scroll down to "Test users" section
4. Click "ADD USERS"
5. Add your email: ashutoshlathvalo@gmail.com
6. Click "SAVE"

Now you'll be able to log in without the security warning.

## Option 2: Continue Anyway (Quick Fix)

On the Google warning screen:
1. Click "Advanced" (bottom left)
2. Click "Go to c05d4b50-6255-406b... (unsafe)"
3. Click "Continue" to grant permissions

## Why This Happens

- Google shows this warning for unverified apps
- It's normal during development
- For production, you'd need to submit your app for Google verification
- Adding test users bypasses this warning for specific emails

## Next Steps

After adding yourself as a test user or clicking through the warning:
1. You'll see the permissions request
2. Click "Allow" to grant access
3. You'll be redirected back to your app and logged in!