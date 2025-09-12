import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { verifyToken, extractToken } from '../_lib/auth';
import { getDb } from '../_lib/db';
import { emailApplications, gmailCredentials } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { google } from 'googleapis';
import { MailService } from '@sendgrid/mail';

const sendSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  jobListingId: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  useGmail: z.boolean().optional(),
});

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

async function sendWithGmail(userId: string, to: string, subject: string, body: string) {
  const db = getDb();
  
  // Get Gmail credentials
  const [creds] = await db
    .select()
    .from(gmailCredentials)
    .where(eq(gmailCredentials.userId, userId))
    .limit(1);

  if (!creds || !creds.isActive || !creds.accessToken) {
    throw new Error('Gmail not connected');
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

  const message = [
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body.replace(/\n/g, '<br>'),
  ].join('\n');

  const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
}

async function sendWithSendGrid(to: string, subject: string, body: string) {
  await mailService.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@autoapply.ai',
    subject,
    html: body.replace(/\n/g, '<br>'),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const body = sendSchema.parse(req.body);
    const db = getDb();
    
    // Send email
    if (body.useGmail) {
      await sendWithGmail(payload.userId, body.to, body.subject, body.body);
    } else {
      await sendWithSendGrid(body.to, body.subject, body.body);
    }

    // Record the email application
    await db.insert(emailApplications).values({
      userId: payload.userId,
      jobTitle: body.jobTitle || 'Unknown Position',
      companyName: body.companyName || 'Unknown Company',
      companyEmail: body.to,
      emailSubject: body.subject,
      emailBody: body.body,
      jobUrl: null,
      companyWebsite: null,
      gmailMessageId: null,
    });

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}