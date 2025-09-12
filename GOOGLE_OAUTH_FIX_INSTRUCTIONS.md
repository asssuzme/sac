# Google OAuth Verification Fix - Step by Step

## The Problem
Google is trying to verify your homepage at the domain you registered (e.g., autoapply.ai), but your app is hosted on Replit at a different URL.

## Immediate Solution - Update Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Navigate to: APIs & Services → OAuth consent screen

2. **Click "Edit App" on your OAuth consent screen**

3. **Update these URLs to your Replit URLs:**
   - **Application Homepage**: `https://[your-replit-username]-[your-repl-name].replit.app/homepage`
   - **Privacy Policy**: `https://[your-replit-username]-[your-repl-name].replit.app/privacy`
   
   For example, if your Replit URL is `https://johnsmith-autoapply.replit.app`, then:
   - Homepage: `https://johnsmith-autoapply.replit.app/homepage`
   - Privacy Policy: `https://johnsmith-autoapply.replit.app/privacy`

4. **Save changes and resubmit for verification**

## What This Fixes
- Google will now look for your homepage and privacy policy at your Replit URLs
- The pages I created are already live at those URLs
- The homepage has clear links to the privacy policy as required

## Alternative Solutions (if you own autoapply.ai domain)

### Option A: Domain Redirect
Set up a redirect from autoapply.ai to your Replit app

### Option B: Simple Landing Page
Create a basic HTML page at autoapply.ai with:
```html
<!DOCTYPE html>
<html>
<head>
    <title>AutoApply.ai - AI-Powered Job Applications</title>
</head>
<body>
    <h1>AutoApply.ai</h1>
    <p>Automate your job search with AI</p>
    <p><a href="https://[your-replit-url]/privacy">Privacy Policy</a></p>
    <p><a href="https://[your-replit-url]">Launch App</a></p>
</body>
</html>
```

## Quick Test
After updating Google Cloud Console, visit these URLs to confirm they work:
- Your homepage: Add `/homepage` to your Replit URL
- Your privacy policy: Add `/privacy` to your Replit URL

Both pages should load and the homepage should have visible privacy policy links.