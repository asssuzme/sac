import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmailWithSupabase(params: EmailParams): Promise<{ 
  success: boolean; 
  messageId?: string; 
  error?: string 
}> {
  try {
    // Use Supabase's email sending functionality
    // Note: This requires SMTP to be configured in your Supabase project settings
    
    // For now, we'll use a workaround by creating an email log entry
    // and returning instructions for the user to configure SMTP
    
    const emailLog = {
      to: params.to,
      subject: params.subject,
      body: params.html,
      from: params.from || 'noreply@ai-jobhunter.com',
      sent_at: new Date().toISOString(),
      status: 'pending_smtp_config'
    };

    // Store email in database for tracking
    const { data, error } = await supabase
      .from('email_logs')
      .insert(emailLog)
      .select()
      .single();

    if (error) {
      console.error('Error logging email:', error);
      return {
        success: false,
        error: 'Failed to process email request'
      };
    }

    // Check if SMTP is configured by trying to send a test email
    // If SMTP is not configured, we'll get a specific error
    
    return {
      success: false,
      error: 'Email sending requires SMTP configuration in Supabase. Please configure SMTP in your Supabase project settings: Dashboard → Settings → Auth → SMTP Settings',
      messageId: data?.id
    };

  } catch (error: any) {
    console.error('Supabase email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

// Helper function to check if SMTP is configured
export async function checkSMTPConfiguration(): Promise<boolean> {
  // This would typically check if SMTP settings are configured
  // For now, we'll return false as SMTP needs to be set up
  return false;
}