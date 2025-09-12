/**
 * Production Configuration Module
 * Centralizes all production settings and validates required environment variables
 */

interface Config {
  // Server Configuration
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  
  // Database
  database: {
    url: string;
    ssl: boolean;
  };
  
  // Authentication
  auth: {
    googleClientId: string;
    googleClientSecret: string;
    sessionSecret: string;
    jwtSecret?: string;
  };
  
  // External APIs
  apis: {
    openai: {
      apiKey: string;
    };
    apify: {
      apiToken: string;
      companyEmailToken?: string;
    };
    sendgrid?: {
      apiKey: string;
      fromEmail: string;
    };
  };
  
  // Payment Gateway
  payment: {
    cashfree: {
      appId: string;
      secretKey: string;
      isProduction: boolean;
    };
  };
  
  // Application
  app: {
    domain: string;
    allowedOrigins: string[];
  };
  
  // Supabase (optional)
  supabase?: {
    url: string;
    anonKey: string;
  };
}

/**
 * Validates that a required environment variable is set
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    console.error(`Please check your .env file and ensure ${key} is set`);
    
    // In production, throw an error to prevent startup with missing config
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    
    // In development, return a placeholder
    return `MISSING_${key}`;
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Production configuration object
 */
export const config: Config = {
  // Server Configuration
  port: parseInt(getOptionalEnv('PORT', '5000'), 10),
  nodeEnv: getOptionalEnv('NODE_ENV', 'development'),
  isProduction: process.env.NODE_ENV === 'production' || 
                process.env.REPL_SLUG === 'workspace',
  
  // Database
  database: {
    url: getRequiredEnv('DATABASE_URL'),
    ssl: process.env.NODE_ENV === 'production',
  },
  
  // Authentication
  auth: {
    googleClientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
    googleClientSecret: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
    sessionSecret: getRequiredEnv('SESSION_SECRET'),
    jwtSecret: getOptionalEnv('JWT_SECRET'),
  },
  
  // External APIs
  apis: {
    openai: {
      apiKey: getRequiredEnv('OPENAI_API_KEY'),
    },
    apify: {
      apiToken: getRequiredEnv('APIFY_API_TOKEN'),
      companyEmailToken: getOptionalEnv('APIFY_COMPANY_EMAIL_TOKEN'),
    },
    sendgrid: process.env.SENDGRID_API_KEY ? {
      apiKey: getOptionalEnv('SENDGRID_API_KEY'),
      fromEmail: getOptionalEnv('SENDGRID_FROM_EMAIL', 'support@ai-jobhunter.com'),
    } : undefined,
  },
  
  // Payment Gateway
  payment: {
    cashfree: {
      appId: getRequiredEnv('CASHFREE_APP_ID'),
      secretKey: getRequiredEnv('CASHFREE_SECRET_KEY'),
      isProduction: getOptionalEnv('CASHFREE_PRODUCTION', 'false') === 'true',
    },
  },
  
  // Application
  app: {
    domain: getOptionalEnv('PRODUCTION_DOMAIN', 'ai-jobhunter.com'),
    allowedOrigins: [
      'http://localhost:5000',
      'http://localhost:3000',
      'https://ai-jobhunter.com',
      'https://www.ai-jobhunter.com',
      // Add Replit domain if available
      ...(process.env.REPLIT_DOMAINS ? 
        process.env.REPLIT_DOMAINS.split(',').map(d => `https://${d}`) : []),
    ],
  },
  
  // Supabase (optional)
  supabase: process.env.VITE_SUPABASE_URL ? {
    url: getOptionalEnv('VITE_SUPABASE_URL'),
    anonKey: getOptionalEnv('VITE_SUPABASE_ANON_KEY'),
  } : undefined,
};

/**
 * Validates the configuration on startup
 */
export function validateConfig(): void {
  console.log('🔧 Validating production configuration...');
  
  const requiredKeys = [
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SESSION_SECRET',
    'OPENAI_API_KEY',
    'APIFY_API_TOKEN',
    'CASHFREE_APP_ID',
    'CASHFREE_SECRET_KEY',
  ];
  
  const missingKeys: string[] = [];
  
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      missingKeys.push(key);
    }
  }
  
  if (missingKeys.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingKeys.forEach(key => console.error(`   - ${key}`));
    
    if (process.env.NODE_ENV === 'production') {
      console.error('\n⚠️  Application will not start properly without these variables.');
      console.error('Please set them in your .env file or deployment environment.\n');
      throw new Error('Missing required configuration');
    } else {
      console.warn('\n⚠️  Running in development mode with missing configuration.');
      console.warn('Some features may not work properly.\n');
    }
  } else {
    console.log('✅ All required environment variables are configured');
  }
  
  // Log configuration status (without exposing sensitive values)
  console.log('\n📋 Configuration Status:');
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Production Mode: ${config.isProduction}`);
  console.log(`   Database: ${config.database.url ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   Google OAuth: ${config.auth.googleClientId ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   OpenAI API: ${config.apis.openai.apiKey ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   Apify API: ${config.apis.apify.apiToken ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   Cashfree: ${config.payment.cashfree.appId ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   Cashfree Mode: ${config.payment.cashfree.isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
  console.log(`   SendGrid: ${config.apis.sendgrid ? '✓ Configured' : '○ Not configured (optional)'}`);
  console.log(`   Supabase: ${config.supabase ? '✓ Configured' : '○ Not configured (optional)'}`);
  console.log(`   Domain: ${config.app.domain}\n`);
}

/**
 * Security middleware to prevent API key exposure
 */
export function secureHeaders(req: any, res: any, next: any): void {
  // Prevent caching of sensitive data
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove sensitive headers that might expose server info
  res.removeHeader('X-Powered-By');
  
  next();
}

export default config;