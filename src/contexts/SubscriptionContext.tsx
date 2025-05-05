import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { SubscriptionService, SUBSCRIPTION_PLANS as DEFAULT_PLANS } from '../services/SubscriptionService';

// Subscription plan types
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  limits: {
    participants: number;
    duration: number; // in minutes
    recording: number; // in GB
    [key: string]: any;
  };
}

export interface Subscription {
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

// Export default plans for use elsewhere
export const SUBSCRIPTION_PLANS = DEFAULT_PLANS;

interface SubscriptionContextType {
  currentSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  availablePlans: SubscriptionPlan[];
  getCurrentPlan: () => SubscriptionPlan;
  isFeatureAvailable: (featureName: string) => boolean;
  isWithinLimits: (resource: string, value: number) => boolean;
  upgradePlan: (planType: PlanType, billingCycle: 'monthly' | 'annual', paymentMethodId?: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  updatePaymentMethod: (paymentDetails: any) => Promise<void>;
  toggleAutoRenew: () => Promise<void>;
  getPaymentMethods: () => Promise<any[]>;
  addPaymentMethod: (paymentMethodId: string) => Promise<any>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>(
    Object.values(DEFAULT_PLANS)
  );

  // Load subscription data from API
  useEffect(() => {
    const loadSubscription = async () => {
      if (!isAuthenticated || !user) {
        setCurrentSubscription(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch current subscription from API
        const subscription = await SubscriptionService.getCurrentSubscription();
        setCurrentSubscription(subscription);
        
        // Fetch available plans
        const plans = await SubscriptionService.getSubscriptionPlans();
        setAvailablePlans(plans);
      } catch (err: any) {
        console.error('Error loading subscription:', err);
        setError('Failed to load subscription information');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, [user, isAuthenticated]);

  // Get the current plan details
  const getCurrentPlan = (): SubscriptionPlan => {
    if (!currentSubscription) {
      return DEFAULT_PLANS.free;
    }
    
    const plan = availablePlans.find(p => p.type === currentSubscription.planType);
    return plan || DEFAULT_PLANS.free;
  };

  // Check if a specific feature is available in the current plan
  const isFeatureAvailable = (featureName: string): boolean => {
    const currentPlan = getCurrentPlan();
    return currentPlan.features.some(feature => 
      feature.toLowerCase().includes(featureName.toLowerCase())
    );
  };

  // Check if usage is within plan limits
  const isWithinLimits = (resource: string, value: number): boolean => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan.limits[resource]) {
      return false;
    }
    return value <= currentPlan.limits[resource];
  };

  // Upgrade to a new plan
  const upgradePlan = async (
    planType: PlanType, 
    billingCycle: 'monthly' | 'annual',
    paymentMethodId?: string
  ): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to upgrade your plan');
    }

    setIsLoading(true);
    setError(null);

    try {
      if (currentSubscription) {
        // Change existing subscription
        await SubscriptionService.changePlan(
          currentSubscription.id,
          planType,
          billingCycle,
          paymentMethodId
        );
      } else {
        // Create new subscription
        await SubscriptionService.createSubscription(
          planType,
          billingCycle,
          paymentMethodId
        );
      }
      
      // Refresh subscription data
      const updatedSubscription = await SubscriptionService.getCurrentSubscription();
      setCurrentSubscription(updatedSubscription);
      
      console.log(`Plan upgraded to ${planType} with ${billingCycle} billing`);
    } catch (err: any) {
      console.error('Error upgrading plan:', err);
      setError('Failed to upgrade plan. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (): Promise<void> => {
    if (!user || !currentSubscription) {
      throw new Error('No active subscription to cancel');
    }

    setIsLoading(true);
    setError(null);

    try {
      await SubscriptionService.cancelSubscription(currentSubscription.id);
      
      // Refresh subscription data
      const updatedSubscription = await SubscriptionService.getCurrentSubscription();
      setCurrentSubscription(updatedSubscription);
      
      console.log('Subscription canceled');
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError('Failed to cancel subscription. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async (): Promise<void> => {
    if (!user || !currentSubscription) {
      throw new Error('No subscription to reactivate');
    }

    setIsLoading(true);
    setError(null);

    try {
      await SubscriptionService.reactivateSubscription(currentSubscription.id);
      
      // Refresh subscription data
      const updatedSubscription = await SubscriptionService.getCurrentSubscription();
      setCurrentSubscription(updatedSubscription);
      
      console.log('Subscription reactivated');
    } catch (err: any) {
      console.error('Error reactivating subscription:', err);
      setError('Failed to reactivate subscription. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update payment method
  const updatePaymentMethod = async (paymentDetails: any): Promise<void> => {
    if (!user) {
      throw new Error('You must be logged in to update payment method');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add new payment method
      await SubscriptionService.addPaymentMethod(paymentDetails.id);
      
      // Refresh subscription data
      const updatedSubscription = await SubscriptionService.getCurrentSubscription();
      setCurrentSubscription(updatedSubscription);
      
      console.log('Payment method updated');
    } catch (err: any) {
      console.error('Error updating payment method:', err);
      setError('Failed to update payment method. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle auto-renew
  const toggleAutoRenew = async (): Promise<void> => {
    if (!user || !currentSubscription) {
      throw new Error('No active subscription');
    }

    setIsLoading(true);
    setError(null);

    try {
      await SubscriptionService.toggleAutoRenew(currentSubscription.id);
      
      // Refresh subscription data
      const updatedSubscription = await SubscriptionService.getCurrentSubscription();
      setCurrentSubscription(updatedSubscription);
      
      console.log(`Auto-renew ${!currentSubscription.autoRenew ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      console.error('Error toggling auto-renew:', err);
      setError('Failed to update auto-renew setting. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get payment methods
  const getPaymentMethods = async (): Promise<any[]> => {
    try {
      return await SubscriptionService.getPaymentMethods();
    } catch (err: any) {
      console.error('Error getting payment methods:', err);
      setError('Failed to get payment methods. Please try again.');
      return [];
    }
  };

  // Add payment method
  const addPaymentMethod = async (paymentMethodId: string): Promise<any> => {
    try {
      return await SubscriptionService.addPaymentMethod(paymentMethodId);
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError('Failed to add payment method. Please try again.');
      throw err;
    }
  };

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    try {
      return await SubscriptionService.removePaymentMethod(paymentMethodId);
    } catch (err: any) {
      console.error('Error removing payment method:', err);
      setError('Failed to remove payment method. Please try again.');
      throw err;
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      currentSubscription,
      isLoading,
      error,
      availablePlans,
      getCurrentPlan,
      isFeatureAvailable,
      isWithinLimits,
      upgradePlan,
      cancelSubscription,
      reactivateSubscription,
      updatePaymentMethod,
      toggleAutoRenew,
      getPaymentMethods,
      addPaymentMethod,
      removePaymentMethod
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use the subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};