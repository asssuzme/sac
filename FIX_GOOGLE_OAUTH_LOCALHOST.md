# Fix Google OAuth for Localhost Development

## Quick Fix Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Select your project

2. **Navigate to OAuth Settings**
   - Go to **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID (should be named something like "Web client")

3. **Add Localhost Redirect URI**
   - In the **Authorized redirect URIs** section, click **+ ADD URI**
   - Add this exact URL:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
   - **Important**: Make sure it's `http` (not `https`) and port `5000`

4. **Save Changes**
   - Scroll down and click **SAVE**
   - Wait a few seconds for changes to propagate

5. **Try Again**
   - Go back to http://localhost:5000
   - Click "Sign in with Google"
   - It should work now!

## Common Issues:
- Make sure you're using `http://` not `https://` for localhost
- The URL must match EXACTLY - no trailing slashes
- Changes may take 30 seconds to 5 minutes to take effect

## Already Added URIs You Should Keep:
- Your Replit development URLs
- Your production URLs
- Just ADD the localhost one, don't remove others