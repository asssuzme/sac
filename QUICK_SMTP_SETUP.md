# Quick SMTP Setup in Supabase

Based on your screenshot, follow these steps:

## 1. Click "Set up custom SMTP server" button
The yellow button you see in the screenshot - click it to open SMTP configuration.

## 2. Choose an SMTP Provider

### Option A: Gmail (Easiest for testing)
1. Use your Gmail account
2. Enable 2-factor authentication on Gmail
3. Create an App Password at: https://myaccount.google.com/apppasswords
4. Fill in:
   - **Sender email**: your-email@gmail.com
   - **Sender name**: AutoApply AI
   - **Host**: smtp.gmail.com
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: Your Gmail App Password (16 characters)

### Option B: Resend (Free & Recommended)
1. Sign up at https://resend.com (free)
2. Add and verify your domain
3. Get API key from dashboard
4. Fill in:
   - **Sender email**: noreply@yourdomain.com
   - **Sender name**: AutoApply AI
   - **Host**: smtp.resend.com
   - **Port**: 465
   - **Username**: resend
   - **Password**: Your Resend API key

## 3. Save Configuration
Click "Save" after filling in the SMTP details.

## 4. Test
The app will now be able to send emails through Supabase!