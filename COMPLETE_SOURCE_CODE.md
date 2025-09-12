# LinkedIn Job Scraper - Complete Source Code

## Project Overview
A comprehensive LinkedIn job scraping service that processes LinkedIn job URLs through a three-step pipeline:
1) Scraping jobs using Apify's job scraper API
2) Filtering for quality leads with complete company information 
3) Enriching job data by scraping poster profiles to extract email addresses for contact purposes

## File Structure
```
├── server/
│   ├── index.ts - Express server setup
│   ├── routes.ts - API routes for job scraping
│   ├── storage.ts - Database storage interface
│   ├── db.ts - Database connection
│   └── vite.ts - Vite dev server integration
├── client/
│   ├── src/
│   │   ├── pages/home.tsx - Main UI page
│   │   ├── components/ - UI components
│   │   ├── lib/ - Utilities and query client
│   │   └── hooks/ - React hooks
│   └── index.html - HTML entry point
├── shared/
│   └── schema.ts - Database schema and types
└── Configuration files...
```

---

## SERVER CODE

### server/index.ts
```typescript
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import routes from "./routes";
import viteExpress from "./vite";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (user && user.password === password) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Use routes
app.use("/api", routes);

// Start the server with Vite in development
viteExpress.listen(app, 5000, () => {
  console.log("Server is listening on port 5000...");
});
```

