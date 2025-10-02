import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  totalJobsScraped: integer("total_jobs_scraped").default(0),
  totalApplicationsSent: integer("total_applications_sent").default(0),
  resumeText: text("resume_text"), // Permanent storage for user's resume
  resumeFileName: varchar("resume_file_name"), // Store the original file name
  resumeFileData: text("resume_file_data"), // Store the original file as base64
  resumeFileMimeType: varchar("resume_file_mime_type"), // Store the MIME type of the file
  resumeUploadedAt: timestamp("resume_uploaded_at"), // Track when resume was uploaded
  paymentCustomerId: varchar("payment_customer_id"), // Payment gateway customer ID
  subscriptionId: varchar("subscription_id"), // Subscription ID for pro plan
  subscriptionStatus: varchar("subscription_status"), // active, inactive, cancelled
  subscriptionExpiresAt: timestamp("subscription_expires_at"), // When subscription expires
  pendingPaymentOrderId: varchar("pending_payment_order_id"), // Cashfree order ID for pending payments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobScrapingRequests = pgTable("job_scraping_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  linkedinUrl: text("linkedin_url").notNull(),
  resumeText: text("resume_text"), // Optional resume text for personalized emails
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, filtering, enriching, completed, failed, cancelled
  results: jsonb("results"),
  filteredResults: jsonb("filtered_results"),
  enrichedResults: jsonb("enriched_results"),
  errorMessage: text("error_message"),
  // Job count tracking
  totalJobsFound: integer("total_jobs_found").default(0),
  freeJobsShown: integer("free_jobs_shown").default(0),
  proJobsShown: integer("pro_jobs_shown").default(0),
  // Apify run IDs for aborting
  jobScraperRunId: varchar("job_scraper_run_id"),
  profileScraperRunId: varchar("profile_scraper_run_id"),
  emailVerifierRunId: varchar("email_verifier_run_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Gmail OAuth credentials table
export const gmailCredentials = pgTable("gmail_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email applications sent table
export const emailApplications = pgTable("email_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name").notNull(),
  companyEmail: text("company_email").notNull(),
  emailSubject: text("email_subject"),
  emailBody: text("email_body"),
  jobUrl: text("job_url"),
  companyWebsite: text("company_website"),
  gmailMessageId: varchar("gmail_message_id"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// User schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertJobScrapingRequestSchema = createInsertSchema(jobScrapingRequests).pick({
  linkedinUrl: true,
  resumeText: true,
});

export type InsertJobScrapingRequest = z.infer<typeof insertJobScrapingRequestSchema>;
export type JobScrapingRequest = typeof jobScrapingRequests.$inferSelect;

// Gmail credentials schemas
export const insertGmailCredentialsSchema = createInsertSchema(gmailCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGmailCredentials = z.infer<typeof insertGmailCredentialsSchema>;
export type GmailCredentials = typeof gmailCredentials.$inferSelect;

// Email application schemas
export const insertEmailApplicationSchema = createInsertSchema(emailApplications).omit({
  id: true,
  sentAt: true,
});

export type InsertEmailApplication = z.infer<typeof insertEmailApplicationSchema>;
export type EmailApplication = typeof emailApplications.$inferSelect;

// Dodo Payments table for tracking payment transactions
export const dodoPayments = pgTable("dodo_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  paymentId: varchar("payment_id").unique(), // Dodo payment ID
  checkoutSessionId: varchar("checkout_session_id").unique(), // Dodo checkout session ID
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency").default("USD"),
  status: varchar("status").notNull(), // pending, succeeded, failed, refunded
  productId: varchar("product_id"), // Dodo product ID
  subscriptionId: varchar("subscription_id"), // For recurring payments
  metadata: jsonb("metadata"), // Store additional payment info
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DodoPayment = typeof dodoPayments.$inferSelect;
export type InsertDodoPayment = typeof dodoPayments.$inferInsert;

// Validation schema for LinkedIn URL
export const linkedinUrlSchema = z.object({
  linkedinUrl: z.string()
    .url("Please enter a valid URL")
    .refine((url) => url.includes("linkedin.com"), "Please enter a LinkedIn URL")
    .refine((url) => url.includes("/jobs/"), "Please enter a LinkedIn job URL"),
});

// Type definitions for scraped job data
export const jobDataSchema = z.object({
  title: z.string(),
  company: z.object({
    name: z.string(),
    industry: z.string().optional(),
    size: z.string().optional(),
    founded: z.string().optional(),
    logo: z.string().optional(),
  }),
  location: z.string(),
  workType: z.string(),
  postedDate: z.string(),
  applicants: z.string().optional(),
  description: z.string(),
  skills: z.array(z.string()).optional(),
  originalUrl: z.string(),
  companyWebsite: z.string().optional(),
  companyLinkedinUrl: z.string().optional(),
  jobPosterName: z.string().optional(),
  jobPosterLinkedinUrl: z.string().optional(),
  requirement: z.string().optional(),
  salaryInfo: z.string().optional(),
});

export type JobData = z.infer<typeof jobDataSchema>;

// Filtered job data schema with required fields
export const filteredJobDataSchema = z.object({
  title: z.string(),
  companyName: z.string(),
  companyLogo: z.string().optional(),
  companyWebsite: z.string(),
  companyLinkedinUrl: z.string(),
  jobPosterName: z.string().optional(),
  jobPosterLinkedinUrl: z.string().optional(),
  jobPosterImageUrl: z.string().optional(), // LinkedIn job poster profile picture
  jobPosterTitle: z.string().optional(), // LinkedIn job poster title/headline
  jobPosterEmail: z.string().optional(),
  emailVerificationStatus: z.enum(['valid', 'catch-all', 'error', 'unknown']).optional(),
  requirement: z.string().optional(),
  location: z.string(),
  link: z.string(),
  salaryInfo: z.string().optional(),
  canApply: z.boolean().optional(),
  postedDate: z.string().optional(), // Add posting date to track when job was posted
});

export type FilteredJobData = z.infer<typeof filteredJobDataSchema>;

export const scrapingResultSchema = z.object({
  jobs: z.array(jobDataSchema),
  totalCount: z.number(),
  scrapedAt: z.string(),
});

export const filteredResultSchema = z.object({
  jobs: z.array(filteredJobDataSchema),
  totalCount: z.number(),
  originalCount: z.number(),
  filteredAt: z.string(),
});

export const enrichedResultSchema = z.object({
  jobs: z.array(filteredJobDataSchema),
  totalCount: z.number(),
  canApplyCount: z.number(),
  enrichedAt: z.string(),
});

export type ScrapingResult = z.infer<typeof scrapingResultSchema>;
export type FilteredResult = z.infer<typeof filteredResultSchema>;
export type EnrichedResult = z.infer<typeof enrichedResultSchema>;
