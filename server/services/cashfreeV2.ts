// Cashfree Payment Gateway Service - Direct API Implementation

// Use sandbox for testing, production only when explicitly set
const CASHFREE_BASE_URL = process.env.CASHFREE_PRODUCTION === 'true' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

// Get credentials from environment - no hardcoded fallbacks for security
const CASHFREE_CLIENT_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_SECRET_KEY;

// Validate credentials exist
if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
  console.error('Cashfree credentials missing:', {
    hasClientId: !!CASHFREE_CLIENT_ID,
    hasClientSecret: !!CASHFREE_CLIENT_SECRET,
    environment: process.env.CASHFREE_PRODUCTION === 'true' ? 'production' : 'sandbox'
  });
  throw new Error('Cashfree credentials not configured. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY environment variables.');
}

export interface CreateOrderData {
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  customerDetails: {
    customerId: string;
    customerEmail: string;
    customerPhone: string;
    customerName: string;
  };
  orderMeta?: {
    return_url?: string;
    notify_url?: string;
  };
}

export async function createCashfreeOrderV2(data: CreateOrderData) {
  try {
    // Build the base URL for callbacks
    // Always use HTTPS for production Cashfree
    const isProduction = process.env.CASHFREE_PRODUCTION === 'true';
    const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
    
    const baseUrl = process.env.BASE_URL || 
                   (replitDomain 
                     ? `https://${replitDomain}`
                     : (isProduction ? 'https://ai-jobhunter.com' : 'http://localhost:5000'));
    
    const requestBody = {
      order_id: data.orderId,
      order_amount: data.orderAmount,
      order_currency: data.orderCurrency,
      customer_details: {
        customer_id: data.customerDetails.customerId,
        customer_email: data.customerDetails.customerEmail,
        customer_phone: data.customerDetails.customerPhone,
        customer_name: data.customerDetails.customerName,
      },
      order_meta: {
        return_url: data.orderMeta?.return_url || `${baseUrl}/api/payment/return`,
        notify_url: data.orderMeta?.notify_url || `${baseUrl}/api/payment/webhook`,
      },
    };

    console.log('Creating Cashfree order:', {
      endpoint: `${CASHFREE_BASE_URL}/orders`,
      orderId: data.orderId,
      amount: data.orderAmount,
      currency: data.orderCurrency,
      environment: CASHFREE_BASE_URL.includes('sandbox') ? 'sandbox' : 'production',
      customerDetails: {
        email: data.customerDetails.customerEmail,
        phone: data.customerDetails.customerPhone,
        name: data.customerDetails.customerName
      }
    });
    
    console.log('Full request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CASHFREE_CLIENT_ID!,
        'x-client-secret': CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Cashfree API error response:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        requestBody: requestBody,
        endpoint: `${CASHFREE_BASE_URL}/orders`
      });
      
      // Parse error response if possible
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = errorData.message || errorData.error || responseText;
        console.error('Parsed Cashfree error:', errorData);
        throw new Error(`Cashfree API error: ${response.status} - ${JSON.stringify(errorData)}`);
      } catch (e) {
        throw new Error(`Cashfree API error: ${response.status} - ${responseText}`);
      }
    }

    const responseData = JSON.parse(responseText);
    console.log('Cashfree order created successfully:', {
      orderId: responseData.order_id,
      paymentSessionId: responseData.payment_session_id,
      status: responseData.order_status
    });
    
    return responseData;
  } catch (error: any) {
    console.error('Error in createCashfreeOrderV2:', error);
    throw new Error(error.message || "Failed to create payment order");
  }
}

export async function getOrderStatusV2(orderId: string) {
  try {
    console.log('Fetching Cashfree order status:', {
      orderId,
      endpoint: `${CASHFREE_BASE_URL}/orders/${orderId}`
    });

    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_CLIENT_ID!,
        'x-client-secret': CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2023-08-01'
      }
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Cashfree API error fetching order status:', {
        status: response.status,
        response: responseText
      });
      
      // Parse error response if possible
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = errorData.message || errorData.error || responseText;
        console.error('Parsed Cashfree error:', errorData);
        throw new Error(`Cashfree API error: ${response.status} - ${JSON.stringify(errorData)}`);
      } catch (e) {
        throw new Error(`Cashfree API error: ${response.status} - ${responseText}`);
      }
    }

    const orderData = JSON.parse(responseText);
    console.log('Cashfree order status fetched:', {
      orderId: orderData.order_id,
      status: orderData.order_status,
      paymentStatus: orderData.payment_status
    });
    
    return orderData;
  } catch (error: any) {
    console.error('Error in getOrderStatusV2:', error);
    throw new Error(error.message || "Failed to fetch order status");
  }
}