# Fix GitHub Access Error

## The Problem
Your token doesn't have write permissions to the repository.

## Solution - Create New Token with Full Permissions

1. **Go to GitHub Token Settings**
   https://github.com/settings/tokens/new

2. **Create Token with These Settings:**
   - **Note:** Replit Push Full Access
   - **Expiration:** 30 days
   - **Select ALL these scopes:**
     ✓ **repo** (check ALL boxes under it)
       - ✓ repo:status
       - ✓ repo_deployment
       - ✓ public_repo
       - ✓ repo:invite
       - ✓ security_events
     ✓ **workflow**
     ✓ **write:packages**
     ✓ **admin:repo_hook**

3. **Click "Generate token"**

4. **Copy the new token** (starts with `ghp_`)

5. **Push with new token:**
   ```bash
   git push https://asssuzme:YOUR_NEW_TOKEN@github.com/asssuzme/job-hunter.git main --force
   ```

## Alternative: Check Repository Settings

If token has correct permissions, check:
1. Go to: https://github.com/asssuzme/job-hunter/settings
2. Check if repository is archived or has branch protection
3. Make sure you're the owner of the repository