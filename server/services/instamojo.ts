// Instamojo Payment Gateway Service
// Simple integration without IP restrictions

const INSTAMOJO_BASE_URL = process.env.INSTAMOJO_PRODUCTION === 'true' 
  ? 'https://www.instamojo.com/api/1.1' 
  : 'https://test.instamojo.com/api/1.1';

const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY || 'test_a3d5b3c0c3d4e5f6g7h8i9j0k1';
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN || 'test_l2m3n4o5p6q7r8s9t0u1v2w3x4';

export interface CreatePaymentRequestData {
  purpose: string;
  amount: string;
  buyer_name: string;
  email: string;
  phone?: string;
  redirect_url: string;
  webhook?: string;
  send_email?: boolean;
  send_sms?: boolean;
  allow_repeated_payments?: boolean;
}

export async function createInstamojoPaymentRequest(data: CreatePaymentRequestData) {
  try {
    const response = await fetch(`${INSTAMOJO_BASE_URL}/payment-requests/`, {
      method: 'POST',
      headers: {
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        purpose: data.purpose,
        amount: data.amount,
        buyer_name: data.buyer_name,
        email: data.email,
        phone: data.phone || '9999999999',
        redirect_url: data.redirect_url,
        webhook: data.webhook || '',
        send_email: String(data.send_email || false),
        send_sms: String(data.send_sms || false),
        allow_repeated_payments: String(data.allow_repeated_payments || false)
      }).toString()
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Instamojo API error:', responseText);
      throw new Error(`Instamojo error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to create payment request');
    }

    return result.payment_request;
  } catch (error: any) {
    console.error('Instamojo payment creation error:', error);
    throw error;
  }
}

export async function getPaymentStatus(paymentRequestId: string, paymentId: string) {
  try {
    const response = await fetch(
      `${INSTAMOJO_BASE_URL}/payment-requests/${paymentRequestId}/${paymentId}/`,
      {
        headers: {
          'X-Api-Key': INSTAMOJO_API_KEY,
          'X-Auth-Token': INSTAMOJO_AUTH_TOKEN
        }
      }
    );

    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`Failed to get payment status: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    return result.payment_request;
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
}

// Simple test mode implementation
export function createTestModePaymentLink(orderId: string, amount: number, currency: string) {
  // In test mode, create a simple redirect that simulates successful payment
  const successUrl = `https://gigfloww.com/api/payment/instamojo-return?payment_id=TEST_${orderId}&payment_status=Credit&payment_request_id=${orderId}`;
  return successUrl;
}