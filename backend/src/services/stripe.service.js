const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user.model');
const Plan = require('../models/plan.model');
const Subscription = require('../models/subscription.model');
const Payment = require('../models/payment.model');
const logger = require('../utils/logger');

/**
 * Create or retrieve a Stripe customer for a user
 * @param {Object} user - User document
 * @returns {Promise<string>} Stripe customer ID
 */
const getCustomerForUser = async (user) => {
  // If user already has a Stripe customer ID, return it
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user._id.toString(),
    },
  });

  // Update user with Stripe customer ID
  await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });

  return customer.id;
};

/**
 * Create a payment intent for subscription checkout
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} Payment intent details
 */
const createPaymentIntent = async ({ userId, planType, billingCycle }) => {
  try {
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get plan
    const plan = await Plan.findOne({ type: planType });
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Get or create Stripe customer
    const customerId = await getCustomerForUser(user);

    // Calculate amount based on billing cycle
    const amount = billingCycle === 'annual' 
      ? plan.pricing.annual.amount 
      : plan.pricing.monthly.amount;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        userId: user._id.toString(),
        planType,
        billingCycle,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
    };
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Create a subscription in Stripe
 * @param {Object} params - Subscription parameters
 * @returns {Promise<Object>} Stripe subscription
 */
const createSubscription = async ({ userId, planType, billingCycle, paymentMethodId }) => {
  try {
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get plan
    const plan = await Plan.findOne({ type: planType });
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Get or create Stripe customer
    const customerId = await getCustomerForUser(user);

    // Attach payment method to customer if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update user's default payment method
      await User.findByIdAndUpdate(userId, { defaultPaymentMethod: paymentMethodId });
    }

    // Get price ID based on plan and billing cycle
    const priceId = billingCycle === 'annual'
      ? plan.pricing.annual.stripePriceId
      : plan.pricing.monthly.stripePriceId;

    // For free plan, we don't create a Stripe subscription
    if (planType === 'free') {
      return { type: 'free' };
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user._id.toString(),
        planType,
        billingCycle,
      },
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      status: subscription.status,
    };
  } catch (error) {
    logger.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Cancel a subscription in Stripe
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Canceled subscription
 */
const cancelSubscription = async (subscriptionId) => {
  try {
    // Get subscription from our database
    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel at period end to allow access until the end of the billing period
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update our database
    await Subscription.findByIdAndUpdate(subscription._id, {
      status: 'canceled',
      autoRenew: false,
      canceledAt: new Date(),
    });

    return canceledSubscription;
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * Reactivate a canceled subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Reactivated subscription
 */
const reactivateSubscription = async (subscriptionId) => {
  try {
    // Get subscription from our database
    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Remove the cancellation at period end
    const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update our database
    await Subscription.findByIdAndUpdate(subscription._id, {
      status: 'active',
      autoRenew: true,
      canceledAt: null,
    });

    return reactivatedSubscription;
  } catch (error) {
    logger.error('Error reactivating subscription:', error);
    throw error;
  }
};

/**
 * Get payment methods for a customer
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Payment methods
 */
const getPaymentMethods = async (userId) => {
  try {
    // Get user
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return [];
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    logger.error('Error getting payment methods:', error);
    throw error;
  }
};

/**
 * Add a payment method for a customer
 * @param {Object} params - Payment method parameters
 * @returns {Promise<Object>} Added payment method
 */
const addPaymentMethod = async ({ userId, paymentMethodId }) => {
  try {
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get or create Stripe customer
    const customerId = await getCustomerForUser(user);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update user's default payment method
    await User.findByIdAndUpdate(userId, { defaultPaymentMethod: paymentMethodId });

    // Get the payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return paymentMethod;
  } catch (error) {
    logger.error('Error adding payment method:', error);
    throw error;
  }
};

/**
 * Remove a payment method
 * @param {Object} params - Payment method parameters
 * @returns {Promise<boolean>} Success status
 */
const removePaymentMethod = async ({ userId, paymentMethodId }) => {
  try {
    // Get user
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      throw new Error('User not found or no Stripe customer');
    }

    // Check if this is the default payment method
    if (user.defaultPaymentMethod === paymentMethodId) {
      // Get other payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      // Find another payment method to set as default
      const otherPaymentMethod = paymentMethods.data.find(pm => pm.id !== paymentMethodId);
      
      if (otherPaymentMethod) {
        // Set new default payment method
        await stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: otherPaymentMethod.id,
          },
        });

        // Update user's default payment method
        await User.findByIdAndUpdate(userId, { defaultPaymentMethod: otherPaymentMethod.id });
      } else {
        // No other payment methods, clear default
        await User.findByIdAndUpdate(userId, { defaultPaymentMethod: null });
      }
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    return true;
  } catch (error) {
    logger.error('Error removing payment method:', error);
    throw error;
  }
};

