const Subscription = require('../models/subscription.model');
const Plan = require('../models/plan.model');
const User = require('../models/user.model');
const stripeService = require('./stripe.service');
const logger = require('../utils/logger');

/**
 * Get active subscription for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription document
 */
const getActiveSubscription = async (userId) => {
  try {
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trial'] },
    }).sort({ createdAt: -1 });

    return subscription;
  } catch (error) {
    logger.error('Error getting active subscription:', error);
    throw error;
  }
};

/**
 * Get all subscriptions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Subscription documents
 */
const getUserSubscriptions = async (userId) => {
  try {
    const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });
    return subscriptions;
  } catch (error) {
    logger.error('Error getting user subscriptions:', error);
    throw error;
  }
};

/**
 * Create a new subscription
 * @param {Object} params - Subscription parameters
 * @returns {Promise<Object>} Created subscription
 */
const createSubscription = async ({ userId, planType, billingCycle, paymentMethodId }) => {
  try {
    // Check if user already has an active subscription
    const existingSubscription = await getActiveSubscription(userId);
    if (existingSubscription) {
      // If upgrading to the same or lower plan, return error
      if (
        planType === existingSubscription.planType ||
        (planType === 'free' && existingSubscription.planType !== 'free')
      ) {
        throw new Error('User already has an active subscription to this plan or a higher plan');
      }
    }

    // Get plan
    const plan = await Plan.findOne({ type: planType });
    if (!plan) {
      throw new Error('Plan not found');
    }

    // For free plan, create subscription directly
    if (planType === 'free') {
      // Calculate end date (1 year from now)
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const subscription = await Subscription.create({
        userId,
        planType,
        status: 'active',
        startDate: new Date(),
        endDate,
        billingCycle: 'monthly', // Default for free plan
        autoRenew: true,
      });

      return subscription;
    }

    // For paid plans, create subscription in Stripe
    const stripeSubscription = await stripeService.createSubscription({
      userId,
      planType,
      billingCycle,
      paymentMethodId,
    });

    // If Stripe subscription creation was successful, create in our database
    if (stripeSubscription.subscriptionId) {
      // Calculate end date based on billing cycle
      const endDate = new Date();
      if (billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const subscription = await Subscription.create({
        userId,
        planType,
        status: 'active',
        startDate: new Date(),
        endDate,
        billingCycle,
        autoRenew: true,
        stripeSubscriptionId: stripeSubscription.subscriptionId,
      });

      return {
        subscription,
        clientSecret: stripeSubscription.clientSecret,
      };
    }

    return stripeSubscription;
  } catch (error) {
    logger.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated subscription
 */
const cancelSubscription = async (subscriptionId, userId) => {
  try {
    // Get subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if user owns the subscription
    if (subscription.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    // Check if subscription is already canceled
    if (subscription.status === 'canceled' || subscription.status === 'expired') {
      throw new Error('Subscription is already canceled or expired');
    }

    // For Stripe subscriptions, cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    } else {
      // For free subscriptions, update directly
      subscription.status = 'canceled';
      subscription.autoRenew = false;
      subscription.canceledAt = new Date();
      await subscription.save();
    }

    return subscription;
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Reactivate a canceled subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated subscription
 */
const reactivateSubscription = async (subscriptionId, userId) => {
  try {
    // Get subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if user owns the subscription
    if (subscription.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    // Check if subscription is canceled and not expired
    if (subscription.status !== 'canceled' || new Date() > subscription.endDate) {
      throw new Error('Subscription cannot be reactivated');
    }

    // For Stripe subscriptions, reactivate in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripeService.reactivateSubscription(subscription.stripeSubscriptionId);
    } else {
      // For free subscriptions, update directly
      subscription.status = 'active';
      subscription.autoRenew = true;
      subscription.canceledAt = null;
      await subscription.save();
    }

    return subscription;
  } catch (error) {
    logger.error('Error reactivating subscription:', error);
    throw error;
  }
};

/**
 * Change subscription plan
 * @param {Object} params - Change plan parameters
 * @returns {Promise<Object>} New subscription
 */
const changePlan = async ({ userId, currentSubscriptionId, newPlanType, billingCycle, paymentMethodId }) => {
  try {
    // Get current subscription
    const currentSubscription = await Subscription.findById(currentSubscriptionId);
    if (!currentSubscription) {
      throw new Error('Current subscription not found');
    }

    // Check if user owns the subscription
    if (currentSubscription.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    // If downgrading to free plan
    if (newPlanType === 'free' && currentSubscription.planType !== 'free') {
      // Cancel current subscription
      await cancelSubscription(currentSubscriptionId, userId);

      // Create new free subscription
      return await createSubscription({
        userId,
        planType: 'free',
        billingCycle: 'monthly',
      });
    }

    // If upgrading from free to paid plan
    if (currentSubscription.planType === 'free' && newPlanType !== 'free') {
      // Cancel current subscription
      await cancelSubscription(currentSubscriptionId, userId);

      // Create new paid subscription
      return await createSubscription({
        userId,
        planType: newPlanType,
        billingCycle,
        paymentMethodId,
      });
    }

    // If changing between paid plans, handle through Stripe
    // This would typically involve creating a new subscription and canceling the old one
    // or updating the existing subscription with a proration
    throw new Error('Changing between paid plans is not implemented yet');
  } catch (error) {
    logger.error('Error changing subscription plan:', error);
    throw error;
  }
};

/**
 * Toggle auto-renew for a subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated subscription
 */
const toggleAutoRenew = async (subscriptionId, userId) => {
  try {
    // Get subscription
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Check if user owns the subscription
    if (subscription.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    // Toggle auto-renew
    subscription.autoRenew = !subscription.autoRenew;

    // For Stripe subscriptions, update in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    }

    // Save changes
    await subscription.save();

    return subscription;
  } catch (error) {
    logger.error('Error toggling auto-renew:', error);
    throw error;
  }
};

/**
 * Check if a feature is available for a user's subscription
 * @param {string} userId - User ID
 * @param {string} featureName - Feature name
 * @returns {Promise<boolean>} Whether the feature is available
 */
const isFeatureAvailable = async (userId, featureName) => {
  try {
    // Get active subscription
    const subscription = await getActiveSubscription(userId);
    if (!subscription) {
      // Default to free plan features
      const freePlan = await Plan.findOne({ type: 'free' });
      return freePlan.features.some(feature => 
        feature.toLowerCase().includes(featureName.toLowerCase())
      );
    }

    // Get plan
    const plan = await Plan.findOne({ type: subscription.planType });
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if feature is available
    return plan.features.some(feature => 
      feature.toLowerCase().includes(featureName.toLowerCase())
    );
  } catch (error) {
    logger.error('Error checking feature availability:', error);
    throw error;
  }
};

/**
 * Check if usage is within limits for a user's subscription
 * @param {string} userId - User ID
 * @param {string} resource - Resource name (participants, duration, recording)
 * @param {number} value - Resource value
 * @returns {Promise<boolean>} Whether the usage is within limits
 */
const isWithinLimits = async (userId, resource, value) => {
  try {
    // Get active subscription
    const subscription = await getActiveSubscription(userId);
    if (!subscription) {
      // Default to free plan limits
      const freePlan = await Plan.findOne({ type: 'free' });
      return value <= freePlan.limits[resource];
    }

    // Get plan
    const plan = await Plan.findOne({ type: subscription.planType });
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if usage is within limits
    return value <= plan.limits[resource];
  } catch (error) {
    logger.error('Error checking usage limits:', error);
    throw error;
  }
};

/**
 * Track resource usage for a user
 * @param {string} userId - User ID
 * @param {string} resource - Resource name (participants, meetingMinutes, recordingStorage)
 * @param {number} value - Resource value to add
 * @returns {Promise<boolean>} Success status
 */
const trackUsage = async (userId, resource, value) => {
  try {
    // Get active subscription
    const subscription = await getActiveSubscription(userId);
    if (!subscription) {
      return false;
    }

    // Update usage
    if (!subscription.usage[resource] && subscription.usage[resource] !== 0) {
      return false;
    }

    subscription.usage[resource] += value;
    await subscription.save();

    return true;
  } catch (error) {
    logger.error('Error tracking usage:', error);
    throw error;
  }
};

/**
 * Get all available subscription plans
 * @returns {Promise<Array>} Plan documents
 */
const getAvailablePlans = async () => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ displayOrder: 1 });
    return plans;
  } catch (error) {
    logger.error('Error getting available plans:', error);
    throw error;
  }
};

module.exports = {
  getActiveSubscription,
  getUserSubscriptions,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  changePlan,
  toggleAutoRenew,
  isFeatureAvailable,
  isWithinLimits,
  trackUsage,
  getAvailablePlans,
};