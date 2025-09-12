# Push Project to GitHub - Step by Step Guide

## Prerequisites
1. Create a new repository on GitHub (https://github.com/new)
   - Name: `autoapply-ai` (or your preferred name)
   - Description: "AI-powered job application automation platform"
   - Keep it Public or Private as per your preference
   - DO NOT initialize with README, .gitignore, or license

## Steps to Push

### 1. Open Terminal in Replit
Click the Shell tab in your Replit workspace

### 2. Configure Git (if not already done)
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### 3. Initialize Git Repository
```bash
# Remove any lock files if present
rm -f .git/index.lock

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI-powered job application platform"
```

### 4. Connect to GitHub Repository
Replace `YOUR_GITHUB_USERNAME` and `REPO_NAME` with your actual values:

```bash
# Add remote origin
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 5. Enter GitHub Credentials
When prompted:
- Username: Your GitHub username
- Password: Your GitHub Personal Access Token (NOT your password!)

## Creating a Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Give it a name like "Replit Push"
4. Select scopes: `repo` (full control)
5. Generate and copy the token
6. Use this token as your password when pushing

## Important Files Excluded
The .gitignore file excludes:
- Environment variables (.env)
- Node modules
- Temporary files
- Session/cookie files
- Attached assets
- Replit-specific files

## After Pushing
Your repository will contain:
- Full source code (client & server)
- Configuration files
- Documentation
- Database schema
- All feature implementations

## Repository Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── api/             # API route handlers
├── *.md files       # Documentation
├── package.json     # Dependencies
└── configuration files
```