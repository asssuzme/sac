# Quick Solution - Development Login Bypass

I've added a temporary development login that bypasses Google OAuth. This will let you test the app immediately while you fix the Google settings.

## How to use:

1. Go to http://localhost:5000
2. Click "Sign in with Google" or "Get Started"
3. You'll be logged in automatically as a test user

## To fix Google OAuth permanently:

You MUST add this URL to your Google Cloud Console:
```
http://localhost:5000/api/auth/google/callback
```

### Step by step:
1. Go to https://console.cloud.google.com
2. Select your project from the dropdown at the top
3. Click the hamburger menu (☰) → APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID (usually named "Web client 1")
5. Scroll down to "Authorized redirect URIs"
6. Click "+ ADD URI"
7. Paste: `http://localhost:5000/api/auth/google/callback`
8. Click "SAVE" at the bottom
9. Wait 2 minutes, then Google OAuth will work

## Why this error happens:
Google requires you to explicitly whitelist every URL that can receive authentication callbacks. This is a security feature that prevents unauthorized apps from stealing your login.