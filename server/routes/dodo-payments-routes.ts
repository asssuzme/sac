import type { Express, Request, Response } from 'express';
import { db } from '@db';
import { users, dodoPayments } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { createCheckoutSession, verifyPayment, getSubscriptionStatus } from '../services/dodo-payments';
import { Webhook } from 'standardwebhooks';

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET;

async function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.session.userId))
    .limit(1);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = user;
  next();
}

export function registerDodoPaymentRoutes(app: Express) {
  
  // Create checkout session for Pro plan upgrade
  app.post('/api/payments/checkout', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      
      console.log('[DODO-PAYMENT] Creating checkout session for user:', user.id);
      
      const session = await createCheckoutSession({
        userId: user.id,
        userEmail: user.email!,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email!,
        successUrl: req.body.successUrl,
        cancelUrl: req.body.cancelUrl
      });

      // Store pending checkout session
      await db.insert(dodoPayments).values({
        userId: user.id,
        checkoutSessionId: session.id,
        amount: 0, // Will be updated on webhook
        status: 'pending',
        productId: session.product_cart?.[0]?.product_id || '',
      });

      console.log('[DODO-PAYMENT] Checkout session created:', session.id);

      res.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id
      });
    } catch (error: any) {
      console.error('[DODO-PAYMENT] Checkout error:', error);
      res.status(500).json({ 
        error: 'Failed to create checkout session',
        details: error.message 
      });
    }
  });

  // Get user's subscription status
  app.get('/api/payments/subscription-status', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;

      // Check if user has an active subscription
      const isPro = user.subscriptionStatus === 'active' && 
                    user.subscriptionExpiresAt && 
                    new Date(user.subscriptionExpiresAt) > new Date();

      res.json({
        isPro,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        subscriptionId: user.subscriptionId
      });
    } catch (error: any) {
      console.error('[DODO-PAYMENT] Subscription status error:', error);
      res.status(500).json({ error: 'Failed to get subscription status' });
    }
  });

  // Get user's payment history
  app.get('/api/payments/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user!;

      const payments = await db
        .select()
        .from(dodoPayments)
        .where(eq(dodoPayments.userId, user.id))
        .orderBy(dodoPayments.createdAt);

      res.json({ payments });
    } catch (error: any) {
      console.error('[DODO-PAYMENT] Payment history error:', error);
      res.status(500).json({ error: 'Failed to get payment history' });
    }
  });

  // Dodo Payments webhook endpoint
  app.post('/api/payments/webhook/dodo', async (req: Request, res: Response) => {
    try {
      console.log('[DODO-WEBHOOK] Received webhook');

      if (!DODO_WEBHOOK_SECRET) {
        console.error('[DODO-WEBHOOK] Webhook secret not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
      }

      // Verify webhook signature
      const webhook = new Webhook(DODO_WEBHOOK_SECRET);
      const rawBody = JSON.stringify(req.body);
      
      const webhookHeaders = {
        'webhook-id': req.headers['webhook-id'] as string || '',
        'webhook-signature': req.headers['webhook-signature'] as string || '',
        'webhook-timestamp': req.headers['webhook-timestamp'] as string || ''
      };

      await webhook.verify(rawBody, webhookHeaders);

      const payload = req.body;
      console.log('[DODO-WEBHOOK] Event type:', payload.event_type);

      const userId = payload.data?.metadata?.user_id;

      switch (payload.event_type) {
        case 'payment.succeeded': {
          const paymentData = payload.data;
          console.log('[DODO-WEBHOOK] Payment succeeded:', paymentData.id);

          if (userId) {
            // Update payment record
            await db.update(dodoPayments)
              .set({
                paymentId: paymentData.id,
                status: 'succeeded',
                amount: paymentData.amount || 0,
                currency: paymentData.currency || 'USD',
                metadata: paymentData,
                updatedAt: new Date()
              })
              .where(eq(dodoPayments.checkoutSessionId, paymentData.checkout_session_id));

            // Activate Pro subscription for 30 days
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await db.update(users)
              .set({
                subscriptionStatus: 'active',
                subscriptionExpiresAt: expiresAt,
                paymentCustomerId: paymentData.customer_id,
                updatedAt: new Date()
              })
              .where(eq(users.id, userId));

            console.log('[DODO-WEBHOOK] User upgraded to Pro:', userId);
          }
          break;
        }

        case 'payment.failed': {
          const paymentData = payload.data;
          console.log('[DODO-WEBHOOK] Payment failed:', paymentData.id);

          if (userId && paymentData.checkout_session_id) {
            await db.update(dodoPayments)
              .set({
                paymentId: paymentData.id,
                status: 'failed',
                metadata: paymentData,
                updatedAt: new Date()
              })
              .where(eq(dodoPayments.checkoutSessionId, paymentData.checkout_session_id));
          }
          break;
        }

        case 'subscription.created': {
          const subscriptionData = payload.data;
          console.log('[DODO-WEBHOOK] Subscription created:', subscriptionData.id);

          if (userId) {
            await db.update(users)
              .set({
                subscriptionId: subscriptionData.id,
                subscriptionStatus: 'active',
                updatedAt: new Date()
              })
              .where(eq(users.id, userId));
          }
          break;
        }

        case 'subscription.canceled': {
          const subscriptionData = payload.data;
          console.log('[DODO-WEBHOOK] Subscription canceled:', subscriptionData.id);

          if (userId) {
            await db.update(users)
              .set({
                subscriptionStatus: 'cancelled',
                updatedAt: new Date()
              })
              .where(eq(users.id, userId));
          }
          break;
        }

        case 'subscription.renewed': {
          const subscriptionData = payload.data;
          console.log('[DODO-WEBHOOK] Subscription renewed:', subscriptionData.id);

          if (userId) {
            // Extend subscription by 30 days
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await db.update(users)
              .set({
                subscriptionStatus: 'active',
                subscriptionExpiresAt: expiresAt,
                updatedAt: new Date()
              })
              .where(eq(users.id, userId));
          }
          break;
        }

        default:
          console.log('[DODO-WEBHOOK] Unhandled event type:', payload.event_type);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('[DODO-WEBHOOK] Webhook error:', error);
      res.status(400).json({ error: 'Webhook processing failed', details: error.message });
    }
  });

  // Success/Cancel redirect pages (optional)
  app.get('/payment/success', (req: Request, res: Response) => {
    res.redirect('/?payment=success');
  });

  app.get('/payment/cancelled', (req: Request, res: Response) => {
    res.redirect('/?payment=cancelled');
  });
}
