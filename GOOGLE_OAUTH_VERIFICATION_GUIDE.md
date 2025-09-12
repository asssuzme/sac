# Google OAuth Verification Guide

## Current Issue

Google OAuth verification is failing because they're looking for:
1. A homepage website registered to you
2. The homepage must include a link to your privacy policy

## The Problem

Google is expecting to find these pages at your registered domain (likely `autoapply.ai`), but your application is currently hosted on Replit at `autoapply-ai.replit.app`.

## Solutions

### Option 1: Update Google Cloud Console (Recommended for Development)

1. Go to Google Cloud Console → APIs & Services → OAuth consent screen
2. Update your application homepage URL to: `https://autoapply-ai.replit.app/homepage`
3. Update your privacy policy URL to: `https://autoapply-ai.replit.app/privacy`
4. Save changes and resubmit for verification

### Option 2: Set Up Domain Forwarding

If you own the `autoapply.ai` domain:

1. Set up domain forwarding from `autoapply.ai` to `autoapply-ai.replit.app`
2. Or create a simple landing page at `autoapply.ai` that includes:
   - Information about your service
   - A prominent link to the privacy policy
   - A link to launch the app at the Replit URL

### Option 3: Deploy to Custom Domain on Replit

1. Upgrade to Replit's paid plan to use custom domains
2. Connect your `autoapply.ai` domain to your Replit app
3. This way, Google will see your pages at the expected domain

## What I've Created for You

1. **Homepage** (`/homepage`): A professional landing page that:
   - Explains what AutoApply.ai does
   - Has clear links to the privacy policy in the navigation and footer
   - Includes company information and contact details

2. **Privacy Policy** (`/privacy`): A comprehensive privacy policy that covers:
   - Information collection practices
   - Gmail integration permissions
   - Data security measures
   - User rights and contact information

3. **Footer Component**: Appears on all pages with:
   - Links to privacy policy, terms of service, and other legal pages
   - Contact information (support@autoapply.ai, privacy@autoapply.ai)
   - Company location information

## Next Steps

1. Choose one of the solutions above based on your needs
2. Update your Google Cloud Console with the correct URLs
3. Resubmit for verification

The pages are now live at:
- Homepage: https://autoapply-ai.replit.app/homepage
- Privacy Policy: https://autoapply-ai.replit.app/privacy

These pages meet Google's requirements - they just need to be accessible from the domain you registered in Google Cloud Console.