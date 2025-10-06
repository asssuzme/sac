# Contributing to AI JobHunter

Thank you for considering contributing to AI JobHunter! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Project Structure](#project-structure)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Submitting Changes](#submitting-changes)
8. [Reporting Bugs](#reporting-bugs)
9. [Feature Requests](#feature-requests)

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Prioritize the community and project health

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Any conduct harmful to the community

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Development Environment Setup**
   - Node.js 18+ installed
   - PostgreSQL database (local or cloud)
   - All required API keys (see [SETUP.md](SETUP.md))

2. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/ai-jobhunter.git
   cd ai-jobhunter
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Fill in your API keys and database URL
   ```

5. **Run Database Migrations**
   ```bash
   npm run db:push
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Build process or tooling changes

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run type checking
npm run type-check

# Test the application manually
npm run dev
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or tooling changes

**Examples:**
```bash
git commit -m "feat(scraper): add support for remote job filtering"
git commit -m "fix(auth): resolve OAuth redirect issue"
git commit -m "docs(readme): update setup instructions"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template
5. Submit for review

---

## Project Structure

```
ai-jobhunter/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── main.tsx       # Application entry point
│   └── index.html
├── server/                 # Backend Express application
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   ├── db.ts             # Database connection
│   └── index.ts          # Server entry point
├── shared/                # Shared code between client and server
│   └── schema.ts         # Database schema (Drizzle ORM)
├── public/               # Static assets
├── .env.example          # Environment variables template
└── package.json          # Dependencies and scripts
```

### Key Directories

- **`client/src/components/`** - Reusable UI components (buttons, cards, forms)
- **`client/src/pages/`** - Full page components (dashboard, settings, etc.)
- **`server/routes/`** - API endpoint definitions
- **`server/services/`** - Business logic (scraping, email, payments)
- **`shared/schema.ts`** - Database schema definitions

---

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- Define proper types and interfaces
- Avoid `any` type - use `unknown` if type is truly unknown
- Export types for reusability

```typescript
// Good
interface JobData {
  title: string;
  company: string;
  location: string;
}

// Bad
const jobData: any = { ... };
```

### React Components

- **Use functional components** with hooks
- **Use TypeScript** for props
- **Extract reusable logic** into custom hooks
- **Keep components small** and focused

```typescript
// Good
interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  // Component logic
}
```

### File Naming

- **Components**: PascalCase - `JobCard.tsx`
- **Utilities**: camelCase - `formatDate.ts`
- **Hooks**: camelCase with 'use' prefix - `useJobSearch.ts`
- **Pages**: kebab-case - `job-search.tsx`

### Code Style

- Use **Prettier** for formatting (runs automatically)
- Use **2 spaces** for indentation
- Use **semicolons**
- Use **single quotes** for strings (except JSX)
- Use **trailing commas** in objects and arrays

### Import Order

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal components
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/job-card';

// 3. Utilities and types
import { formatDate } from '@/lib/utils';
import type { Job } from '@/types';

// 4. Styles
import './styles.css';
```

### Database Schema

- Use **Drizzle ORM** for all database operations
- Define schemas in `shared/schema.ts`
- Use proper relations and foreign keys
- Never write raw SQL migrations - use `npm run db:push`

```typescript
// Good - Drizzle schema
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## Testing Guidelines

### Manual Testing

Before submitting a PR:

1. **Test the feature** thoroughly in development
2. **Test edge cases** and error scenarios
3. **Test on different screen sizes** (responsive design)
4. **Check browser console** for errors
5. **Verify database changes** work correctly

### Areas to Test

- **Authentication Flow**: Login, logout, OAuth redirects
- **Job Scraping**: LinkedIn URL validation, scraping results
- **Email Generation**: AI-generated content quality
- **Payment Flow**: Checkout, webhooks, subscription status
- **UI/UX**: Responsive design, loading states, error messages

### Error Handling

- Always handle errors gracefully
- Show user-friendly error messages
- Log errors for debugging
- Use try-catch blocks for async operations

```typescript
// Good
try {
  const result = await scrapeJobs(url);
  return result;
} catch (error) {
  console.error('Job scraping failed:', error);
  throw new Error('Failed to scrape jobs. Please try again.');
}
```

---

## Submitting Changes

### Pull Request Process

1. **Ensure your code works** and passes type checking
2. **Update documentation** if needed
3. **Write clear PR description** explaining changes
4. **Link related issues** if applicable
5. **Request review** from maintainers
6. **Address review feedback** promptly

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Works on mobile and desktop
```

### Review Process

- PRs require at least one approval
- Address all review comments
- Maintainers may request changes
- Be patient and respectful during review

---

## Reporting Bugs

### Before Reporting

1. **Check existing issues** to avoid duplicates
2. **Try the latest version** to see if it's fixed
3. **Gather information** about the bug

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what the bug is

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

---

## Feature Requests

We welcome feature requests! Please:

1. **Search existing requests** to avoid duplicates
2. **Provide clear use case** for the feature
3. **Explain the benefits** to users
4. **Consider implementation** complexity

### Feature Request Template

```markdown
**Is your feature related to a problem?**
Clear description of the problem

**Describe the solution**
What you'd like to happen

**Describe alternatives**
Alternative solutions you've considered

**Additional context**
Mockups, examples, or references
```

---

## Development Tips

### Useful Commands

```bash
# Type checking
npm run type-check

# Database schema push
npm run db:push

# Database schema push (force)
npm run db:push -- --force

# Development server
npm run dev

# Build for production
npm run build
```

### Common Issues

**Port already in use:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Database migration issues:**
```bash
npm run db:push -- --force
```

**Clear node_modules:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Working with APIs

- **Test with Postman** or similar tools
- **Check API rate limits** (Apify, OpenAI, etc.)
- **Use environment variables** for API keys
- **Handle rate limiting** gracefully

### UI Development

- **Use existing components** from `client/src/components/ui/`
- **Follow design system** (Tailwind + Shadcn/ui)
- **Test dark mode** alongside light mode
- **Ensure responsive design** works on all screen sizes

---

## Questions?

- **Documentation**: Check [README.md](README.md) and [SETUP.md](SETUP.md)
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to AI JobHunter! 🎯
