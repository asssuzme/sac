#!/bin/bash

echo "=== COMPLETE GIT FIX ==="
echo ""

# Step 1: Check if we have any commits
echo "Step 1: Checking commits..."
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
echo "Found $COMMIT_COUNT commits"
echo ""

# Step 2: If no commits, create them
if [ "$COMMIT_COUNT" = "0" ]; then
    echo "No commits found. Creating initial commit..."
    git add -A
    git commit -m "Initial commit: Complete job application platform"
fi

# Step 3: Check tracked files
echo "Step 2: Files being tracked:"
git ls-files | wc -l
echo ""

# Step 4: Show what will be pushed
echo "Step 3: What will be pushed:"
git diff --stat origin/main 2>/dev/null || echo "Branch comparison not available"
echo ""

# Step 5: Create fresh main branch
echo "Step 4: Creating fresh main branch..."
git branch -D main 2>/dev/null || true
git checkout -b main
echo ""

# Step 6: Force add everything
echo "Step 5: Force adding all files..."
git rm -r --cached . 2>/dev/null || true
git add -A
git commit -m "Complete job application platform - all features" || true
echo ""

# Step 7: Push with full output
echo "Step 6: Pushing to GitHub (verbose mode)..."
export GIT_TRACE=1
export GIT_CURL_VERBOSE=1

git push https://asssuzme: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@github.com/asssuzme/job-hunter.git main --force -v 2>&1

unset GIT_TRACE
unset GIT_CURL_VERBOSE

echo ""
echo "=== DONE ==="
echo "Check: https://github.com/asssuzme/job-hunter"