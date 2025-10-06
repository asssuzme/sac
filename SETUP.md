# Setup Guide - AI JobHunter

This guide provides detailed instructions for setting up the AI JobHunter platform on any environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [API Keys Setup](#api-keys-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **PostgreSQL** database (local or cloud-based like Neon, Supabase, etc.)
- **Git** for version control

### Verify Installation

```bash
node --version  # Should show v18.x or higher
npm --version   # Should show 9.x or higher
```

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-jobhunter.git
cd ai-jobhunter
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages for both frontend and backend.

### 3. Copy Environment File

```bash
cp .env.example .env
```

---

## Database Configuration

### Option 1: Neon Database (Recommended - Serverless)

1. Sign up at [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string from the dashboard
4. Add to `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require
   ```

### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:
   ```bash
   createdb ai_jobhunter
   ```
3. Add to `.env` file:
   ```env
   DATABASE_URL=postgresql://localhost:5432/ai_jobhunter
   ```

### Option 3: Other Cloud Providers

- **Supabase**: Get connection string from Database → Settings → Connection String
- **Railway**: Copy PostgreSQL connection URL from your project
- **Render**: Use the internal database URL provided

### Run Database Migrations

After setting up your database, push the schema:

```bash
npm run db:push
```

If you encounter conflicts, force the push:

```bash
npm run db:push -- --force
```

---

## API Keys Setup

### 1. Google OAuth & Gmail API

**Required for user authentication and email sending**

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name it "AI JobHunter" and click "Create"

#### Step 2: Enable Required APIs

1. In your project, go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Google+ API** (for OAuth login)
   - **Gmail API** (for sending emails)

#### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:5000` (for development)
   - `https://your-production-domain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://your-production-domain.com/api/auth/google/callback`
6. Click "Create" and save your credentials

#### Step 4: Add to Environment

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

### 2. OpenAI API Key

**Required for AI-powered email generation**

1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to "API Keys" section
3. Click "Create new secret key"
4. Copy the key immediately (you won't see it again)
5. Add billing information and credits to your account

Add to `.env`:

```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**Note**: The application uses GPT-4 for email generation. Ensure you have sufficient credits.

---

### 3. Apify API Key

**Required for LinkedIn job and profile scraping**

1. Create an account at [Apify](https://apify.com/)
2. Go to "Settings" → "Integrations"
3. Click "Personal API tokens"
4. Create a new token named "AI JobHunter"
5. Copy the token

Add to `.env`:

```env
APIFY_API_KEY=apify_api_your_token_here
```

**Important**: Ensure you have sufficient Apify credits. The platform uses:
- **LinkedIn Job Scraper** actor for job listings
- **LinkedIn Profile Scraper** actor for contact discovery

---

### 4. Dodo Payments API Key (Optional - For Pro Plan)

**Required only if you want to enable Pro plan subscriptions**

1. Sign up at [Dodo Payments](https://dodopayments.com/)
2. Navigate to "Developer" → "API Keys"
3. Create a new API key
4. Copy both the API key and webhook secret

#### Configure Webhook

1. In Dodo Payments dashboard, go to "Webhooks"
2. Add webhook endpoint: `https://your-domain.com/api/payments/webhook/dodo`
3. Select events: `payment.success`, `subscription.created`
4. Save the webhook secret

Add to `.env`:

```env
DODO_API_KEY=dodo_your_api_key_here
DODO_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## Environment Variables

### Complete .env File Template

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Google OAuth (for authentication and Gmail API)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI (for email generation)
OPENAI_API_KEY=sk-your_openai_api_key

# Apify (for LinkedIn scraping)
APIFY_API_KEY=apify_api_your_token

# Dodo Payments (optional - for Pro plan)
DODO_API_KEY=dodo_your_api_key
DODO_WEBHOOK_SECRET=whsec_your_webhook_secret

# PostgreSQL Connection Details (auto-extracted from DATABASE_URL)
PGHOST=your_pg_host
PGPORT=5432
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGDATABASE=your_pg_database

# Application Settings
NODE_ENV=development
```

### Environment-Specific Configuration

#### Development
```env
NODE_ENV=development
```

#### Production
```env
NODE_ENV=production
```

---

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:5000/api`

### Production Mode

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run db:push` | Push database schema changes |
| `npm run type-check` | Run TypeScript type checking |

---

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:
1. Verify `DATABASE_URL` format is correct
2. Check database server is running
3. Ensure SSL mode is correct (add `?sslmode=require` for cloud databases)
4. Verify network/firewall settings

### Google OAuth Issues

**Problem**: OAuth redirect not working

**Solutions**:
1. Verify redirect URI matches exactly in Google Console
2. Check that Google+ API and Gmail API are enabled
3. Ensure client ID and secret are correct
4. Clear browser cookies and try again

### Job Scraping Fails

**Problem**: LinkedIn scraping returns no results

**Solutions**:
1. Verify Apify API key is valid
2. Check Apify account has sufficient credits
3. Ensure LinkedIn URL format is correct
4. Check Apify dashboard for actor run status

### Email Sending Issues

**Problem**: Emails not being sent

**Solutions**:
1. Verify Gmail API is enabled
2. Check user has granted Gmail permissions during OAuth
3. Ensure resume is uploaded (required for attachments)
4. Check Gmail API quota limits

### Payment Webhook Issues

**Problem**: Payments not activating Pro status

**Solutions**:
1. Verify webhook URL is publicly accessible (no localhost)
2. Check webhook secret matches in both Dodo dashboard and `.env`
3. View webhook logs in Dodo Payments dashboard
4. Ensure webhook signature verification is working

### Port Already in Use

**Problem**: Port 5000 is already in use

**Solutions**:
1. Kill the process using port 5000:
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```
2. Or change the port in `vite.config.ts`

---

## Next Steps

After successful setup:

1. **Test the application**: Create a test account and run a job search
2. **Configure webhooks**: Set up Dodo Payments webhooks for production
3. **Set up monitoring**: Consider adding error tracking (Sentry, LogRocket, etc.)
4. **Review security**: Ensure all API keys are in `.env` and not committed to git
5. **Deploy**: Follow deployment guides for your hosting platform

---

## Getting Help

- **Documentation**: See [README.md](README.md) for feature overview
- **API Reference**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- **Issues**: Create an issue on GitHub for bugs or feature requests

---

**Ready to hunt jobs with AI?** 🎯