### server/routes.ts
```typescript
import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage";
import type { JobScrapingRequest } from "@shared/schema";

const router = Router();

// Types for the job scraping process
type FilteredJobData = {
  title: string;
  company: {
    name: string;
    industry?: string;
    size?: string;
    founded?: string;
    logo?: string;
  };
  location: string;
  workType: string;
  postedDate: string;
  applicants?: number;
  description: string;
  skills: string[];
  originalUrl: string;
  companyWebsite?: string;
  companyLinkedinUrl?: string;
  jobPosterName?: string;
  jobPosterLinkedinUrl?: string;
  requirement?: string;
  salaryInfo?: string;
  canApply?: boolean;
  jobPosterEmail?: string;
};

// Validation schema for job scraping request
const jobScrapingRequestSchema = z.object({
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL")
    .refine(url => url.includes("linkedin.com/jobs/view"), {
      message: "Please enter a valid LinkedIn job URL"
    }),
});

function filterJobs(jobs: FilteredJobData[]): FilteredJobData[] {
  console.log(`Starting filtering process with ${jobs.length} jobs`);
  
  const companyMap = new Map<string, FilteredJobData>();
  
  jobs.forEach((job, index) => {
    console.log(`Processing job ${index + 1}: "${job.title}" at "${job.company.name}"`);
    
    // Check if job has required company information
    const hasCompanyName = job.company.name && job.company.name.trim() !== '' && job.company.name !== 'N/A';
    const hasCompanyWebsite = job.companyWebsite && job.companyWebsite.trim() !== '' && job.companyWebsite !== 'N/A';
    const hasCompanyLinkedin = job.companyLinkedinUrl && job.companyLinkedinUrl.trim() !== '' && job.companyLinkedinUrl !== 'N/A';
    
    if (hasCompanyName && hasCompanyWebsite && hasCompanyLinkedin) {
      console.log(`✓ Job "${job.title}" passes filtering criteria`);
      
      // Use company name as key for deduplication
      const companyKey = job.company.name.toLowerCase().trim();
      
      if (!companyMap.has(companyKey)) {
        companyMap.set(companyKey, job);
        console.log(`  → Added as first job for company: ${job.company.name}`);
      } else {
        console.log(`  → Skipped (duplicate company): ${job.company.name}`);
      }
    } else {
      console.log(`✗ Job "${job.title}" failed filtering criteria:`, {
        hasCompanyName,
        hasCompanyWebsite,
        hasCompanyLinkedin
      });
    }
  });

  console.log(`Filtering complete: ${companyMap.size} unique companies from ${jobs.length} total jobs`);

  return Array.from(companyMap.values());
}

async function enrichJobsWithProfiles(jobs: FilteredJobData[]): Promise<FilteredJobData[]> {
  // Get jobs that have poster LinkedIn URLs - be very specific about checking
  const jobsWithProfiles = jobs.filter(job => {
    const hasUrl = job.jobPosterLinkedinUrl && job.jobPosterLinkedinUrl.trim() !== '' && job.jobPosterLinkedinUrl !== 'N/A';
    if (hasUrl) {
      console.log(`Job "${job.title}" has valid poster URL: ${job.jobPosterLinkedinUrl}`);
    }
    return hasUrl;
  });
  
  console.log(`FILTERING RESULTS: Found ${jobsWithProfiles.length} jobs with valid LinkedIn profile URLs out of ${jobs.length} total filtered jobs`);
  
  if (jobsWithProfiles.length === 0) {
    console.log("❌ NO JOBS WITH LINKEDIN PROFILE URLs FOUND - All jobs will be marked as 'Cannot Apply'");
    console.log("Jobs without profile URLs:", jobs.map(job => ({
      title: job.title,
      posterName: job.jobPosterName,
      posterUrl: job.jobPosterLinkedinUrl
    })));
    return jobs.map(job => ({ ...job, canApply: false }));
  }

  console.log(`Starting profile enrichment for ${jobsWithProfiles.length} jobs with LinkedIn profile URLs`);

  // Process jobs in batches to avoid rate limiting
  const batchSize = 5;
  const enrichedJobs: FilteredJobData[] = [];
  
  for (let i = 0; i < jobsWithProfiles.length; i += batchSize) {
    const batch = jobsWithProfiles.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} with ${batch.length} jobs`);
    
    const batchPromises = batch.map(async (job) => {
      try {
        console.log(`Enriching profile for job: "${job.title}" - Profile URL: ${job.jobPosterLinkedinUrl}`);
        
        const profileData = await scrapeLinkedInProfile(job.jobPosterLinkedinUrl!);
        
        if (profileData && profileData.email) {
          console.log(`✓ Found email for ${job.title}: ${profileData.email}`);
          return {
            ...job,
            jobPosterEmail: profileData.email,
            canApply: true
          };
        } else {
          console.log(`✗ No email found for ${job.title}`);
          return {
            ...job,
            canApply: false
          };
        }
      } catch (error) {
        console.error(`Error enriching profile for job "${job.title}":`, error);
        return {
          ...job,
          canApply: false
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    enrichedJobs.push(...batchResults);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < jobsWithProfiles.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Merge enriched jobs with jobs that don't have profile URLs
  const jobsWithoutProfiles = jobs.filter(job => 
    !job.jobPosterLinkedinUrl || 
    job.jobPosterLinkedinUrl.trim() === '' || 
    job.jobPosterLinkedinUrl === 'N/A'
  ).map(job => ({ ...job, canApply: false }));

  const allJobs = [...enrichedJobs, ...jobsWithoutProfiles];
  
  const canApplyCount = allJobs.filter(job => job.canApply).length;
  console.log(`Profile enrichment complete: ${canApplyCount} jobs marked as "Can Apply" out of ${allJobs.length} total jobs`);
  
  return allJobs;
}

async function scrapeLinkedInProfile(profileUrl: string): Promise<{ email?: string } | null> {
  console.log(`🔍 Starting LinkedIn profile scrape for: ${profileUrl}`);
  
  try {
    const response = await fetch('https://api.apify.com/v2/acts/apify~linkedin-profile-scraper/run-sync-get-dataset-items?token=apify_api_9HeLn6tt4h84bgU5mZZKNNV4A8xd5a4qxOwT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileUrls: [profileUrl],
        includeUnlistedFields: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Apify profile API error: ${response.status} ${response.statusText} - ${errorText}`);
      return null;
    }

    const results = await response.json();
    console.log(`📋 Profile scraping results:`, JSON.stringify(results, null, 2));

    if (results && results.length > 0) {
      const profile = results[0];
      
      // Try multiple possible email field names
      const email = profile.email || 
                   profile.emailAddress || 
                   profile.contactInfo?.email ||
                   profile.contact?.email ||
                   profile.personalEmail ||
                   profile.workEmail;

      if (email) {
        console.log(`✅ Email found in profile: ${email}`);
        return { email };
      } else {
        console.log(`❌ No email found in profile fields:`, Object.keys(profile));
        return null;
      }
    } else {
      console.log(`❌ No profile data returned`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error scraping LinkedIn profile:`, error);
    return null;
  }
}

// Main job scraping endpoint
router.post("/scrape-job", async (req, res) => {
  try {
    // Validate request body
    const request = jobScrapingRequestSchema.parse(req.body);
    
    console.log(`Starting job scraping for URL: ${request.linkedinUrl}`);

    // Create initial request record
    const scrapingRequest = await storage.createJobScrapingRequest({
      linkedinUrl: request.linkedinUrl,
      status: "pending",
    });

    // Start async processing
    processJobScraping(scrapingRequest.id, request.linkedinUrl);

    res.json({ requestId: scrapingRequest.id });
  } catch (error) {
    console.error("Error creating job scraping request:", error);
    res.status(400).json({ 
      error: error instanceof z.ZodError ? error.errors : "Invalid request" 
    });
  }
});

async function processJobScraping(requestId: string, linkedinUrl: string) {
  try {
    // Update status to processing
    await storage.updateJobScrapingRequest(requestId, {
      status: "processing",
    });

    console.log(`Step 1: Starting job scraping for ${linkedinUrl}`);
    
    // Make API call to Apify job scraper
    const response = await fetch('https://api.apify.com/v2/acts/apify~linkedin-jobs-scraper/run-sync-get-dataset-items?token=apify_api_9HeLn6tt4h84bgU5mZZKNNV4A8xd5a4qxOwT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobUrls: [linkedinUrl],
        maxJobDescriptionLength: 10000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const rawResults = await response.json();
    console.log("Raw job scraping results sample:", JSON.stringify(rawResults.slice(0, 2), null, 2));
    console.log("Total jobs scraped:", rawResults.length);
    
    // Transform the results to match our schema
    const transformedJobs = rawResults.map((item: any, index: number) => {
      // Check all possible field names for job poster profile URL
      const jobPosterProfileUrl = item.jobPosterProfileUrl || 
                                 item.posterUrl || 
                                 item.recruiterUrl || 
                                 item.hiringManagerUrl || 
                                 item.jobPosterLinkedinUrl ||
                                 item.posterLinkedinUrl ||
                                 item.recruiterLinkedinUrl ||
                                 item.hiringManagerLinkedinUrl;

      const jobPosterName = item.jobPosterName || 
                           item.posterName || 
                           item.recruiterName || 
                           item.hiringManagerName;

      console.log(`Job ${index + 1} "${item.title || 'N/A'}":`, {
        hasJobPosterProfileUrl: !!jobPosterProfileUrl,
        jobPosterProfileUrl: jobPosterProfileUrl,
        hasJobPosterName: !!jobPosterName,
        jobPosterName: jobPosterName,
        availableFields: Object.keys(item)
      });

      const job = {
        title: item.title || "N/A",
        company: {
          name: item.companyName || item.company || "N/A",
          industry: item.industry,
          size: item.companySize,
          founded: item.founded,
          logo: item.companyLogo
        },
        location: item.location || "N/A",
        workType: item.employmentType || item.workType || "N/A",
        postedDate: item.postedDate || item.datePosted || "N/A",
        applicants: item.applicants,
        description: item.description || item.jobDescription || "No description available",
        skills: item.skills || [],
        originalUrl: item.url || item.jobUrl || linkedinUrl,
        companyWebsite: item.companyWebsite || item.website,
        companyLinkedinUrl: item.companyLinkedinUrl || item.companyUrl,
        jobPosterName: jobPosterName,
        jobPosterLinkedinUrl: jobPosterProfileUrl,
        requirement: item.requirement || item.requirements,
        salaryInfo: item.salaryInfo || item.salary
      };
      
      return job;
    });

    const jobsWithPosters = transformedJobs.filter(job => job.jobPosterLinkedinUrl);
    console.log(`Found ${jobsWithPosters.length} jobs with job poster profile URLs out of ${transformedJobs.length} total jobs`);

    console.log(`Step 2: Starting job filtering`);
    
    // Filter jobs for quality
    const filteredJobs = filterJobs(transformedJobs);
    
    console.log(`Step 3: Starting profile enrichment`);
    
    // Enrich jobs with profile data
    const enrichedJobs = await enrichJobsWithProfiles(filteredJobs);

    // Update request with results
    await storage.updateJobScrapingRequest(requestId, {
      status: "completed",
      scrapedJobs: transformedJobs,
      filteredJobs: filteredJobs,
      enrichedJobs: enrichedJobs,
    });

    console.log(`Job scraping completed successfully for request ${requestId}`);
  } catch (error) {
    console.error(`Error processing job scraping for request ${requestId}:`, error);
    
    await storage.updateJobScrapingRequest(requestId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Get job scraping status
router.get("/scrape-job/:id", async (req, res) => {
  try {
    const request = await storage.getJobScrapingRequest(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Calculate stats for the response
    const scrapedCount = request.scrapedJobs?.length || 0;
    const filteredCount = request.filteredJobs?.length || 0;
    const canApplyCount = request.enrichedJobs?.filter((job: any) => job.canApply).length || 0;

    res.json({
      id: request.id,
      status: request.status,
      scrapedJobs: request.scrapedJobs || [],
      filteredJobs: request.filteredJobs || [],
      enrichedJobs: request.enrichedJobs || [],
      errorMessage: request.errorMessage,
      stats: {
        scraped: scrapedCount,
        filtered: filteredCount,
        canApply: canApplyCount
      },
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    });
  } catch (error) {
    console.error("Error getting job scraping request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
```

### server/storage.ts
```typescript
import { jobScrapingRequests, type JobScrapingRequest, type InsertJobScrapingRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createJobScrapingRequest(request: InsertJobScrapingRequest): Promise<JobScrapingRequest>;
  getJobScrapingRequest(id: string): Promise<JobScrapingRequest | undefined>;
  updateJobScrapingRequest(id: string, updates: Partial<JobScrapingRequest>): Promise<JobScrapingRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createJobScrapingRequest(insertRequest: InsertJobScrapingRequest): Promise<JobScrapingRequest> {
    const [request] = await db
      .insert(jobScrapingRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getJobScrapingRequest(id: string): Promise<JobScrapingRequest | undefined> {
    const [request] = await db
      .select()
      .from(jobScrapingRequests)
      .where(eq(jobScrapingRequests.id, id));
    return request || undefined;
  }

  async updateJobScrapingRequest(id: string, updates: Partial<JobScrapingRequest>): Promise<JobScrapingRequest | undefined> {
    const [request] = await db
      .update(jobScrapingRequests)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(jobScrapingRequests.id, id))
      .returning();
    return request || undefined;
  }
}

export const storage = new DatabaseStorage();
```

### server/db.ts
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

### server/vite.ts
```typescript
import { createServer } from "vite";

const viteExpress = {
  async listen(app: any, port: number, callback?: () => void) {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    app.listen(port, callback);
  },
};

export default viteExpress;
```

---

## SHARED CODE

### shared/schema.ts
```typescript
import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Job scraping request status enum
export const jobScrapingStatusEnum = pgEnum('job_scraping_status', [
  'pending',
  'processing', 
  'completed',
  'failed'
]);

// Job scraping requests table
export const jobScrapingRequests = pgTable("job_scraping_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  linkedinUrl: text("linkedin_url").notNull(),
  status: jobScrapingStatusEnum("status").notNull().default('pending'),
  scrapedJobs: jsonb("scraped_jobs"),
  filteredJobs: jsonb("filtered_jobs"),
  enrichedJobs: jsonb("enriched_jobs"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type JobScrapingRequest = typeof jobScrapingRequests.$inferSelect;
export const insertJobScrapingRequestSchema = createInsertSchema(jobScrapingRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJobScrapingRequest = z.infer<typeof insertJobScrapingRequestSchema>;
```

---

## CLIENT CODE

### client/src/pages/home.tsx
```typescript
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Building, MapPin, Calendar, Users, CheckCircle2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilteredJobData = {
  title: string;
  company: {
    name: string;
    industry?: string;
    size?: string;
    founded?: string;
    logo?: string;
  };
  location: string;
  workType: string;
  postedDate: string;
  applicants?: number;
  description: string;
  skills: string[];
  originalUrl: string;
  companyWebsite?: string;
  companyLinkedinUrl?: string;
  jobPosterName?: string;
  jobPosterLinkedinUrl?: string;
  requirement?: string;
  salaryInfo?: string;
  canApply?: boolean;
  jobPosterEmail?: string;
};

type JobScrapingResponse = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  scrapedJobs: FilteredJobData[];
  filteredJobs: FilteredJobData[];
  enrichedJobs: FilteredJobData[];
  errorMessage?: string;
  stats: {
    scraped: number;
    filtered: number;
    canApply: number;
  };
  createdAt: string;
  updatedAt: string;
};

function JobCard({ job }: { job: FilteredJobData }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{job.company.name}</span>
              {job.canApply !== undefined && (
                <Badge variant={job.canApply ? "default" : "secondary"} className="ml-auto">
                  {job.canApply ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Can Apply
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Cannot Apply
                    </>
                  )}
                </Badge>
              )}
            </div>
          </div>
          {job.company.logo && (
            <img 
              src={job.company.logo} 
              alt={`${job.company.name} logo`}
              className="h-12 w-12 object-contain rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {job.postedDate}
          </div>
          {job.applicants && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {job.applicants} applicants
            </div>
          )}
        </div>

        {job.canApply && job.jobPosterEmail && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              Contact Information
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              <strong>Email:</strong> {job.jobPosterEmail}
            </div>
            {job.jobPosterName && (
              <div className="text-sm text-green-700 dark:text-green-300">
                <strong>Name:</strong> {job.jobPosterName}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Badge variant="outline">{job.workType}</Badge>
          {job.salaryInfo && <Badge variant="outline">{job.salaryInfo}</Badge>}
        </div>

        {job.skills.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Skills</div>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium">Description</div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {job.description}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" className="flex-1">
            <a href={job.originalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Job
            </a>
          </Button>
          {job.companyWebsite && (
            <Button asChild variant="outline" size="sm">
              <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer">
                Company
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scrapeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('/api/scrape-job', {
        method: 'POST',
        body: JSON.stringify({ linkedinUrl: url }),
      });
      return response;
    },
    onSuccess: (data) => {
      setCurrentRequestId(data.requestId);
      toast({
        title: "Job scraping started",
        description: "Your request is being processed...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start job scraping",
        variant: "destructive",
      });
    },
  });

  const { data: scrapingResult, isLoading } = useQuery({
    queryKey: ['/api/scrape-job', currentRequestId],
    enabled: !!currentRequestId,
    refetchInterval: (data) => {
      const status = data?.status;
      return status === 'pending' || status === 'processing' ? 2000 : false;
    },
  }) as { data: JobScrapingResponse | undefined; isLoading: boolean };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a LinkedIn job URL",
        variant: "destructive",
      });
      return;
    }
    scrapeMutation.mutate(linkedinUrl);
  };

  const handleReset = () => {
    setLinkedinUrl("");
    setCurrentRequestId(null);
    queryClient.removeQueries({ queryKey: ['/api/scrape-job'] });
  };

  const canApplyJobs = scrapingResult?.enrichedJobs?.filter(job => job.canApply) || [];
  const cannotApplyJobs = scrapingResult?.enrichedJobs?.filter(job => !job.canApply) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">LinkedIn Job Scraper</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Extract comprehensive job data from LinkedIn job postings. Our system scrapes job details, 
            filters for quality leads, and enriches data with contact information to help you identify actionable opportunities.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scrape LinkedIn Job</CardTitle>
            <CardDescription>
              Enter a LinkedIn job URL to start the three-step process: scraping, filtering, and profile enrichment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="flex-1"
                  disabled={scrapeMutation.isPending || isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={scrapeMutation.isPending || isLoading}
                >
                  {scrapeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Scrape Jobs'
                  )}
                </Button>
                {currentRequestId && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleReset}
                    disabled={scrapeMutation.isPending || isLoading}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {currentRequestId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                Processing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scrapingResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={
                        scrapingResult.status === 'completed' ? 'default' :
                        scrapingResult.status === 'failed' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {scrapingResult.status.toUpperCase()}
                    </Badge>
                    <div className="text-sm font-medium">
                      Scraped: {scrapingResult.stats.scraped} | 
                      Filtered: {scrapingResult.stats.filtered} | 
                      Can Apply: {scrapingResult.stats.canApply}
                    </div>
                  </div>

                  {scrapingResult.status === 'failed' && scrapingResult.errorMessage && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-red-800 dark:text-red-200 font-medium">Error:</p>
                      <p className="text-red-700 dark:text-red-300">{scrapingResult.errorMessage}</p>
                    </div>
                  )}

                  {scrapingResult.status === 'completed' && scrapingResult.enrichedJobs && (
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">
                          All ({scrapingResult.scrapedJobs?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="filtered">
                          Filtered ({scrapingResult.stats.filtered})
                        </TabsTrigger>
                        <TabsTrigger value="can-apply">
                          Can Apply ({scrapingResult.stats.canApply})
                        </TabsTrigger>
                        <TabsTrigger value="cannot-apply">
                          Cannot Apply ({scrapingResult.stats.filtered - scrapingResult.stats.canApply})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          {scrapingResult.scrapedJobs?.map((job, index) => (
                            <JobCard key={index} job={job} />
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="filtered" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          {scrapingResult.filteredJobs?.map((job, index) => (
                            <JobCard key={index} job={job} />
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="can-apply" className="space-y-4">
                        {canApplyJobs.length > 0 ? (
                          <div className="grid gap-6 md:grid-cols-2">
                            {canApplyJobs.map((job, index) => (
                              <JobCard key={index} job={job} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No jobs with contact information found
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="cannot-apply" className="space-y-4">
                        {cannotApplyJobs.length > 0 ? (
                          <div className="grid gap-6 md:grid-cols-2">
                            {cannotApplyJobs.map((job, index) => (
                              <JobCard key={index} job={job} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            All jobs have contact information available!
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Initializing job scraping...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

### client/src/App.tsx
```typescript
import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
```

### client/src/main.tsx
```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
```

### client/src/lib/queryClient.ts
```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = await response.text() || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
```

---

## CONFIGURATION FILES

### package.json
```json
{
  "name": "linkedin-job-scraper",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx --watch server/index.ts",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@neondatabase/serverless": "^0.10.1",
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-collapsible": "^1.1.1",
    "@radix-ui/react-context-menu": "^2.2.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-hover-card": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.2",
    "@radix-ui/react-navigation-menu": "^1.2.1",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.1",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.3",
    "@tanstack/react-query": "^5.61.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "cmdk": "1.0.0",
    "connect-pg-simple": "^10.0.0",
    "date-fns": "^4.1.0",
    "drizzle-orm": "^0.36.4",
    "drizzle-zod": "^0.5.1",
    "embla-carousel-react": "^8.3.0",
    "express": "^4.21.1",
    "express-session": "^1.18.1",
    "framer-motion": "^11.11.17",
    "input-otp": "^1.4.1",
    "lucide-react": "^0.454.0",
    "memorystore": "^1.6.7",
    "next-themes": "^0.4.3",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^9.2.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.1",
    "react-icons": "^5.3.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.13.3",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^1.0.0",
    "wouter": "^3.3.5",
    "ws": "^8.18.0",
    "zod": "^3.23.8",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^1.1.3",
    "@replit/vite-plugin-runtime-error-modal": "^1.0.1",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.0.0-alpha.30",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "^5.0.0",
    "@types/express-session": "^1.18.0",
    "@types/node": "^22.9.0",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.28.1",
    "esbuild": "^0.24.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.14",
    "tsx": "^4.19.2",
    "tw-animate-css": "^1.0.1",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
```

### drizzle.config.ts
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### vite.config.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cartographer } from "@replit/vite-plugin-cartographer";
import { runtimeErrorModal } from "@replit/vite-plugin-runtime-error-modal";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cartographer(),
    runtimeErrorModal(),
  ],
  root: "client",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
```

---

## API Integration Details

The application uses the following Apify API endpoints:

1. **Job Scraper API**: `https://api.apify.com/v2/acts/apify~linkedin-jobs-scraper/run-sync-get-dataset-items?token=YOUR_TOKEN`
2. **Profile Scraper API**: `https://api.apify.com/v2/acts/apify~linkedin-profile-scraper/run-sync-get-dataset-items?token=YOUR_TOKEN`

The current implementation includes debugging to identify which jobs contain the `jobPosterProfileUrl` field for profile enrichment.

---

## Usage Instructions

1. Install dependencies: `npm install`
2. Set up environment variables (DATABASE_URL)
3. Push database schema: `npm run db:push`
4. Start development server: `npm run dev`
5. Enter a LinkedIn job URL to begin the scraping process

The application will automatically process jobs through the three-step pipeline and display results with filtering options.