# Supabase Setup Guide

## Finding Your Supabase URL and Keys

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/projects
   - Sign in if needed

2. **Select Your Project**
   - Click on the project you created

3. **Navigate to Settings**
   - Look at the left sidebar
   - Click on the "Settings" icon (gear icon) at the bottom
   - Then click on "API" under Configuration

4. **Copy Your Keys**
   You'll see a page with these sections:
   
   - **Project URL**: 
     - Look for "URL" section
     - It looks like: `https://xyzxyzxyz.supabase.co`
     - This is your VITE_SUPABASE_URL
   
   - **Anon/Public Key**:
     - Look for "anon" or "public" key
     - It's a long string starting with `eyJ...`
     - This is your VITE_SUPABASE_ANON_KEY

## Alternative Method

If you still can't find it:
1. From your project dashboard, look at the top navigation
2. You might see the project URL in the browser address bar
3. It will be: `https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]`
4. Your Supabase URL is: `https://[YOUR-PROJECT-ID].supabase.co`

## Setting Up Google OAuth in Supabase

After providing the keys, you'll need to:
1. Go to Authentication > Providers in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials there
4. Configure redirect URLs