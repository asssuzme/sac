# Quick Test for Development Login

## The dev login is ready! Here's how to use it:

1. **Clear your browser cache** (important!):
   - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or open Chrome DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

2. **Try signing in again**:
   - Go to http://localhost:5000
   - Click "Sign in with Google" or "Start Free with Google"
   - You should be logged in instantly without seeing Google's page

## If it still shows Google error:

Try this direct link: http://localhost:5000/api/auth/dev-login

This will log you in immediately as a test user.

## What this does:
- Creates a test user (test@example.com)
- Logs you in automatically
- Lets you test all features without Google OAuth

## Note:
This is ONLY for development. In production, you'll need to fix the Google OAuth by adding the redirect URI to Google Console.