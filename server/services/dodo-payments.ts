import DodoPayments from 'dodopayments';

const DODO_API_KEY = process.env.DODO_API_KEY;
const DODO_ENVIRONMENT = process.env.DODO_ENVIRONMENT || 'test_mode';
const DODO_PRO_PRODUCT_ID = process.env.DODO_PRO_PRODUCT_ID;

if (!DODO_API_KEY) {
  console.warn('⚠️ Dodo Payments API key not configured. Payment features will be disabled.');
}

export const dodoClient = DODO_API_KEY ? new DodoPayments({
  bearerToken: DODO_API_KEY,
  environment: DODO_ENVIRONMENT as 'test_mode' | 'live_mode'
}) : null;

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  userName: string;
  productId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  if (!dodoClient) {
    throw new Error('Dodo Payments is not configured');
  }

  if (!params.productId && !DODO_PRO_PRODUCT_ID) {
    throw new Error('Product ID not configured');
  }

  const productId = params.productId || DODO_PRO_PRODUCT_ID!;
  
  const baseUrl = process.env.REPLIT_DOMAINS 
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';

  const session = await dodoClient.checkoutSessions.create({
    product_cart: [{
      product_id: productId,
      quantity: 1
    }],
    customer: {
      email: params.userEmail,
      name: params.userName
    },
    success_url: params.successUrl || `${baseUrl}/payment/success`,
    cancel_url: params.cancelUrl || `${baseUrl}/payment/cancelled`,
    metadata: {
      user_id: params.userId
    }
  });

  return session;
}

export async function verifyPayment(paymentId: string) {
  if (!dodoClient) {
    throw new Error('Dodo Payments is not configured');
  }

  const payment = await dodoClient.payments.retrieve(paymentId);
  return payment;
}

export async function listPayments(customerId?: string) {
  if (!dodoClient) {
    throw new Error('Dodo Payments is not configured');
  }

  const payments = [];
  for await (const payment of dodoClient.payments.list({
    customer_id: customerId
  })) {
    payments.push(payment);
  }
  
  return payments;
}

export async function getSubscriptionStatus(subscriptionId: string) {
  if (!dodoClient) {
    throw new Error('Dodo Payments is not configured');
  }

  const subscription = await dodoClient.subscriptions.retrieve(subscriptionId);
  return subscription;
}
