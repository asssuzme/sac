# Fix GitHub Authentication - Fresh Token Method

## The Issue
Your push is failing with 403 error - authentication problem.

## Solution: Create New Token with Correct Permissions

1. **Delete Old Token**
   - Go to: https://github.com/settings/tokens
   - Find your old token and delete it

2. **Create New Token**
   - Go to: https://github.com/settings/tokens/new
   - Token name: `Replit Push`
   - Expiration: 30 days
   - Select scopes:
     ✓ **repo** (ALL checkboxes under repo)
     ✓ **workflow** (optional)
   - Click "Generate token"
   - **COPY THE NEW TOKEN IMMEDIATELY**

3. **Push with New Token**
   Run this in Shell:
   ```bash
   git push https://asssuzme:YOUR_NEW_TOKEN@github.com/asssuzme/job-hunter.git main --force
   ```
   Replace YOUR_NEW_TOKEN with the token you just copied.

## Alternative: Use SSH Instead
If tokens keep failing, set up SSH:
1. Generate SSH key in Replit
2. Add to GitHub
3. Change remote to SSH

Would you like me to guide you through SSH setup instead?