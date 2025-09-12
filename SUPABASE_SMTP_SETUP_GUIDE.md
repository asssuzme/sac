# Supabase SMTP Configuration Guide

To enable email sending in your application using Supabase only, you need to configure SMTP settings in your Supabase project.

## Step-by-Step Setup

### 1. Access Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to **Settings** → **Auth** → **SMTP Settings**

### 2. Configure SMTP Provider

You have several options for SMTP providers:

#### Option A: Use Resend (Recommended by Supabase)
1. Sign up for a free account at [https://resend.com](https://resend.com)
2. Verify your domain
3. Get your API key
4. In Supabase SMTP settings, configure:
   - **Host**: smtp.resend.com
   - **Port**: 465
   - **Username**: resend
   - **Password**: Your Resend API key
   - **Sender email**: Your verified domain email

#### Option B: Use Gmail SMTP (For Testing)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. In Supabase SMTP settings:
   - **Host**: smtp.gmail.com
   - **Port**: 587
   - **Username**: Your Gmail address
   - **Password**: Your App Password
   - **Sender email**: Your Gmail address

#### Option C: Use other SMTP providers
- SendGrid SMTP
- Mailgun SMTP
- Amazon SES
- Any other SMTP service

### 3. Save Configuration
- Click **Save** in the SMTP settings
- Test the configuration by sending a test email

### 4. Update Application Code
Once SMTP is configured, the application will automatically use Supabase's email service to send emails.

## Important Notes
- SMTP configuration is required for custom email sending in Supabase
- Without SMTP configuration, only authentication emails can be sent
- Make sure to verify your sender domain for better deliverability
- Check your SMTP provider's sending limits

## Troubleshooting
- If emails are not sending, check the Supabase logs
- Ensure your sender email is verified with your SMTP provider
- Check that your SMTP credentials are correct
- Verify that your Supabase project is not in free tier limitations