/**
 * Process a webhook event from Stripe
 * @param {Object} event - Stripe event
 * @returns {Promise<void>}
 */
const handleWebhookEvent = async (event) => {
  try {
    const { type, data } = event;

    switch (type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(data.object);
        break;
      default:
        logger.info(`Unhandled event type: ${type}`);
    }
  } catch (error) {
    logger.error('Error handling webhook event:', error);
    throw error;
  }
};

/**
 * Handle payment intent succeeded event
 * @param {Object} paymentIntent - Stripe payment intent
 * @returns {Promise<void>}
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const { metadata, amount, id, customer } = paymentIntent;
    
    // If no metadata, this might not be related to our subscriptions
    if (!metadata || !metadata.userId) {
      return;
    }

    // Get user
    const user = await User.findById(metadata.userId);
    if (!user) {
      logger.error(`User not found for payment intent: ${id}`);
      return;
    }

    // Get subscription
    const subscription = await Subscription.findOne({ userId: metadata.userId, status: 'active' });
    
    // Create payment record
    await Payment.create({
      userId: metadata.userId,
      subscriptionId: subscription ? subscription._id : null,
      amount: amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: 'succeeded',
      paymentMethod: 'credit_card', // Assuming credit card
      stripePaymentIntentId: id,
      stripeChargeId: paymentIntent.charges.data[0]?.id,
      receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
      description: `Payment for ${metadata.planType} plan (${metadata.billingCycle})`,
      metadata: metadata,
    });

    logger.info(`Payment succeeded for user ${metadata.userId}`);
  } catch (error) {
    logger.error('Error handling payment intent succeeded:', error);
  }
};

/**
 * Handle payment intent failed event
 * @param {Object} paymentIntent - Stripe payment intent
 * @returns {Promise<void>}
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const { metadata, amount, id } = paymentIntent;
    
    // If no metadata, this might not be related to our subscriptions
    if (!metadata || !metadata.userId) {
      return;
    }

    // Create payment record
    await Payment.create({
      userId: metadata.userId,
      amount: amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: 'failed',
      paymentMethod: 'credit_card', // Assuming credit card
      stripePaymentIntentId: id,
      description: `Failed payment for ${metadata.planType} plan (${metadata.billingCycle})`,
      metadata: metadata,
    });

    logger.info(`Payment failed for user ${metadata.userId}`);
  } catch (error) {
    logger.error('Error handling payment intent failed:', error);
  }
};

/**
 * Handle subscription created event
 * @param {Object} subscription - Stripe subscription
 * @returns {Promise<void>}
 */
const handleSubscriptionCreated = async (subscription) => {
  try {
    const { metadata, id, current_period_end, status, items } = subscription;
    
    // If no metadata, this might not be related to our subscriptions
    if (!metadata || !metadata.userId) {
      return;
    }

    // Get plan type from metadata
    const { planType, billingCycle } = metadata;
    
    // Get plan
    const plan = await Plan.findOne({ type: planType });
    if (!plan) {
      logger.error(`Plan not found for subscription: ${id}`);
      return;
    }

    // Calculate end date
    const endDate = new Date(current_period_end * 1000); // Convert from Unix timestamp

    // Create subscription in our database
    await Subscription.create({
      userId: metadata.userId,
      planType,
      status: status === 'active' ? 'active' : 'trial',
      startDate: new Date(),
      endDate,
      billingCycle,
      autoRenew: true,
      stripeSubscriptionId: id,
      stripePriceId: items.data[0]?.price.id,
      stripeCurrentPeriodEnd: endDate,
    });

    logger.info(`Subscription created for user ${metadata.userId}`);
  } catch (error) {
    logger.error('Error handling subscription created:', error);
  }
};

/**
 * Handle subscription updated event
 * @param {Object} subscription - Stripe subscription
 * @returns {Promise<void>}
 */
