#!/bin/bash

echo "🚀 Pushing your project to GitHub..."
echo ""

# Check current status
echo "📋 Checking git status..."
git status

# Add all files
echo ""
echo "📦 Adding all files..."
git add -A

# Commit
echo ""
echo "💾 Creating commit..."
git commit -m "Complete job application platform with all features" || echo "Already committed"

# Push
echo ""
echo "🔄 Pushing to GitHub..."
echo "When prompted:"
echo "Username: asssuzme"
echo "Password: Your GitHub token (github_pat_...)"
echo ""

git push -u origin main --force

echo ""
echo "✅ Done! Check your repository at:"
echo "https://github.com/asssuzme/job-hunter"