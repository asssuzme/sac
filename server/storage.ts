import { 
  type JobScrapingRequest, 
  type InsertJobScrapingRequest, 
  type User,
  type UpsertUser,
  type EmailApplication,
  type InsertEmailApplication,
  type GmailCredentials,
  type InsertGmailCredentials,
  jobScrapingRequests,
  users,
  emailApplications,
  gmailCredentials
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Job scraping methods
  getJobScrapingRequest(id: string): Promise<JobScrapingRequest | undefined>;
  createJobScrapingRequest(request: InsertJobScrapingRequest & { userId: string }): Promise<JobScrapingRequest>;
  updateJobScrapingRequest(id: string, updates: Partial<JobScrapingRequest>): Promise<JobScrapingRequest | undefined>;
  getJobScrapingRequestsByStatus(status: string): Promise<JobScrapingRequest[]>;
  getJobScrapingRequestsByUser(userId: string): Promise<JobScrapingRequest[]>;
  cancelJobScrapingRequest(id: string): Promise<void>;
  
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Resume operations
  updateUserResume(userId: string, resumeText: string, fileName: string): Promise<User | undefined>;
  getUserResume(userId: string): Promise<{ resumeText: string | null; resumeFileName: string | null; resumeUploadedAt: Date | null } | undefined>;
  
  // Dashboard operations
  getDashboardStats(userId: string): Promise<{
    totalJobsScraped: number;
    totalApplicationsSent: number;
    recentSearches: JobScrapingRequest[];
  }>;
  
  // Email application methods
  createEmailApplication(application: InsertEmailApplication): Promise<EmailApplication>;
  getEmailApplicationsByUser(userId: string): Promise<EmailApplication[]>;
  
  // Gmail credentials methods
  getGmailCredentials(userId: string): Promise<GmailCredentials | undefined>;
  upsertGmailCredentials(credentials: InsertGmailCredentials): Promise<GmailCredentials>;
  deleteGmailCredentials(userId: string): Promise<void>;
  unlinkGmailCredentials(userId: string): Promise<void>;
  
  // Admin methods
  getTotalUsers(): Promise<number>;
  getUsersCreatedAfter(date: Date): Promise<number>;
  getActiveSubscriptionCount(): Promise<number>;
  getTotalSearchCount(): Promise<number>;
  getSearchesCountToday(): Promise<number>;
  getUserGrowthData(days: number): Promise<Array<{ date: string; users: number }>>;
  getSearchVolumeData(days: number): Promise<Array<{ date: string; searches: number }>>;
  getRecentActivities(limit: number): Promise<Array<any>>;
  getTotalRevenue(): Promise<number>;
  getMonthlyRevenueData(months: number): Promise<Array<{ month: string; revenue: number }>>;
  
  // Detailed admin data access methods
  getAllUsersDetailed(): Promise<User[]>;
  getAllJobRequestsDetailed(): Promise<JobScrapingRequest[]>;
  getAllEmailApplicationsDetailed(): Promise<EmailApplication[]>;
  getAllGmailCredentialsDetailed(): Promise<GmailCredentials[]>;
}

export class DatabaseStorage implements IStorage {
  async getJobScrapingRequest(id: string): Promise<JobScrapingRequest | undefined> {
    const [request] = await db.select().from(jobScrapingRequests).where(eq(jobScrapingRequests.id, id));
    return request || undefined;
  }

