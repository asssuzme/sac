=# AI-JobHunter.com API Documentation

## Base URL
- Production: `https://ai-jobhunter.com/api`
- Development: `http://localhost:5000/api`

## Authentication
Most endpoints require authentication via session cookies. Users must be logged in through Google OAuth.

---

## Health & Monitoring Endpoints

### GET /api/health
Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T19:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 12345.67
}
```

### GET /api/health/detailed
Detailed health check with all service statuses.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-10T19:00:00.000Z",
  "checks": {
    "api": true,
    "database": true,
    "session": true,
    "externalApis": {
      "openai": true,
      "apify": true,
      "cashfree": true
    }
  },
  "version": "1.0.0",
  "environment": "production",
  "uptime": 12345.67
}
```

### GET /api/ready
Readiness probe for load balancers.

**Response:** `200 OK` with body "Ready" or `503 Service Unavailable`

### GET /api/alive
Liveness probe for container orchestration.

**Response:** `200 OK` with body "Alive"

---

## Authentication Endpoints

### GET /api/auth/google
Initiates Google OAuth login flow.

**Redirects to:** Google OAuth consent screen

### GET /api/auth/google/callback
OAuth callback endpoint (handled automatically).

### GET /api/auth/gmail
Initiates Gmail authorization for email sending.

**Redirects to:** Google OAuth with Gmail scope

### GET /api/auth/gmail/callback
Gmail OAuth callback endpoint (handled automatically).

### GET /api/auth/logout
Logs out the current user.

**Response:** Redirects to homepage

### GET /api/auth/user
Returns current authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://...",
  "subscription": "pro",
  "gmailAuthorized": true
}
```

---

## Job Scraping Endpoints

### POST /api/job-scraping/scrape
Initiates a job scraping request from LinkedIn.

**Authentication:** Required

**Request Body:**
```json
{
  "linkedinUrl": "https://www.linkedin.com/jobs/search/...",
  "location": "San Francisco, CA",
  "workType": "remote",
  "limit": 20,
  "experienceLevel": ["entry", "mid"],
  "datePosted": "week"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "req_abc123",
  "message": "Job scraping initiated"
}
```

### GET /api/job-scraping/status/:requestId
Gets the status of a scraping request.

**Authentication:** Required

**Response:**
```json
{
  "requestId": "req_abc123",
  "status": "completed",
  "progress": 100,
  "totalJobs": 25,
  "processedJobs": 25,
  "results": [...]
}
```

### GET /api/job-scraping/history
Gets user's scraping history.

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "requests": [
    {
      "id": "req_abc123",
      "createdAt": "2025-01-10T19:00:00.000Z",
      "status": "completed",
      "jobCount": 25,
      "location": "San Francisco, CA"
    }
  ],
  "total": 50
}
```

---

## Application Management

### POST /api/applications/create
Records a job application.

**Authentication:** Required

**Request Body:**
```json
{
  "jobId": "job_123",
  "companyName": "TechCorp",
  "jobTitle": "Software Engineer",
  "location": "Remote",
  "appliedAt": "2025-01-10T19:00:00.000Z",
  "status": "applied"
}
```

### GET /api/applications
Gets user's application history.

**Authentication:** Required

**Response:**
```json
{
  "applications": [
    {
      "id": "app_123",
      "jobTitle": "Software Engineer",
      "companyName": "TechCorp",
      "status": "applied",
      "appliedAt": "2025-01-10T19:00:00.000Z"
    }
  ],
  "total": 100
}
```

### PUT /api/applications/:id
Updates an application status.

**Authentication:** Required

**Request Body:**
```json
{
  "status": "interview_scheduled",
  "notes": "Phone screen on Monday"
}
```

---

## Email Generation

### POST /api/email/generate
Generates a personalized application email using AI.

**Authentication:** Required

**Request Body:**
```json
{
  "jobTitle": "Software Engineer",
  "companyName": "TechCorp",
  "jobDescription": "...",
  "resumeText": "...",
  "tone": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "email": {
    "subject": "Application for Software Engineer Position",
    "body": "Dear Hiring Manager..."
  }
}
```

### POST /api/email/send
Sends an email via Gmail API.

**Authentication:** Required (Gmail authorized)

**Request Body:**
```json
{
  "to": "hr@techcorp.com",
  "subject": "Application for Software Engineer",
  "body": "Dear Hiring Manager...",
  "attachments": []
}
```

---

## Resume Management

