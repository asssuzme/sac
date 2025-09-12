# Google OAuth Setup Instructions

## Add Your Replit Development URL

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. In the **Authorized redirect URIs** section, click **ADD URI**
6. Add this exact URL:
   ```
   http://ec0548d50-b255-40da-853e-10aff1ef387c-00-2f71d433m1jzj.picard.replit.dev/api/auth/google/callback
   ```
7. Also add your production URL (when you deploy):
   ```
   https://service-gentle-ashutoshlathwal.replit.app/api/auth/google/callback
   ```
8. Click **SAVE** at the bottom

## Important Notes

- The redirect URI must match EXACTLY (including http/https)
- Your development URL changes each time you open Replit in a new session
- After deployment, update the production URL in Google Console

## After Adding the URLs

Once you've added the redirect URIs and saved:
1. Try signing in again with Google
2. You should be redirected back to your app successfully