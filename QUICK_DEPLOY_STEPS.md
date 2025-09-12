# Quick Deploy Steps for Vercel

## 1. Install Vercel CLI
Open a terminal and run:
```bash
npm install -g vercel
```

## 2. Deploy Your App
In your project folder, run:
```bash
vercel
```

It will ask you a few questions:
- Set up and deploy? → Yes
- Which scope? → Select your account
- Link to existing project? → No (create new)
- Project name? → Press Enter (use default)
- Directory? → Press Enter (current directory)
- Override settings? → No

## 3. Add Environment Variables
After deployment, go to: https://vercel.com/dashboard

1. Click on your new project
2. Go to "Settings" tab
3. Click "Environment Variables" on the left
4. Add these variables one by one:

- `DATABASE_URL` → (copy from your current .env file)
- `JWT_SECRET` → (the one you just provided)
- `SENDGRID_API_KEY` → (copy from your current .env file)
- `OPENAI_API_KEY` → (if you have one for AI emails)
- `GOOGLE_CLIENT_ID` → (for Google login)
- `GOOGLE_CLIENT_SECRET` → (for Google login)
- `VITE_SUPABASE_URL` → (copy from your current .env file)
- `VITE_SUPABASE_ANON_KEY` → (copy from your current .env file)

## 4. Redeploy
After adding all variables, click "Redeploy" to apply them.

## 5. Update Supabase
Go to your Supabase dashboard:
1. Add your new Vercel URL to allowed redirect URLs
2. The URL will be something like: `https://your-app-name.vercel.app/auth/callback`

## That's it!
Your app will be live at: `https://your-app-name.vercel.app`