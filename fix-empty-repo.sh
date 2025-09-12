#!/bin/bash

echo "=== Fixing Empty Repository Issue ==="
echo ""

# Check current state
echo "1. Current git status:"
git status --short
echo ""

echo "2. Current branches:"
git branch -a
echo ""

# Create and switch to master branch (GitHub default)
echo "3. Creating master branch..."
git checkout -b master 2>/dev/null || git checkout master

# Add everything if needed
echo "4. Adding all files..."
git add -A
git commit -m "Complete job application platform" --allow-empty

# Set remote with token
echo "5. Setting remote with authentication..."
git remote set-url origin https://asssuzme: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@github.com/asssuzme/job-hunter.git

# Push to master (GitHub's default)
echo "6. Pushing to master branch..."
git push -u origin master --force

# Also try main branch
echo "7. Also pushing to main branch..."
git checkout -b main 2>/dev/null || git checkout main
git push -u origin main --force

# List what was pushed
echo ""
echo "8. Verifying push..."
git ls-remote origin

# Clean credentials
git remote set-url origin https://github.com/asssuzme/job-hunter.git

echo ""
echo "✅ Done! Check both branches on GitHub:"
echo "Master: https://github.com/asssuzme/job-hunter/tree/master"
echo "Main: https://github.com/asssuzme/job-hunter/tree/main"