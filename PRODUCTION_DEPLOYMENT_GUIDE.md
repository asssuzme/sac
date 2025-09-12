# Production Deployment Guide for AI-JobHunter.com

## 🚀 Quick Deployment Steps on Replit

### Step 1: Set Environment Variables
Go to the Secrets tab in Replit and add all required environment variables:

```bash
# Required API Keys
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=generate_strong_random_string_here
OPENAI_API_KEY=your_openai_api_key
APIFY_API_TOKEN=your_apify_token
APIFY_COMPANY_EMAIL_TOKEN=your_apify_email_token
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_PRODUCTION=true

# Database (automatically configured by Replit)
DATABASE_URL=postgresql://...
PGDATABASE=...
PGHOST=...
PGPASSWORD=...
PGPORT=...
PGUSER=...

# Optional
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@ai-jobhunter.com
```

### Step 2: Database Setup
Run the database migrations:
```bash
npm run db:push
```

### Step 3: Deploy to Production
1. Click the **Deploy** button in Replit
2. Select **Production** deployment
3. Configure your custom domain (ai-jobhunter.com)
4. Replit will handle SSL certificates automatically

### Step 4: Post-Deployment Verification
After deployment, verify these endpoints:
- [ ] Homepage loads: https://ai-jobhunter.com
- [ ] OAuth login works: https://ai-jobhunter.com/api/auth/google
- [ ] API health check: https://ai-jobhunter.com/api/health
- [ ] Payment gateway: Test a subscription flow

---

## 📋 Complete Production Setup

### 1. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   ```
   https://ai-jobhunter.com/api/auth/google/callback
   https://ai-jobhunter.com/api/auth/gmail/callback
   https://www.ai-jobhunter.com/api/auth/google/callback
   https://www.ai-jobhunter.com/api/auth/gmail/callback
   ```
6. Add authorized JavaScript origins:
   ```
   https://ai-jobhunter.com
   https://www.ai-jobhunter.com
   ```

### 2. Cashfree Payment Gateway

1. Log into [Cashfree Dashboard](https://merchant.cashfree.com)
2. Switch to Production mode
3. Get your production credentials:
   - App ID
   - Secret Key
4. Configure webhook URL:
   ```
   https://ai-jobhunter.com/api/payment/webhook
   ```
5. Whitelist IP addresses if required

### 3. Apify Configuration

1. Get your API tokens from [Apify Console](https://console.apify.com)
2. Ensure you have:
   - Main API token
   - Company email verification token
3. Check your API limits and usage

### 4. OpenAI API

1. Get your API key from [OpenAI Platform](https://platform.openai.com)
2. Set usage limits and monitoring
3. Configure rate limiting in production

### 5. Database Configuration

PostgreSQL is automatically configured on Replit. To manage:
1. Use the Database pane in Replit
2. Run migrations: `npm run db:push`
3. Set up regular backups (recommended)

### 6. Domain & SSL Setup

#### On Replit:
1. Go to Deployments → Production
2. Click "Connect domain"
3. Add `ai-jobhunter.com`
4. Update your DNS records:
   ```
   Type: CNAME
   Name: @
   Value: [provided by Replit]
   
   Type: CNAME
   Name: www
   Value: [provided by Replit]
   ```
5. SSL certificate will be automatically provisioned

### 7. Session Management

Sessions are stored in PostgreSQL for persistence:
- Session table is automatically created
- 30-day session duration
- Secure cookies enabled in production

---

## 🔒 Security Checklist

### API Security
- [x] All API keys in environment variables
- [x] Rate limiting implemented
- [x] CORS configured for production domain
- [x] Security headers added
- [x] Input validation on all endpoints
- [x] SQL injection protection (using Drizzle ORM)

### Authentication
- [x] Google OAuth properly configured
- [x] Session management secure
- [x] Protected routes require authentication
- [x] Admin routes have additional checks

### Data Protection
- [x] HTTPS enforced
- [x] Sensitive data encrypted
- [x] No API keys exposed to frontend
- [x] Secure cookie settings

---

## 📊 Monitoring & Maintenance

### Health Checks
Monitor these endpoints:
```
GET /api/health - Application health
GET /api/dashboard/stats - Database connectivity
```

### Logs
Access logs in Replit:
1. Go to the Console tab
2. Check application logs
3. Monitor for errors

### Performance
- Monitor API response times
- Check database query performance
- Track external API usage (Apify, OpenAI)

---

## 🚨 Troubleshooting

### Common Issues

#### OAuth Login Not Working
1. Check Google Cloud Console redirect URIs
2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Ensure cookies are enabled for the domain

#### Payment Gateway Issues
1. Verify Cashfree is in production mode
2. Check webhook URL is accessible
3. Verify IP whitelisting if enabled

#### Database Connection Errors
1. Check `DATABASE_URL` is set correctly
2. Run `npm run db:push` to sync schema
3. Check connection pool settings

#### Session Persistence Issues
1. Verify session table exists in database
2. Check `SESSION_SECRET` is set
3. Ensure cookies are configured correctly

---

## 📝 Deployment Commands

### Initial Deployment
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Build application
npm run build

# Start production server
npm run start
```

### Update Deployment
```bash
# Pull latest changes
git pull

# Install new dependencies
npm install

# Run migrations if schema changed
npm run db:push

# Restart application
npm run start
```

### Database Management
```bash
# Push schema changes
npm run db:push

# Generate migration files (if needed)
npm run db:generate

# Studio for database GUI
npm run db:studio
```

---

## 📧 Support Contacts

- **Technical Issues**: support@ai-jobhunter.com
- **Payment Issues**: payments@ai-jobhunter.com
- **Security Concerns**: security@ai-jobhunter.com

---

## 🎯 Final Verification

Before going live, ensure:
1. [ ] All environment variables are set
2. [ ] Database is migrated and seeded
3. [ ] OAuth login works
4. [ ] Payment flow completes successfully
5. [ ] Email sending works (if configured)
6. [ ] All pages load without errors
7. [ ] API endpoints return expected data
8. [ ] SSL certificate is valid
9. [ ] Domain redirects work (www → non-www)
10. [ ] Error pages display correctly

---

**Last Updated**: January 2025
**Platform**: Replit
**Domain**: ai-jobhunter.com