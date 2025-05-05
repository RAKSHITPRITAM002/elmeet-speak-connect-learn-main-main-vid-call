// Subscription management service with backend API integration
import api from './api';
import { PlanType, Subscription, SubscriptionPlan } from '../contexts/SubscriptionContext';

// Types for API responses
export interface UserSubscription {
  id: string;
  userId: string;
  planType: PlanType;
  status: 'active' | 'canceled' | 'expired' | 'trial' | 'past_due';
  startDate: Date;
  endDate: Date;
  billingCycle: 'monthly' | 'annual';
  autoRenew: boolean;
  stripeSubscriptionId?: string;
  paymentMethod?: {
    type: 'credit_card' | 'paypal';
    last4?: string;
    expiry?: string;
  };
}

export interface UserRole {
  id: string;
  name: 'student' | 'teacher' | 'admin' | 'enterprise_admin';
  permissions: string[];
}

export class SubscriptionService {
  // Get all available subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/subscriptions/plans');
      return response.data.data;
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      // Return default plans if API call fails
      return Object.values(SUBSCRIPTION_PLANS);
    }
  }

  // Get a specific subscription plan by type
  static async getSubscriptionPlanByType(planType: PlanType): Promise<SubscriptionPlan | undefined> {
    try {
      const plans = await this.getSubscriptionPlans();
      return plans.find(plan => plan.type === planType);
    } catch (error) {
      console.error('Error getting subscription plan:', error);
      // Return default plan if API call fails
      return SUBSCRIPTION_PLANS[planType];
    }
  }

  // Get current user subscription
  static async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      const response = await api.get('/subscriptions/current');
      return response.data.data;
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }

  // Get subscription history
  static async getSubscriptionHistory(): Promise<UserSubscription[]> {
    try {
      const response = await api.get('/subscriptions/history');
      return response.data.data;
    } catch (error) {
      console.error('Error getting subscription history:', error);
      return [];
    }
  }

  // Create a new subscription
  static async createSubscription(
    planType: PlanType,
    billingCycle: 'monthly' | 'annual',
    paymentMethodId?: string
  ): Promise<any> {
    try {
      const response = await api.post('/subscriptions', {
        planType,
        billingCycle,
        paymentMethodId,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Cancel a subscription
  static async cancelSubscription(subscriptionId: string): Promise<UserSubscription> {
    try {
      const response = await api.delete(`/subscriptions/${subscriptionId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Reactivate a subscription
  static async reactivateSubscription(subscriptionId: string): Promise<UserSubscription> {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/reactivate`);
      return response.data.data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // Change subscription plan
  static async changePlan(
    currentSubscriptionId: string,
    newPlanType: PlanType,
    billingCycle: 'monthly' | 'annual',
    paymentMethodId?: string
  ): Promise<any> {
    try {
      const response = await api.post('/subscriptions/change-plan', {
        currentSubscriptionId,
        newPlanType,
        billingCycle,
        paymentMethodId,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error changing subscription plan:', error);
      throw error;
    }
  }

  // Toggle auto-renew
  static async toggleAutoRenew(subscriptionId: string): Promise<UserSubscription> {
    try {
      const response = await api.post(`/subscriptions/${subscriptionId}/toggle-auto-renew`);
      return response.data.data;
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
      throw error;
    }
  }

  // Create payment intent
  static async createPaymentIntent(
    planType: PlanType,
    billingCycle: 'monthly' | 'annual'
  ): Promise<any> {
    try {
      const response = await api.post('/subscriptions/payment-intent', {
        planType,
        billingCycle,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Get payment methods
  static async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await api.get('/subscriptions/payment-methods');
      return response.data.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  // Add payment method
  static async addPaymentMethod(paymentMethodId: string): Promise<any> {
    try {
      const response = await api.post('/subscriptions/payment-methods', {
        paymentMethodId,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Remove payment method
  static async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/subscriptions/payment-methods/${paymentMethodId}`);
      return response.data.data.success;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Check if a feature is available for the current subscription
  static async isFeatureAvailable(featureName: string): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      if (!subscription) {
        // Default to free plan features
        return SUBSCRIPTION_PLANS.free.features.some(feature => 
          feature.toLowerCase().includes(featureName.toLowerCase())
        );
      }

      const plan = await this.getSubscriptionPlanByType(subscription.planType as PlanType);
      if (!plan) {
        return false;
      }

      return plan.features.some(feature => 
        feature.toLowerCase().includes(featureName.toLowerCase())
      );
    } catch (error) {
      console.error('Error checking feature availability:', error);
      return false;
    }
  }

  // Check if usage is within limits for the current subscription
  static async isWithinLimits(resource: string, value: number): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      if (!subscription) {
        // Default to free plan limits
        return value <= SUBSCRIPTION_PLANS.free.limits[resource];
      }

      const plan = await this.getSubscriptionPlanByType(subscription.planType as PlanType);
      if (!plan) {
        return false;
      }

      return value <= plan.limits[resource];
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return false;
    }
  }
}

// Default subscription plans (used as fallback if API fails)
export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  free: {
    id: 'plan_free',
    name: 'Free',
    type: 'free',
    price: 0,
    billingCycle: 'monthly',
    features: [
      'Up to 4 participants',
      '40 minutes per meeting',
      'Basic audio/video quality',
      'Screen sharing',
      'Chat functionality',
    ],
    limits: {
      participants: 4,
      duration: 40,
      recording: 0,
    }
  },
  pro: {
    id: 'plan_pro',
    name: 'Pro',
    type: 'pro',
    price: 15,
    billingCycle: 'monthly',
    features: [
      'Up to 25 participants',
      'Unlimited meeting duration',
      'HD audio/video quality',
      'Advanced screen sharing',
      'Digital whiteboard',
      'Annotation tools',
      'Breakout rooms',
      'Cloud recording (10 hours)',
      'Language teaching tools',
    ],
    limits: {
      participants: 25,
      duration: 24 * 60, // 24 hours
      recording: 10,
    }
  },
  enterprise: {
    id: 'plan_enterprise',
    name: 'Enterprise',
    type: 'enterprise',
    price: 99,
    billingCycle: 'monthly',
    features: [
      'Unlimited participants',
      'Unlimited meeting duration',
      '4K video quality',
      'All Pro features',
      'Custom branding',
      'SSO integration',
      'Dedicated support',
      'Advanced analytics',
      'Custom integrations',
    ],
    limits: {
      participants: 100,
      duration: 24 * 60, // 24 hours
      recording: 100,
    }
  }
};

// Hook for using subscription service in components
export const useSubscription = () => {
  return {
    getPlans: SubscriptionService.getSubscriptionPlans,
    getPlanByType: SubscriptionService.getSubscriptionPlanByType,
    getCurrentSubscription: SubscriptionService.getCurrentSubscription,
    getSubscriptionHistory: SubscriptionService.getSubscriptionHistory,
    createSubscription: SubscriptionService.createSubscription,
    cancelSubscription: SubscriptionService.cancelSubscription,
    reactivateSubscription: SubscriptionService.reactivateSubscription,
    changePlan: SubscriptionService.changePlan,
    toggleAutoRenew: SubscriptionService.toggleAutoRenew,
    createPaymentIntent: SubscriptionService.createPaymentIntent,
    getPaymentMethods: SubscriptionService.getPaymentMethods,
    addPaymentMethod: SubscriptionService.addPaymentMethod,
    removePaymentMethod: SubscriptionService.removePaymentMethod,
    isFeatureAvailable: SubscriptionService.isFeatureAvailable,
    isWithinLimits: SubscriptionService.isWithinLimits,
  };
};