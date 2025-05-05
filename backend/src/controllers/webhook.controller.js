const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripeService = require('../services/stripe.service');
const logger = require('../utils/logger');

/**
 * Handle Stripe webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Log webhook event
    logger.info(`Received Stripe webhook: ${event.type}`);
    
    // Process the event
    await stripeService.handleWebhookEvent(event);
    
    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error handling Stripe webhook:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  handleStripeWebhook,
};