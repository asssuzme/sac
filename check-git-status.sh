#!/bin/bash

echo "=== Checking Git Repository Status ==="
echo ""

echo "1. Current branch:"
git branch -a
echo ""

echo "2. Git status:"
git status
echo ""

echo "3. Git log (last 5 commits):"
git log --oneline -5
echo ""

echo "4. Remote repositories:"
git remote -v
echo ""

echo "5. Files in current directory:"
ls -la | head -20
echo ""

echo "6. Check if .git exists:"
ls -la .git/
echo ""

echo "7. Try listing all branches:"
git branch -r
echo ""

echo "=== End of diagnostics ==="