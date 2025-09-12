import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { verifyToken, extractToken } from '../_lib/auth';
import { OpenAI } from 'openai';
import { z } from 'zod';

const generateSchema = z.object({
  jobTitle: z.string(),
  companyName: z.string(),
  jobDescription: z.string(),
  resume: z.string(),
  selectedRoleType: z.string().optional(),
  experienceYears: z.number().optional(),
  skillsToHighlight: z.array(z.string()).optional(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const body = generateSchema.parse(req.body);
    
    const prompt = `Generate a professional email applying for the ${body.jobTitle} position at ${body.companyName}.

Job Description:
${body.jobDescription}

Resume:
${body.resume}

${body.selectedRoleType ? `Role Type: ${body.selectedRoleType}` : ''}
${body.experienceYears ? `Years of Experience: ${body.experienceYears}` : ''}
${body.skillsToHighlight ? `Skills to Highlight: ${body.skillsToHighlight.join(', ')}` : ''}

Create a compelling, personalized email that:
1. Shows genuine interest in the specific role and company
2. Highlights relevant experience and skills from the resume
3. Demonstrates understanding of the job requirements
4. Is concise (under 250 words)
5. Has a professional tone
6. Includes a clear call to action

Format the email with proper greeting and sign-off.`;

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

    res.status(200).json({
      email: emailContent,
      subject: `Application for ${body.jobTitle} position at ${body.companyName}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Error generating email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}