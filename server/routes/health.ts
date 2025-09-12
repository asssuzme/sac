/**
 * Health Check Routes
 * Provides endpoints for monitoring application health in production
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import config from '../config/production';

const router = Router();

/**
 * Basic health check endpoint
 * Returns application status and version
 */
router.get('/api/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.nodeEnv,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Detailed health check endpoint
 * Checks all critical services
 */
router.get('/api/health/detailed', async (req, res) => {
  const checks = {
    api: true,
    database: false,
    session: false,
    externalApis: {
      openai: false,
      apify: false,
      cashfree: false
    }
  };

  try {
    // Check database connection
    try {
      await db.execute(sql`SELECT 1`);
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check session store
    checks.session = !!req.session;

    // Check external API configurations
    checks.externalApis.openai = !!config.apis.openai.apiKey;
    checks.externalApis.apify = !!config.apis.apify.apiToken;
    checks.externalApis.cashfree = !!config.payment.cashfree.appId;

    const allHealthy = checks.database && 
                      checks.session && 
                      checks.externalApis.openai && 
                      checks.externalApis.apify && 
                      checks.externalApis.cashfree;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
      version: '1.0.0',
      environment: config.nodeEnv,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Service health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Readiness check for load balancers
 * Returns 200 when application is ready to serve traffic
 */
router.get('/api/ready', async (req, res) => {
  try {
    // Check if database is accessible
    await db.execute(sql`SELECT 1`);
    res.status(200).send('Ready');
  } catch (error) {
    res.status(503).send('Not Ready');
  }
});

/**
 * Liveness check for container orchestration
 * Returns 200 if application is alive
 */
router.get('/api/alive', (req, res) => {
  res.status(200).send('Alive');
});

export default router;