  async createJobScrapingRequest(insertRequest: InsertJobScrapingRequest & { userId: string }): Promise<JobScrapingRequest> {
    const [request] = await db
      .insert(jobScrapingRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateJobScrapingRequest(id: string, updates: Partial<JobScrapingRequest>): Promise<JobScrapingRequest | undefined> {
    const [updated] = await db
      .update(jobScrapingRequests)
      .set(updates)
      .where(eq(jobScrapingRequests.id, id))
      .returning();
    return updated || undefined;
  }

  async getJobScrapingRequestsByStatus(status: string): Promise<JobScrapingRequest[]> {
    return await db.select().from(jobScrapingRequests).where(eq(jobScrapingRequests.status, status));
  }

  async getJobScrapingRequestsByUser(userId: string): Promise<JobScrapingRequest[]> {
    return await db.select().from(jobScrapingRequests).where(eq(jobScrapingRequests.userId, userId));
  }

  async cancelJobScrapingRequest(id: string): Promise<void> {
    await db
      .update(jobScrapingRequests)
      .set({ status: "cancelled", completedAt: new Date() })
      .where(eq(jobScrapingRequests.id, id));
  }

  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserSubscription(userId: string, updates: {
    subscriptionStatus: string;
    subscriptionPlan: string;
    subscriptionExpiresAt: Date;
    subscriptionPaymentId: string;
  }): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        subscriptionStatus: updates.subscriptionStatus,
        subscriptionId: updates.subscriptionPlan, // Using subscriptionId field for plan
        subscriptionExpiresAt: updates.subscriptionExpiresAt,
        paymentCustomerId: updates.subscriptionPaymentId, // Using paymentCustomerId for payment ID
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // First check if user exists by email to get their existing ID
    const [existingUser] = await db.select().from(users).where(eq(users.email, userData.email!));
    
    if (existingUser) {
      // Update existing user, keeping their original ID
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.email, userData.email!))
        .returning();
      return updatedUser;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();
      return newUser;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserResume(
    userId: string, 
    resumeText: string, 
    fileName: string,
    fileData?: string,
    mimeType?: string
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        resumeText,
        resumeFileName: fileName,
        resumeFileData: fileData || null,
        resumeFileMimeType: mimeType || null,
        resumeUploadedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return updated || undefined;
  }

  async getUserResume(userId: string): Promise<{ 
    resumeText: string | null; 
    resumeFileName: string | null; 
    resumeFileData: string | null;
    resumeFileMimeType: string | null;
    resumeUploadedAt: Date | null 
  } | undefined> {
    const [user] = await db
      .select({
        resumeText: users.resumeText,
        resumeFileName: users.resumeFileName,
        resumeFileData: users.resumeFileData,
        resumeFileMimeType: users.resumeFileMimeType,
        resumeUploadedAt: users.resumeUploadedAt
      })
      .from(users)
      .where(eq(users.id, userId));
    return user || undefined;
  }

  async getDashboardStats(userId: string): Promise<{
    totalJobsScraped: number;
    totalApplicationsSent: number;
    recentSearches: JobScrapingRequest[];
  }> {
    // Get ALL searches to calculate cumulative total
    const allSearches = await db
      .select()
      .from(jobScrapingRequests)
      .where(eq(jobScrapingRequests.userId, userId))
      .orderBy(desc(jobScrapingRequests.createdAt));
    
    // Get recent searches for display (limit to 10)
    const recentSearches = allSearches.slice(0, 10);
    
    // Calculate cumulative total of all fake jobs from all searches
    let totalJobsScraped = 0;
    for (const search of allSearches) {
      if (search.status === 'completed' && search.enrichedResults) {
        const enrichedResults = search.enrichedResults as any;
        // Use stored fake total if available, otherwise use a consistent fallback based on search ID
        if (enrichedResults.fakeTotalJobs) {
          totalJobsScraped += enrichedResults.fakeTotalJobs;
        } else {
          // For old searches without fakeTotalJobs, generate consistent number based on search ID
          let hash = 0;
          for (let i = 0; i < search.id.length; i++) {
            hash = ((hash << 5) - hash) + search.id.charCodeAt(i);
            hash = hash & hash;
          }
          const consistentFakeTotal = 500 + Math.abs(hash % 1501); // 500-2000
          totalJobsScraped += consistentFakeTotal;
        }
      }
    }
    
    // Get actual count of emails sent from emailApplications table
    const emailApplicationsResult = await db
      .select({ count: count() })
      .from(emailApplications)
      .where(eq(emailApplications.userId, userId));
    
    const totalApplicationsSent = emailApplicationsResult[0]?.count || 0;

    return {
      totalJobsScraped,
      totalApplicationsSent,
      recentSearches
    };
  }
  
  async createEmailApplication(application: InsertEmailApplication): Promise<EmailApplication> {
    const [created] = await db.insert(emailApplications).values(application).returning();
    return created;
  }
  
  async getEmailApplicationsByUser(userId: string): Promise<EmailApplication[]> {
    return await db
      .select()
      .from(emailApplications)
      .where(eq(emailApplications.userId, userId))
      .orderBy(desc(emailApplications.sentAt));
  }
  
  async getGmailCredentials(userId: string): Promise<GmailCredentials | undefined> {
    const [credentials] = await db
      .select()
      .from(gmailCredentials)
      .where(eq(gmailCredentials.userId, userId));
    return credentials || undefined;
  }
  
  async upsertGmailCredentials(credentials: InsertGmailCredentials): Promise<GmailCredentials> {
    const [upserted] = await db
      .insert(gmailCredentials)
      .values(credentials)
      .onConflictDoUpdate({
        target: gmailCredentials.userId,
        set: {
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          expiresAt: credentials.expiresAt,
          isActive: true,
          updatedAt: new Date()
        }
      })
      .returning();
    return upserted;
  }
  
  async deleteGmailCredentials(userId: string): Promise<void> {
    await db
      .delete(gmailCredentials)
      .where(eq(gmailCredentials.userId, userId));
  }
  
  async unlinkGmailCredentials(userId: string): Promise<void> {
    await db
      .update(gmailCredentials)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(gmailCredentials.userId, userId));
  }

