import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupAuthRoutes } from "./auth-routes";
import { setupVite, serveStatic, log } from "./vite";

// Debug environment variables
console.log('Environment Variables Debug:');
console.log('GOOGLE_CLIENT_ID configured:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET configured:', !!process.env.GOOGLE_CLIENT_SECRET);
if (process.env.GOOGLE_CLIENT_ID) {
  console.log('GOOGLE_CLIENT_ID starts with:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration
app.set("trust proxy", 1);

console.log('=== SESSION DEBUG MODE ENABLED ===');

// Detect environment properly for deployment
const hostname = process.env.REPL_SLUG || 'localhost';
// Production when NODE_ENV is production or when deployed
const isProduction = process.env.NODE_ENV === 'production';

// Direct fix: force session to work
// PostgreSQL session store for persistent sessions
const PgSession = connectPgSimple(session);
const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days

const sessionConfig: any = {
  secret: process.env.SESSION_SECRET || 'ai-jobhunter-fixed-secret-key',
  store: process.env.DATABASE_URL ? new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  }) : undefined,
  resave: false,  // Don't resave unchanged sessions
  saveUninitialized: false,  // Don't save empty sessions
  rolling: true,  // Reset expiry on activity  
  name: 'connect.sid',
  cookie: {
    secure: isProduction && !process.env.REPL_SLUG,  // Use HTTPS in production but not in Replit dev
    httpOnly: true, // Security: prevent XSS attacks
    maxAge: sessionTtl, // 30 days
    sameSite: isProduction ? 'none' : 'lax', // 'none' for production to work with cross-origin
  },
};

// Don't set domain for production to avoid cookie issues
// Let the browser handle it automatically based on the request domain

console.log('Session config:', {
  isProduction,
  hostname,
  replSlug: process.env.REPL_SLUG,
  replitDomain: process.env.REPLIT_DOMAIN,
  nodeEnv: process.env.NODE_ENV,
  secure: sessionConfig.cookie.secure,
  domain: sessionConfig.cookie.domain,
  sameSite: sessionConfig.cookie.sameSite
});

app.use(session(sessionConfig));



app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Add critical session test route BEFORE anything else
  app.get('/session-fix-test', async (req: any, res) => {
    try {
      // Create test user
      let [user] = await (await import('./db')).db
        .select()
        .from((await import('@shared/schema')).users)
        .where((await import('drizzle-orm')).eq((await import('@shared/schema')).users.email, 'session-fix@test.com'))
        .limit(1);
      
      if (!user) {
        [user] = await (await import('./db')).db
          .insert((await import('@shared/schema')).users)
          .values({
            id: 'session-fix-test',
            email: 'session-fix@test.com',
            firstName: 'Session',
            lastName: 'Fix',
          })
          .returning();
      }
      
      req.session.userId = user.id;
      res.json({ 
        fixed: true, 
        sessionId: req.sessionID,
        userId: user.id
      });
    } catch (error) {
      res.json({ error: String(error) });
    }
  });

  // Setup authentication routes first
  setupAuthRoutes(app);
  
  // Then register other routes
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Note: For deployment, we only use the main port (5000)
  // OAuth redirects should be configured to use the main port in production
})();
