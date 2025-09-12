import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users, jobScrapingRequests, emailApplications, gmailCredentials, type User } from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { registerGmailAuthRoutes } from './routes/gmail-auth';
import OpenAI from "openai";
import multer from "multer";
import { google } from "googleapis";
import passport from './passport-config';
// import PDFParse from 'pdf-parse'; // Commenting out for now due to import issue

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Add session data interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple auth middleware
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.session.userId))
    .limit(1);
  
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  req.user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // CORS configuration for production
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = process.env.REPLIT_DOMAINS ? 
      process.env.REPLIT_DOMAINS.split(',').map(d => `https://${d}`) : 
      ['http://localhost:5000', 'http://localhost:3000'];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });

  // === AUTHENTICATION ROUTES ===
  
  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    console.log('Auth check - Session ID:', req.sessionID);
    console.log('Auth check - User ID:', req.session.userId);
    
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);
      
      if (!user) {
        console.log('No user found for ID:', req.session.userId);
        req.session.destroy(() => {});
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      console.log('User found:', user.email);
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Google OAuth login
  app.get('/api/auth/google', (req, res, next) => {
    // Override the callback URL based on the current request
    const host = req.get('host') || '';
    let callbackURL: string;
    
    if (host.includes('ai-jobhunter.com')) {
      callbackURL = 'https://ai-jobhunter.com/api/auth/google/callback';
    } else if (host.includes('replit.dev')) {
      callbackURL = `https://${host}/api/auth/google/callback`;
    } else if (host.includes('localhost')) {
      callbackURL = `http://${host}/api/auth/google/callback`;
    } else {
      callbackURL = `${req.protocol}://${host}/api/auth/google/callback`;
    }
    
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      callbackURL: callbackURL 
    })(req, res, next);
  });

  // TEMPORARY: Development bypass for testing
  app.get('/api/auth/dev-login', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).send('Not found');
    }
    
    // Create or get test user
    const testEmail = 'test@example.com';
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1);
    
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          id: 'dev-user-123',
          email: testEmail,
          firstName: 'Test',
          lastName: 'User',
        })
        .returning();
    }
    
    req.session.userId = user.id;
    await new Promise<void>((resolve) => {
      req.session.save(() => resolve());
    });
    
    res.redirect('/');
  });

  // Google OAuth callback
  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req, res) => {
      try {
        // Successful authentication
        const user = req.user as any;
        if (!user || !user.id) {
          console.error('No user or user ID after authentication');
          return res.redirect('/?error=no_user');
        }
        
        req.session.userId = user.id;
        console.log('Setting session userId:', user.id);
        
        // Force session save and wait for it
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error('Session save error:', err);
              reject(err);
            } else {
              console.log('Session saved successfully');
              resolve();
            }
          });
        });
        
        // Add a small delay to ensure session is propagated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect to frontend
        res.redirect('/');
      } catch (error) {
        console.error('Auth callback error:', error);
        res.redirect('/?error=session_error');
      }
    }
  );

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to destroy session' });
        }
        res.json({ success: true });
      });
    });
  });

  // === GMAIL ROUTES ===
  // Register Gmail auth routes
  registerGmailAuthRoutes(app);

  // === DASHBOARD ROUTES ===
  
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    // Get total counts
    const [scrapingCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(jobScrapingRequests)
      .where(eq(jobScrapingRequests.userId, req.user!.id));

    const [applicationCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(emailApplications)
      .where(eq(emailApplications.userId, req.user!.id));

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentScrapingCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(jobScrapingRequests)
      .where(
        and(
          eq(jobScrapingRequests.userId, req.user!.id),
          gte(jobScrapingRequests.createdAt, sevenDaysAgo)
        )
      );

    res.json({
      totalJobsScraped: scrapingCount?.count || 0,
      totalApplicationsSent: applicationCount?.count || 0,
      activeJobSearches: recentScrapingCount?.count || 0,
      pendingApplications: 0,
    });
  });

  // === JOB SCRAPING ROUTES ===
  
  // Scrape job endpoint
  app.post("/api/scrape-job", requireAuth, async (req, res) => {
    const { linkedinUrl, resumeText } = req.body;
    
    if (!linkedinUrl) {
      return res.status(400).json({ error: 'LinkedIn URL is required' });
    }

    // Create job scraping request
    const [request] = await db
      .insert(jobScrapingRequests)
      .values({
        userId: req.user!.id,
        linkedinUrl,
        resumeText,
        status: 'pending',
      })
      .returning();

    // For now, simulate processing by marking as completed after a delay
    setTimeout(async () => {
      await db
        .update(jobScrapingRequests)
        .set({ 
          status: 'completed',
          results: { 
            message: 'Job scraping completed successfully!',
            jobsFound: 5,
            enrichedResults: {
              totalCount: 5,
              canApplyCount: 3
            }
          },
          completedAt: new Date()
        })
        .where(eq(jobScrapingRequests.id, request.id));
    }, 2000);
    
    res.json({ requestId: request.id });
  });

  // Get scraping status
  app.get("/api/scrape-job/status/:requestId", requireAuth, async (req, res) => {
    const { requestId } = req.params;
    
    const [request] = await db
      .select()
      .from(jobScrapingRequests)
      .where(
        and(
          eq(jobScrapingRequests.id, requestId),
          eq(jobScrapingRequests.userId, req.user!.id)
        )
      )
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      id: request.id,
      status: request.status,
      results: request.results,
      enrichedResults: request.results?.enrichedResults || null,
      error: request.errorMessage,
    });
  });
  
  // Generate LinkedIn URL from search parameters
  app.post("/api/generate-linkedin-url", requireAuth, async (req, res) => {
    const { keyword, location, workType } = req.body;
    
    if (!keyword || !location || !workType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      // Simple LinkedIn URL generation
      const baseUrl = 'https://www.linkedin.com/jobs/search';
      const params = new URLSearchParams({
        keywords: keyword,
        location: location,
        f_WT: workType // 1=Onsite, 2=Remote, 3=Hybrid
      });
      
      const linkedinUrl = `${baseUrl}?${params.toString()}`;
      
      res.json({ 
        linkedinUrl,
        message: `Generated LinkedIn search URL for ${keyword} in ${location}`
      });
    } catch (error) {
      console.error('Error generating LinkedIn URL:', error);
      res.status(500).json({ error: 'Failed to generate LinkedIn URL' });
    }
  });
  
  app.post("/api/job-scraping/submit", requireAuth, async (req, res) => {
    const { search, location } = req.body;
    
    const [request] = await db
      .insert(jobScrapingRequests)
      .values({
        userId: req.user!.id,
        linkedinUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`,
        status: 'pending',
        results: [],
      })
      .returning();

    res.json({
      requestId: request.id,
      status: 'pending',
      message: 'Job scraping request submitted',
    });
  });



  // === EMAIL ROUTES ===
  
  app.post("/api/email/generate", requireAuth, async (req, res) => {
    const { jobTitle, companyName, jobDescription, resume } = req.body;
    
    const prompt = `Generate a professional email applying for the ${jobTitle} position at ${companyName}.

Job Description:
${jobDescription}

Resume:
${resume}

Create a compelling, personalized email that:
1. Shows genuine interest in the specific role and company
2. Highlights relevant experience and skills from the resume
3. Is concise (under 250 words)
4. Has a professional tone

Format the email with proper greeting and sign-off.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional career coach helping job seekers write compelling application emails."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const emailContent = completion.choices[0]?.message?.content || '';
      res.json({
        email: emailContent,
        subject: `Application for ${jobTitle} position at ${companyName}`,
      });
    } catch (error) {
      console.error('Email generation error:', error);
      res.status(500).json({ error: 'Failed to generate email' });
    }
  });

  app.post("/api/email/send", requireAuth, async (req, res) => {
    const { to, subject, body, jobTitle, companyName } = req.body;
    
    try {
      // Get user's resume data if available
      const userResume = await storage.getUserResume(req.user!.id);
      
      console.log('Email send - Resume data:', {
        userId: req.user!.id,
        hasResume: !!userResume,
        hasFileData: !!userResume?.resumeFileData,
        fileName: userResume?.resumeFileName,
        fileDataLength: userResume?.resumeFileData?.length,
        mimeType: userResume?.resumeFileMimeType,
        fileDataSample: userResume?.resumeFileData?.substring(0, 50) // First 50 chars of base64
      });
      
      // Always use Gmail - no SendGrid
      const [creds] = await db
        .select()
        .from(gmailCredentials)
        .where(eq(gmailCredentials.userId, req.user!.id))
        .limit(1);

      if (!creds || !creds.isActive) {
        return res.status(400).json({ error: 'Gmail not connected. Please authorize Gmail first.' });
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        access_token: creds.accessToken,
        refresh_token: creds.refreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Create email with attachment if resume exists
      let emailMessage: string;
      
      if (userResume?.resumeFileData && userResume?.resumeFileName) {
        console.log('Creating email with attachment:', {
          fileName: userResume.resumeFileName,
          mimeType: userResume.resumeFileMimeType,
          dataLength: userResume.resumeFileData.length
        });
        
        // Create multipart MIME message with attachment
        const boundary = `====boundary${Date.now()}====`;
        const htmlBody = body.replace(/\n/g, '<br>');
        
        // Build the MIME message parts
        const messageParts = [];
        
        // Headers
        messageParts.push(`To: ${to}`);
        messageParts.push(`Subject: ${subject}`);
        messageParts.push('MIME-Version: 1.0');
        messageParts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
        messageParts.push('');
        
        // Email body part
        messageParts.push(`--${boundary}`);
        messageParts.push('Content-Type: text/html; charset=utf-8');
        messageParts.push('Content-Transfer-Encoding: base64');
        messageParts.push('');
        messageParts.push(Buffer.from(htmlBody).toString('base64'));
        messageParts.push('');
        
        // Attachment part
        messageParts.push(`--${boundary}`);
        messageParts.push(`Content-Type: ${userResume.resumeFileMimeType || 'application/octet-stream'}; name="${userResume.resumeFileName}"`);
        messageParts.push('Content-Transfer-Encoding: base64');
        messageParts.push(`Content-Disposition: attachment; filename="${userResume.resumeFileName}"`);
        messageParts.push('');
        messageParts.push(userResume.resumeFileData);
        messageParts.push('');
        
        // End boundary
        messageParts.push(`--${boundary}--`);
        
        emailMessage = messageParts.join('\r\n');
      } else {
        // Simple email without attachment
        console.log('Creating email WITHOUT attachment - no resume data found');
        emailMessage = [
          `To: ${to}`,
          `Subject: ${subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=utf-8',
          '',
          body.replace(/\n/g, '<br>'),
        ].join('\r\n');
      }

      const encodedMessage = Buffer.from(emailMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      console.log('Sending Gmail with attachment:', !!userResume?.resumeFileData);
      
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      // Record the email
      await db.insert(emailApplications).values({
        userId: req.user!.id,
        jobTitle: jobTitle || 'Unknown Position',
        companyName: companyName || 'Unknown Company',
        companyEmail: to,
        emailSubject: subject,
        emailBody: body,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Email send error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // === RESUME ROUTES ===
  
  app.post("/api/resume/upload", requireAuth, upload.single('resume'), async (req, res) => {
    try {
      let resumeText = '';
      let fileData: string | undefined;
      let fileName: string | undefined;
      let mimeType: string | undefined;
      
      if (req.file) {
        // Handle file upload (PDF, TXT, etc.)
        fileName = req.file.originalname;
        mimeType = req.file.mimetype;
        fileData = req.file.buffer.toString('base64');
        
        // Extract text from PDF if needed
        if (req.file.mimetype === 'application/pdf') {
          const pdfParse = require('pdf-parse');
          try {
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
          } catch (error) {
            console.error('PDF parsing error:', error);
            resumeText = ''; // Still store the file even if text extraction fails
          }
        } else if (req.file.mimetype.startsWith('text/')) {
          // For text files, use the content directly
          resumeText = req.file.buffer.toString('utf-8');
        }
      } else if (req.body.resumeText) {
        // Text upload (from textarea)
        resumeText = req.body.resumeText;
        fileName = 'resume.txt';
        mimeType = 'text/plain';
        fileData = Buffer.from(resumeText).toString('base64');
      }

      if (!resumeText && !fileData) {
        return res.status(400).json({ error: 'No resume content provided' });
      }

      // Update user's resume with both text and file data
      await storage.updateUserResume(
        req.user!.id,
        resumeText || '',
        fileName || 'resume.txt',
        fileData,
        mimeType
      );

      console.log('Resume uploaded:', { 
        userId: req.user!.id, 
        fileName, 
        hasFileData: !!fileData,
        fileDataLength: fileData?.length,
        mimeType 
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ error: 'Failed to upload resume' });
    }
  });

  // === FEEDBACK ROUTES ===
  
  app.post("/api/feedback/payment-interest", async (req, res) => {
    try {
      const { wouldPay } = req.body;
      const userId = req.session?.userId || 'anonymous';
      
      // Log the feedback (you could store this in a database if needed)
      console.log(`Payment Interest Feedback: User ${userId} - Would Pay: ${wouldPay}`);
      
      // You could also track this in a database table if you want
      // For now, just log it
      
      res.json({ 
        success: true,
        message: wouldPay ? 'Thanks for your enthusiasm!' : 'Thanks for your honesty!'
      });
    } catch (error) {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  });

  // === APPLICATION ROUTES ===
  
  app.get("/api/applications", requireAuth, async (req, res) => {
    const applications = await db
      .select()
      .from(emailApplications)
      .where(eq(emailApplications.userId, req.user!.id))
      .orderBy(desc(emailApplications.sentAt));

    res.json(applications);
  });
  
  // Debug endpoint to check resume data
  app.get("/api/debug/resume", requireAuth, async (req, res) => {
    const resumeData = await storage.getUserResume(req.user!.id);
    
    res.json({
      hasResume: !!resumeData,
      hasFileData: !!resumeData?.resumeFileData,
      fileName: resumeData?.resumeFileName,
      mimeType: resumeData?.resumeFileMimeType,
      fileDataLength: resumeData?.resumeFileData?.length,
      fileDataSample: resumeData?.resumeFileData?.substring(0, 100), // First 100 chars
      uploadedAt: resumeData?.resumeUploadedAt
    });
  });
  
  // Test endpoint to send email with attachment
  app.post("/api/test/send-email-with-resume", requireAuth, async (req, res) => {
    try {
      const { email } = req.body;
      const testEmail = email || req.user?.email || 'test@example.com';
      
      // Get user's resume data
      const userResume = await storage.getUserResume(req.user!.id);
      
      console.log('TEST EMAIL - Resume check:', {
        userId: req.user!.id,
        hasResume: !!userResume,
        hasFileData: !!userResume?.resumeFileData,
        fileName: userResume?.resumeFileName,
        fileDataLength: userResume?.resumeFileData?.length,
        mimeType: userResume?.resumeFileMimeType
      });
      
      if (!userResume?.resumeFileData) {
        return res.status(400).json({ 
          error: 'No resume found. Please upload a resume first.',
          debug: {
            hasResume: !!userResume,
            hasFileData: false
          }
        });
      }
      
      // Check if user has Gmail connected
      const [gmailCreds] = await db
        .select()
        .from(gmailCredentials)
        .where(eq(gmailCredentials.userId, req.user!.id))
        .limit(1);
      
      if (!gmailCreds || !gmailCreds.isActive) {
        return res.status(400).json({ 
          error: 'Gmail not connected. Please authorize Gmail first.' 
        });
      }
      
      // Send with Gmail ONLY
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      
      oauth2Client.setCredentials({
        access_token: gmailCreds.accessToken,
        refresh_token: gmailCreds.refreshToken,
      });
      
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      
      // Create multipart MIME message with attachment
      const boundary = `====testboundary${Date.now()}====`;
      const testBody = `This is a test email to verify resume attachment.<br><br>Your resume should be attached to this email.`;
      
      const messageParts = [];
      messageParts.push(`To: ${testEmail}`);
      messageParts.push(`Subject: Test Email - Resume Attachment Verification`);
      messageParts.push('MIME-Version: 1.0');
      messageParts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      messageParts.push('');
      messageParts.push(`--${boundary}`);
      messageParts.push('Content-Type: text/html; charset=utf-8');
      messageParts.push('Content-Transfer-Encoding: base64');
      messageParts.push('');
      messageParts.push(Buffer.from(testBody).toString('base64'));
      messageParts.push('');
      messageParts.push(`--${boundary}`);
      messageParts.push(`Content-Type: ${userResume.resumeFileMimeType || 'application/octet-stream'}; name="${userResume.resumeFileName}"`);
      messageParts.push('Content-Transfer-Encoding: base64');
      messageParts.push(`Content-Disposition: attachment; filename="${userResume.resumeFileName}"`);
      messageParts.push('');
      messageParts.push(userResume.resumeFileData);
      messageParts.push('');
      messageParts.push(`--${boundary}--`);
      
      const emailMessage = messageParts.join('\r\n');
      const encodedMessage = Buffer.from(emailMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      
      res.json({ 
        success: true, 
        message: 'Test email sent with resume attachment via Gmail',
        details: {
          to: testEmail,
          attachmentName: userResume.resumeFileName,
          attachmentSize: userResume.resumeFileData.length
        }
      });
    } catch (error: any) {
      console.error('Test email error:', error);
      res.status(500).json({ 
        error: 'Failed to send test email', 
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}