  // Admin methods implementation
  async getTotalUsers(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result?.count || 0;
  }

  async getUsersCreatedAfter(date: Date): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.createdAt, users.createdAt) // This is just a placeholder, we need to add gte operator
      ));
    return result?.count || 0;
  }

  async getActiveSubscriptionCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.subscriptionStatus, 'active'),
        eq(users.subscriptionExpiresAt, users.subscriptionExpiresAt) // This is a placeholder for > now()
      ));
    return result?.count || 0;
  }

  async getTotalSearchCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(jobScrapingRequests);
    return result?.count || 0;
  }

  async getSearchesCountToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [result] = await db
      .select({ count: count() })
      .from(jobScrapingRequests)
      .where(eq(jobScrapingRequests.createdAt, jobScrapingRequests.createdAt)); // Placeholder for >= today
    return result?.count || 0;
  }

  async getUserGrowthData(days: number): Promise<Array<{ date: string; users: number }>> {
    // Simplified implementation - returns mock data for now
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 10) + 1
      });
    }
    return data;
  }

  async getSearchVolumeData(days: number): Promise<Array<{ date: string; searches: number }>> {
    // Simplified implementation - returns mock data for now
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        searches: Math.floor(Math.random() * 50) + 10
      });
    }
    return data;
  }

  async getRecentActivities(limit: number): Promise<Array<any>> {
    // Get recent job searches
    const recentSearches = await db
      .select()
      .from(jobScrapingRequests)
      .orderBy(desc(jobScrapingRequests.createdAt))
      .limit(limit);

    // Map to activity format
    const activities = recentSearches.map(search => ({
      type: 'search',
      description: `Job search started`,
      user: search.userId,
      timestamp: new Date(search.createdAt).toLocaleString()
    }));

    return activities;
  }

  async getTotalRevenue(): Promise<number> {
    // Calculate based on active subscriptions * months * price
    const activeSubscriptions = await this.getActiveSubscriptionCount();
    return activeSubscriptions * 2; // Simplified - $2 per subscription
  }

  async getMonthlyRevenueData(months: number): Promise<Array<{ month: string; revenue: number }>> {
    // Simplified implementation - returns mock data for now
    const data = [];
    const today = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      data.push({
        month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: Math.floor(Math.random() * 1000) + 100
      });
    }
    return data;
  }

  // Detailed admin data access methods
  async getAllUsersDetailed(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllJobRequestsDetailed(): Promise<JobScrapingRequest[]> {
    return await db.select().from(jobScrapingRequests).orderBy(desc(jobScrapingRequests.createdAt));
  }

  async getAllEmailApplicationsDetailed(): Promise<EmailApplication[]> {
    return await db.select().from(emailApplications).orderBy(desc(emailApplications.sentAt));
  }

  async getAllGmailCredentialsDetailed(): Promise<GmailCredentials[]> {
    return await db.select().from(gmailCredentials).orderBy(desc(gmailCredentials.createdAt));
  }
}

export const storage = new DatabaseStorage();
