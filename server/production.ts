import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./simple-routes";
import { setupAuthRoutes } from "./auth-routes";
import { log } from "./vite";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Production-only server optimized for deployment
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Trust proxy for production
app.set("trust proxy", 1);

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production' || !process.env.REPLIT_DOMAINS;

// Session configuration for production
const PgSession = connectPgSimple(session);
const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required. Please add it to your Replit Secrets.');
}

const sessionConfig: any = {
  secret: process.env.SESSION_SECRET,
  store: process.env.DATABASE_URL ? new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  }) : undefined,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  name: 'connect.sid',
  cookie: {
    secure: true, // Always HTTPS in production
    httpOnly: true,
    maxAge: sessionTtl,
    sameSite: 'none',
  },
};

app.use(session(sessionConfig));

(async () => {
  // Setup auth routes first
  setupAuthRoutes(app);

  // Then register other routes
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Error:', err);
    res.status(status).json({ message });
  });

  // Serve static files in production
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const distPath = join(__dirname, 'public');
  
  app.use(express.static(distPath));
  
  // Fallback to index.html for SPA routing
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });

  // Get port from environment or use 5000
  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Production server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  });
})();
