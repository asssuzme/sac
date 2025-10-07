import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

// Gmail-specific OAuth configuration
// Only request the minimum required scope for sending emails
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send'  // Only permission to send emails
];

// Create OAuth client for Gmail
export function createGmailOAuthClient(req?: any) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Gmail OAuth credentials not configured');
  }

  // Dynamically determine redirect URL from request if available
  let redirectUrl: string;
  if (req && req.get) {
    const host = req.get('host') || '';
    
    if (host.includes('ai-jobhunter.com')) {
      redirectUrl = 'https://ai-jobhunter.com/api/auth/gmail/callback';
    } else if (host.includes('replit.dev')) {
      redirectUrl = `https://${host}/api/auth/gmail/callback`;
    } else if (host.includes('localhost')) {
      redirectUrl = `http://${host}/api/auth/gmail/callback`;
    } else {
      redirectUrl = `${req.protocol}://${host}/api/auth/gmail/callback`;
    }
  } else {
    // Fallback if no request object
    if (process.env.REPLIT_DOMAINS) {
      const domains = process.env.REPLIT_DOMAINS.split(',');
      redirectUrl = `https://${domains[0]}/api/auth/gmail/callback`;
    } else {
      redirectUrl = `http://localhost:${process.env.PORT || 5000}/api/auth/gmail/callback`;
    }
  }

  console.log('Gmail OAuth redirect URL:', redirectUrl);

  return new OAuth2Client(
    clientId,
    clientSecret,
    redirectUrl
  );
}

// Generate Gmail authorization URL
export function getGmailAuthUrl(userId: string, req?: any, forceConsent: boolean = false, returnUrl?: string): string {
  const oauth2Client = createGmailOAuthClient(req);
  
  // Create state parameter with user ID and optional returnUrl
  const state = Buffer.from(JSON.stringify({
    userId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
    returnUrl: returnUrl || '/'
  })).toString('base64');

  const authUrlOptions: any = {
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    state
  };

  // Only force consent for first-time authorization
  // This ensures we get a refresh token on first auth
  // but doesn't annoy users with consent screen on subsequent auths
  if (forceConsent) {
    authUrlOptions.prompt = 'consent';
  }

  return oauth2Client.generateAuthUrl(authUrlOptions);
}

// Handle Gmail OAuth callback
export async function handleGmailCallback(code: string, state: string, req?: any) {
  try {
    const oauth2Client = createGmailOAuthClient(req);
    
    // Decode and validate state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    return {
      userId: stateData.userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date,
      returnUrl: stateData.returnUrl || '/'
    };
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    throw error;
  }
}

// Refresh Gmail access token
export async function refreshGmailToken(refreshToken: string): Promise<string | null> {
  try {
    const oauth2Client = createGmailOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token || null;
  } catch (error) {
    console.error('Error refreshing Gmail token:', error);
    return null;
  }
}