# Gmail API Setup Guide

## Error: Gmail API Not Enabled

You're seeing this error because the Gmail API hasn't been enabled in your Google Cloud Project yet.

## Steps to Fix:

1. **Open Google Cloud Console**
   - Click this link: https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=7722196239
   - Or go to Google Cloud Console and navigate to your project

2. **Enable Gmail API**
   - Click the "ENABLE" button on the Gmail API page
   - Wait 2-3 minutes for the changes to take effect

3. **Verify API is Enabled**
   - The page should show "API Enabled" with a green checkmark
   - You should see usage statistics and quota information

4. **Test Again**
   - Go back to your LinkedIn Job Scraper app
   - Try sending an email again
   - It should work now!

## Important Notes:

- The Gmail API is required for sending emails on behalf of users
- This is a one-time setup per Google Cloud project
- No code changes are needed - just enable the API
- Your OAuth credentials already have the correct scopes

## Already Enabled?

If the API shows as already enabled but you're still getting errors:
1. Wait 5 minutes for propagation
2. Sign out and sign back in to refresh your authentication
3. Check that you're using the correct Google Cloud project