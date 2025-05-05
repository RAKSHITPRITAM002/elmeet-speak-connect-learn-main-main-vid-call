// Mock payment service for handling subscription payments without a backend

import { PlanType } from '../contexts/SubscriptionContext';

// Payment method types
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal';
  details: {
    last4?: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
    email?: string;
  };
}

// Payment intent result
export interface PaymentResult {
  success: boolean;
  error?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
}

// Mock payment service
class PaymentService {
  // Process a payment for a subscription
  async processSubscriptionPayment(
    planType: PlanType,
    billingCycle: 'monthly' | 'annual',
    paymentDetails: {
      cardNumber?: string;
      cardExpiry?: string;
      cardCvc?: string;
      cardName?: string;
      paypalEmail?: string;
    }
  ): Promise<PaymentResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validate payment details
    if (
      (!paymentDetails.cardNumber && !paymentDetails.paypalEmail) ||
      (paymentDetails.cardNumber && (!paymentDetails.cardExpiry || !paymentDetails.cardCvc))
    ) {
      return {
        success: false,
        error: 'Invalid payment details'
      };
    }
    
    // In a real app, you would make an API call to your payment processor
    // For this mock implementation, we'll simulate a successful payment
    
    // Generate a mock transaction ID
    const transactionId = 'txn_' + Math.random().toString(36).substring(2, 15);
    
    // Create a mock payment method
    const paymentMethod: PaymentMethod = paymentDetails.paypalEmail
      ? {
          id: 'pm_' + Math.random().toString(36).substring(2, 15),
          type: 'paypal',
          details: {
            email: paymentDetails.paypalEmail
          }
        }
      : {
          id: 'pm_' + Math.random().toString(36).substring(2, 15),
          type: 'credit_card',
          details: {
            last4: paymentDetails.cardNumber?.slice(-4) || '4242',
            brand: this.detectCardBrand(paymentDetails.cardNumber || ''),
            expMonth: parseInt(paymentDetails.cardExpiry?.split('/')[0] || '12'),
            expYear: parseInt('20' + (paymentDetails.cardExpiry?.split('/')[1] || '25'))
          }
        };
    
    // Log the payment (in a real app, this would be stored in your database)
    console.log('Payment processed:', {
      planType,
      billingCycle,
      transactionId,
      paymentMethod: {
        ...paymentMethod,
        details: {
          ...paymentMethod.details,
          // Mask sensitive data in logs
          cardNumber: paymentDetails.cardNumber ? '****' + paymentDetails.cardNumber.slice(-4) : undefined,
          cardCvc: paymentDetails.cardCvc ? '***' : undefined
        }
      }
    });
    
    // Return success result
    return {
      success: true,
      transactionId,
      paymentMethod
    };
  }
  
  // Get saved payment methods for a user
  async getSavedPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, you would fetch this from your backend
    // For this mock implementation, we'll return some dummy data
    
    // Check if we have stored payment methods in localStorage
    const storedMethods = localStorage.getItem(`payment_methods_${userId}`);
    if (storedMethods) {
      return JSON.parse(storedMethods);
    }
    
    // Return empty array if no methods found
    return [];
  }
  
  // Save a new payment method
  async savePaymentMethod(
    userId: string,
    paymentDetails: {
      cardNumber?: string;
      cardExpiry?: string;
      cardCvc?: string;
      cardName?: string;
      paypalEmail?: string;
    }
  ): Promise<PaymentMethod> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate payment details
    if (
      (!paymentDetails.cardNumber && !paymentDetails.paypalEmail) ||
      (paymentDetails.cardNumber && (!paymentDetails.cardExpiry || !paymentDetails.cardCvc))
    ) {
      throw new Error('Invalid payment details');
    }
    
    // Create a new payment method
    const newMethod: PaymentMethod = paymentDetails.paypalEmail
      ? {
          id: 'pm_' + Math.random().toString(36).substring(2, 15),
          type: 'paypal',
          details: {
            email: paymentDetails.paypalEmail
          }
        }
      : {
          id: 'pm_' + Math.random().toString(36).substring(2, 15),
          type: 'credit_card',
          details: {
            last4: paymentDetails.cardNumber?.slice(-4) || '4242',
            brand: this.detectCardBrand(paymentDetails.cardNumber || ''),
            expMonth: parseInt(paymentDetails.cardExpiry?.split('/')[0] || '12'),
            expYear: parseInt('20' + (paymentDetails.cardExpiry?.split('/')[1] || '25'))
          }
        };
    
    // Get existing methods
    const existingMethods = await this.getSavedPaymentMethods(userId);
    
    // Add new method
    const updatedMethods = [...existingMethods, newMethod];
    
    // Save to localStorage
    localStorage.setItem(`payment_methods_${userId}`, JSON.stringify(updatedMethods));
    
    return newMethod;
  }
  
  // Delete a payment method
  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get existing methods
    const existingMethods = await this.getSavedPaymentMethods(userId);
    
    // Filter out the method to delete
    const updatedMethods = existingMethods.filter(method => method.id !== paymentMethodId);
    
    // Save to localStorage
    localStorage.setItem(`payment_methods_${userId}`, JSON.stringify(updatedMethods));
    
    return true;
  }
  
  // Helper method to detect card brand from number
  private detectCardBrand(cardNumber: string): string {
    // Basic regex patterns for card detection
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35)/
    };
    
    // Check card number against patterns
    if (patterns.visa.test(cardNumber)) return 'visa';
    if (patterns.mastercard.test(cardNumber)) return 'mastercard';
    if (patterns.amex.test(cardNumber)) return 'amex';
    if (patterns.discover.test(cardNumber)) return 'discover';
    if (patterns.diners.test(cardNumber)) return 'diners';
    if (patterns.jcb.test(cardNumber)) return 'jcb';
    
    // Default to unknown
    return 'unknown';
  }
}

// Export singleton instance
export const paymentService = new PaymentService();