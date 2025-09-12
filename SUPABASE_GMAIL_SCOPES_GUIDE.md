# Adding Gmail Scopes to Supabase Google OAuth

To enable email sending through Gmail API in your application, you need to add Gmail scopes to your Supabase Google OAuth configuration.

## Steps to Add Gmail Scopes

1. **Log in to your Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab
   - Find "Google" in the list of providers

3. **Add Gmail Scopes**
   - In the Google provider settings, look for "Authorized Client IDs" or "Additional Scopes" field
   - Add the following scopes (space-separated):
     ```
     https://www.googleapis.com/auth/gmail.send
     https://www.googleapis.com/auth/gmail.compose
     https://www.googleapis.com/auth/gmail.modify
     ```

4. **Save Changes**
   - Click "Save" to update the configuration

## After Adding Scopes

1. **Sign Out and Sign In Again**
   - You must sign out of your current session
   - Sign in again with Google
   - Google will now ask for permission to access Gmail
   - Grant the permissions when prompted

2. **Verify Token Scopes**
   - The `provider_token` returned by Supabase will now include Gmail access
   - This token will be used to send emails on your behalf

## Troubleshooting

- If you still get "insufficient authentication scopes" error:
  - Clear your browser cookies and cache
  - Sign out completely and sign in again
  - Make sure you granted all Gmail permissions when prompted
  - Check that the scopes were saved correctly in Supabase

- If Google doesn't ask for Gmail permissions:
  - You may need to revoke access to your app in Google Account settings
  - Go to https://myaccount.google.com/permissions
  - Remove your app from the list
  - Then sign in again

## Important Notes

- These scopes allow your application to send emails on behalf of the authenticated user
- Users will see these permissions during the OAuth consent screen
- Make sure your Google Cloud Console project has Gmail API enabled