const handleSubscriptionUpdated = async (subscription) => {
  try {
    const { id, current_period_end, status, cancel_at_period_end } = subscription;
    
    // Find subscription in our database
    const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: id });
    if (!dbSubscription) {
      logger.error(`Subscription not found for Stripe subscription: ${id}`);
      return;
    }

    // Calculate end date
    const endDate = new Date(current_period_end * 1000); // Convert from Unix timestamp

    // Update subscription
    await Subscription.findByIdAndUpdate(dbSubscription._id, {
      status: status === 'active' ? 'active' : 
             status === 'canceled' ? 'canceled' : 
             status === 'past_due' ? 'past_due' : 'expired',
      endDate,
      autoRenew: !cancel_at_period_end,
      stripeCurrentPeriodEnd: endDate,
      canceledAt: cancel_at_period_end ? new Date() : null,
    });

    logger.info(`Subscription updated for user ${dbSubscription.userId}`);
  } catch (error) {
    logger.error('Error handling subscription updated:', error);
  }
};

/**
 * Handle subscription deleted event
 * @param {Object} subscription - Stripe subscription
 * @returns {Promise<void>}
 */
const handleSubscriptionDeleted = async (subscription) => {
  try {
    const { id } = subscription;
    
    // Find subscription in our database
    const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: id });
    if (!dbSubscription) {
      logger.error(`Subscription not found for Stripe subscription: ${id}`);
      return;
    }

    // Update subscription
    await Subscription.findByIdAndUpdate(dbSubscription._id, {
      status: 'expired',
      autoRenew: false,
      canceledAt: new Date(),
    });

    logger.info(`Subscription deleted for user ${dbSubscription.userId}`);
  } catch (error) {
    logger.error('Error handling subscription deleted:', error);
  }
};

/**
 * Handle invoice payment succeeded event
 * @param {Object} invoice - Stripe invoice
 * @returns {Promise<void>}
 */
const handleInvoicePaymentSucceeded = async (invoice) => {
  try {
    const { subscription, customer, amount_paid, id } = invoice;
    
    // If no subscription, this might not be related to our subscriptions
    if (!subscription) {
      return;
    }

    // Find subscription in our database
    const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription });
    if (!dbSubscription) {
      logger.error(`Subscription not found for Stripe subscription: ${subscription}`);
      return;
    }

    // Get user
    const user = await User.findById(dbSubscription.userId);
    if (!user) {
      logger.error(`User not found for subscription: ${dbSubscription._id}`);
      return;
    }

    // Create payment record
    await Payment.create({
      userId: dbSubscription.userId,
      subscriptionId: dbSubscription._id,
      amount: amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: 'succeeded',
      paymentMethod: 'credit_card', // Assuming credit card
      stripePaymentIntentId: invoice.payment_intent,
      invoiceId: id,
      description: `Invoice payment for ${dbSubscription.planType} plan`,
    });

    // Update subscription end date
    const endDate = new Date(invoice.lines.data[0]?.period.end * 1000);
    await Subscription.findByIdAndUpdate(dbSubscription._id, {
      status: 'active',
      endDate,
      stripeCurrentPeriodEnd: endDate,
    });

    logger.info(`Invoice payment succeeded for user ${dbSubscription.userId}`);
  } catch (error) {
    logger.error('Error handling invoice payment succeeded:', error);
  }
};

/**
 * Handle invoice payment failed event
 * @param {Object} invoice - Stripe invoice
 * @returns {Promise<void>}
 */
const handleInvoicePaymentFailed = async (invoice) => {
  try {
    const { subscription, customer, amount_due, id } = invoice;
    
    // If no subscription, this might not be related to our subscriptions
    if (!subscription) {
      return;
    }

    // Find subscription in our database
    const dbSubscription = await Subscription.findOne({ stripeSubscriptionId: subscription });
    if (!dbSubscription) {
      logger.error(`Subscription not found for Stripe subscription: ${subscription}`);
      return;
    }

    // Create payment record
    await Payment.create({
      userId: dbSubscription.userId,
      subscriptionId: dbSubscription._id,
      amount: amount_due / 100, // Convert from cents
      currency: invoice.currency,
      status: 'failed',
      paymentMethod: 'credit_card', // Assuming credit card
      stripePaymentIntentId: invoice.payment_intent,
      invoiceId: id,
      description: `Failed invoice payment for ${dbSubscription.planType} plan`,
    });

    // Update subscription status
    await Subscription.findByIdAndUpdate(dbSubscription._id, {
      status: 'past_due',
    });

    logger.info(`Invoice payment failed for user ${dbSubscription.userId}`);
  } catch (error) {
    logger.error('Error handling invoice payment failed:', error);
  }
};

module.exports = {
  getCustomerForUser,
  createPaymentIntent,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  handleWebhookEvent,
};