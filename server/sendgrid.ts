import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const initializeSendGrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (apiKey) {
    sgMail.setApiKey(apiKey);
    return true;
  }
  return false;
};

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html: string;
}

export async function sendEmailWithSendGrid(params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!initializeSendGrid()) {
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const msg = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || params.html.replace(/<[^>]*>?/gm, ''), // Strip HTML for text version
      html: params.html,
    };

    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'] || 'sent',
    };
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to send email';
    if (error.response?.body?.errors?.[0]?.message) {
      errorMessage = error.response.body.errors[0].message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}