import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystack = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface PaymentInitiationData {
  email: string;
  amount: number; // in kobo (1 NGN = 100 kobo)
  reference: string;
  metadata?: {
    orderId: string;
    userId: string;
    items: any[];
  };
  callback_url?: string;
}

export interface PaymentVerificationResponse {
  status: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    transaction_date: string;
    status: string;
    reference: string;
    metadata: any;
  };
}

export interface TransferRecipientData {
  type: 'nuban';
  name: string;
  account_number: string;
  bank_code: string;
  currency: string;
}

export interface TransferData {
  source: 'balance';
  amount: number;
  recipient: string;
  reason: string;
  reference: string;
}

export class PaystackService {
  /**
   * Initialize a payment transaction
   */
  static async initializePayment(data: PaymentInitiationData) {
    try {
      const response = await paystack.post('/transaction/initialize', data);
      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data);
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  /**
   * Verify a payment transaction
   */
  static async verifyPayment(reference: string) {
    try {
      const response = await paystack.get(`/transaction/verify/${reference}`);
      return response.data as PaymentVerificationResponse;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Create a transfer recipient (vendor/rider bank account)
   */
  static async createTransferRecipient(data: TransferRecipientData) {
    try {
      const response = await paystack.post('/transferrecipient', data);
      return response.data;
    } catch (error: any) {
      console.error('Create recipient error:', error.response?.data);
      throw new Error(`Failed to create transfer recipient: ${error.message}`);
    }
  }

  /**
   * Initiate transfer to recipient
   */
  static async initiateTransfer(data: TransferData) {
    try {
      const response = await paystack.post('/transfer', data);
      return response.data;
    } catch (error: any) {
      console.error('Transfer initiation error:', error.response?.data);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: any, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }
}

export default PaystackService;