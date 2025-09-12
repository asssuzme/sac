# Cashfree IP Whitelist Configuration Guide

## The Error
You're seeing: "IP address not allowed: [Dynamic IP]"

This means Cashfree is blocking requests from your Replit server's IP address.

## Current IP Address to Whitelist
**34.61.84.228**

## Solution Steps

1. **Login to Cashfree Dashboard**
   - Go to https://merchant.cashfree.com/merchant/login
   - Use your Cashfree test account credentials

2. **Navigate to API Settings**
   - Click on "Developers" → "API Keys" section
   - Look for "Whitelisted IPs" or "IP Whitelist" section

3. **Add IP Address - Two Options:**
   
   **Option A: Add Specific IP (Current)**
   - Add this IP address: `34.61.84.228`
   - Click Save/Update
   
   **Option B: Allow All IPs for Test Mode (Recommended)**
   - Add: `0.0.0.0/0` (this allows all IPs)
   - This is safer for development as Replit IPs change
   - Click Save/Update

4. **Alternative: Disable IP Restriction**
   - In test mode, you can often disable IP restrictions entirely
   - Look for an option like "Allow all IPs" or "Disable IP whitelist"

## Important Notes
- The IP address might change when Replit restarts your workspace
- For production, you should use specific IP addresses for security
- For testing, allowing all IPs (0.0.0.0/0) is acceptable

## After Whitelisting
Once you've added the IP address or disabled IP restrictions in Cashfree:
1. Wait 2-3 minutes for changes to take effect
2. Try the payment flow again
3. The payment should redirect to Cashfree's checkout page

## Need Help?
If you can't find the IP whitelist settings, contact Cashfree support and ask them to:
- Whitelist IP: 35.232.160.115 for your test account
- Or disable IP restrictions for your test merchant ID