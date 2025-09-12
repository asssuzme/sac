# Supabase Email Sending Solution

Since Supabase doesn't expose Gmail scopes in their OAuth configuration, we need to use Supabase's built-in email functionality.

## Options:

### 1. Supabase Edge Functions (Recommended)
- Create a Supabase Edge Function that sends emails using Resend API (Supabase's recommended email provider)
- Call the Edge Function from our backend

### 2. Supabase Auth Email Templates
- Limited to auth-related emails only
- Not suitable for custom application emails

### 3. Direct SMTP Configuration
- Configure SMTP settings in Supabase for custom email sending
- Use Supabase's email service

## Implementation Plan:

We'll use Supabase's integration with Resend for email sending. This requires:
1. Setting up a Resend account
2. Creating a Supabase Edge Function
3. Calling the Edge Function from our backend

This is the only way to send emails while staying within the Supabase ecosystem.