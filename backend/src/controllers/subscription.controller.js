const subscriptionService = require('../services/subscription.service');
const stripeService = require('../services/stripe.service');
const logger = require('../utils/logger');

/**
 * Get current subscription for authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await subscriptionService.getActiveSubscription(userId);
    
    res.status(200).json({
      success: true,
      data: subscription || null,
    });
  } catch (error) {
    logger.error('Error getting current subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current subscription',
    });
  }
};

/**
 * Get subscription history for authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptions = await subscriptionService.getUserSubscriptions(userId);
    
    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    logger.error('Error getting subscription history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription history',
    });
  }
};

/**
 * Create a new subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planType, billingCycle, paymentMethodId } = req.body;
    
    // Validate input
    if (!planType || (planType !== 'free' && (!billingCycle || !paymentMethodId))) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    const result = await subscriptionService.createSubscription({
      userId,
      planType,
      billingCycle,
      paymentMethodId,
    });
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create subscription',
    });
  }
};

/**
 * Cancel a subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.params;
    
    const result = await subscriptionService.cancelSubscription(subscriptionId, userId);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel subscription',
    });
  }
};

/**
 * Reactivate a canceled subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const reactivateSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.params;
    
    const result = await subscriptionService.reactivateSubscription(subscriptionId, userId);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reactivate subscription',
    });
  }
};

/**
 * Change subscription plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const changePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentSubscriptionId, newPlanType, billingCycle, paymentMethodId } = req.body;
    
    // Validate input
    if (!currentSubscriptionId || !newPlanType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    const result = await subscriptionService.changePlan({
      userId,
      currentSubscriptionId,
      newPlanType,
      billingCycle,
      paymentMethodId,
    });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error changing subscription plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to change subscription plan',
    });
  }
};

/**
 * Toggle auto-renew for a subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const toggleAutoRenew = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.params;
    
    const result = await subscriptionService.toggleAutoRenew(subscriptionId, userId);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error toggling auto-renew:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle auto-renew',
    });
  }
};

/**
 * Get all available subscription plans
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getAvailablePlans = async (req, res) => {
  try {
    const plans = await subscriptionService.getAvailablePlans();
    
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    logger.error('Error getting available plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available plans',
    });
  }
};

/**
 * Create a payment intent for checkout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planType, billingCycle } = req.body;
    
    // Validate input
    if (!planType || !billingCycle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    const result = await stripeService.createPaymentIntent({
      userId,
      planType,
      billingCycle,
    });
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent',
    });
  }
};

/**
 * Get payment methods for authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethods = await stripeService.getPaymentMethods(userId);
    
    res.status(200).json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    logger.error('Error getting payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment methods',
    });
  }
};

/**
 * Add a payment method for authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;
    
    // Validate input
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment method ID',
      });
    }
    
    const result = await stripeService.addPaymentMethod({
      userId,
      paymentMethodId,
    });
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error adding payment method:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add payment method',
    });
  }
};

/**
 * Remove a payment method
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const removePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.params;
    
    const result = await stripeService.removePaymentMethod({
      userId,
      paymentMethodId,
    });
    
    res.status(200).json({
      success: true,
      data: { success: result },
    });
  } catch (error) {
    logger.error('Error removing payment method:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove payment method',
    });
  }
};

module.exports = {
  getCurrentSubscription,
  getSubscriptionHistory,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  changePlan,
  toggleAutoRenew,
  getAvailablePlans,
  createPaymentIntent,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
};