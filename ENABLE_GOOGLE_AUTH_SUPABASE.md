# Enable Google Authentication in Supabase

To fix the "Unsupported provider: provider is not enabled" error, you need to enable Google authentication in your Supabase project:

## Steps to Enable Google Provider:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - In the left sidebar, click on "Authentication"
   - Click on "Providers"

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Toggle the switch to enable it
   - You'll see configuration fields appear

4. **Configure Google OAuth**
   - You'll need to provide:
     - **Client ID**: Your Google OAuth Client ID
     - **Client Secret**: Your Google OAuth Client Secret

5. **Get Google OAuth Credentials** (if you don't have them already)
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add Authorized redirect URIs:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - You can find your project ref in your Supabase dashboard URL
   - Copy the Client ID and Client Secret

6. **Save Configuration**
   - Enter the Client ID and Client Secret in Supabase
   - Click "Save"

7. **Update Authorized Redirect URIs in Google Console**
   - After saving in Supabase, you'll see the exact callback URL
   - Add this URL to your Google OAuth app's authorized redirect URIs

8. **IMPORTANT: Configure Site URL in Supabase**
   - In Supabase Dashboard, go to "Authentication" → "URL Configuration"
   - Update the following settings:
     - **Site URL**: `http://localhost:5000` (for development)
     - **Redirect URLs** (add all of these):
       - `http://localhost:5000/auth/callback`
       - `https://service-genie-ashutoshlathrep.replit.app/auth/callback`
       - `https://*.replit.dev/auth/callback` (for Replit dev URLs)
   - Click "Save"

## Important Notes:

- The callback URL format is: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- **Critical**: The Site URL must be `http://localhost:5000` for local development (not 3000!)
- Make sure to save both the Supabase settings and update Google OAuth settings
- It may take a few minutes for the changes to propagate

Once you've enabled Google authentication in Supabase and configured the correct URLs, the "Continue with Google" button should work properly.