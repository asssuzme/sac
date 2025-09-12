import Razorpay from 'razorpay';
import crypto from 'crypto';

// Log Razorpay configuration status
console.log('Razorpay Service Loading:', {
  hasKeyId: !!process.env.RAZORPAY_KEY_ID,
  hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
  keyIdPrefix: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 8) : 'not-set'
});

// Initialize Razorpay instance
export function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }
  
  return new Razorpay({
    key_id,
    key_secret
  });
}

export interface CreateOrderOptions {
  amount: number; // in smallest currency unit (paise for INR, cents for USD)
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
}

export async function createRazorpayOrder(options: CreateOrderOptions) {
  const razorpay = getRazorpayInstance();
  
  try {
    const order = await razorpay.orders.create({
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes || {}
    });
    
    return order;
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    throw new Error(error.error?.description || error.message || 'Failed to create payment order');
  }
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_secret) {
    throw new Error('Razorpay secret key not configured');
  }
  
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(body.toString())
    .digest('hex');
    
  return expectedSignature === signature;
}

export async function fetchPaymentDetails(paymentId: string) {
  const razorpay = getRazorpayInstance();
  
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error: any) {
    console.error('Error fetching payment details:', error);
    throw new Error(error.error?.description || 'Failed to fetch payment details');
  }
}