### POST /api/resume/upload
Uploads and processes a resume.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `resume`: File (PDF or TXT)

**Response:**
```json
{
  "success": true,
  "resumeId": "resume_123",
  "extractedText": "...",
  "fileName": "john_doe_resume.pdf"
}
```

### GET /api/resume
Gets user's saved resume.

**Authentication:** Required

**Response:**
```json
{
  "resumeId": "resume_123",
  "fileName": "john_doe_resume.pdf",
  "uploadedAt": "2025-01-10T19:00:00.000Z",
  "extractedText": "..."
}
```

---

## Dashboard & Analytics

### GET /api/dashboard/stats
Gets dashboard statistics.

**Authentication:** Required

**Response:**
```json
{
  "totalJobsScraped": 1030,
  "totalApplications": 245,
  "responseRate": 12.5,
  "averageResponseTime": 3.2,
  "topCompanies": ["Google", "Microsoft", "Apple"],
  "applicationTrend": [...]
}
```

### GET /api/analytics/weekly
Gets weekly analytics data.

**Authentication:** Required

**Response:**
```json
{
  "week": "2025-W02",
  "applications": 15,
  "responses": 2,
  "interviews": 1,
  "byDay": [...]
}
```

---

## Payment & Subscription

### POST /api/payment/create-order
Creates a payment order for subscription.

**Authentication:** Required

**Request Body:**
```json
{
  "plan": "pro",
  "duration": "monthly"
}
```

**Response:**
```json
{
  "orderId": "order_abc123",
  "amount": 1999,
  "currency": "INR",
  "paymentUrl": "https://payments.cashfree.com/..."
}
```

### POST /api/payment/verify
Verifies a payment after completion.

**Authentication:** Required

**Request Body:**
```json
{
  "orderId": "order_abc123",
  "paymentId": "pay_xyz789"
}
```

### POST /api/payment/webhook
Webhook endpoint for payment gateway (Cashfree).

**Authentication:** Webhook signature verification

**Note:** This endpoint is called by Cashfree, not by clients.

### GET /api/subscription/status
Gets user's subscription status.

**Authentication:** Required

**Response:**
```json
{
  "plan": "pro",
  "status": "active",
  "expiresAt": "2025-02-10T19:00:00.000Z",
  "features": {
    "jobScrapingLimit": "unlimited",
    "emailGeneration": true,
    "analytics": true
  }
}
```

---

## Admin Endpoints

### GET /api/admin/users
Gets list of all users (admin only).

**Authentication:** Admin required

**Response:**
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "subscription": "pro",
      "joinedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 500
}
```

### GET /api/admin/metrics
Gets platform metrics (admin only).

**Authentication:** Admin required

**Response:**
```json
{
  "totalUsers": 500,
  "activeSubscriptions": 150,
  "revenue": {
    "daily": 50000,
    "monthly": 1500000
  },
  "apiUsage": {
    "openai": 85000,
    "apify": 12000
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Invalid request data",
  "details": {...}
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please log in to access this resource"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "The requested resource was not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 60 seconds",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

### 503 Service Unavailable
```json
{
  "error": "Service unavailable",
  "message": "The service is temporarily unavailable"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Default:** 100 requests per minute per IP
- **Job Scraping:** 10 requests per hour per user
- **Email Generation:** 50 requests per hour per user
- **Payment:** 20 requests per minute per user

---

## Webhooks

### Payment Webhook
The payment gateway sends webhooks to `/api/payment/webhook` for:
- Payment success
- Payment failure
- Refund initiated
- Subscription renewed

Webhook signatures are verified using HMAC-SHA256.

---

## Testing

### Test Credentials (Development Only)
```bash
# Test user account
Email: test@ai-jobhunter.com
Password: (OAuth only)

# Test API endpoints
curl -X GET https://ai-jobhunter.com/api/health
curl -X GET https://ai-jobhunter.com/api/health/detailed
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
// Authentication
const loginUrl = 'https://ai-jobhunter.com/api/auth/google';
window.location.href = loginUrl;

// API Request with fetch
const response = await fetch('https://ai-jobhunter.com/api/dashboard/stats', {
  credentials: 'include', // Include cookies
  headers: {
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Python
```python
import requests

# Create session for cookie persistence
session = requests.Session()

# API request
response = session.get('https://ai-jobhunter.com/api/dashboard/stats')
data = response.json()
```

---

**Version:** 1.0.0
**Last Updated:** January 2025