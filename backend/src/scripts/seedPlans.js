require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/plan.model');
const logger = require('../utils/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Define subscription plans
const plans = [
  {
    name: 'Free',
    type: 'free',
    description: 'Perfect for trying out the platform',
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
    },
    pricing: {
      monthly: {
        amount: 0,
      },
      annual: {
        amount: 0,
      },
    },
    isActive: true,
    displayOrder: 1,
  },
  {
    name: 'Pro',
    type: 'pro',
    description: 'For professional educators and small teams',
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
      recording: 10 * 1024, // 10 GB in MB
    },
    pricing: {
      monthly: {
        amount: 15,
      },
      annual: {
        amount: 144, // 12 * 15 * 0.8 (20% discount)
      },
    },
    isActive: true,
    displayOrder: 2,
  },
  {
    name: 'Enterprise',
    type: 'enterprise',
    description: 'For educational institutions and organizations',
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
      recording: 100 * 1024, // 100 GB in MB
    },
    pricing: {
      monthly: {
        amount: 99,
      },
      annual: {
        amount: 950, // 12 * 99 * 0.8 (20% discount)
      },
    },
    isActive: true,
    displayOrder: 3,
  },
];

// Create Stripe products and prices
const createStripeProductsAndPrices = async () => {
  try {
    for (const plan of plans) {
      // Skip free plan
      if (plan.type === 'free') {
        continue;
      }

      // Create or update product
      const product = await stripe.products.create({
        name: `ElMeet ${plan.name}`,
        description: plan.description,
        metadata: {
          planType: plan.type,
        },
      });

      logger.info(`Created Stripe product for ${plan.name} plan`);

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.pricing.monthly.amount * 100, // Convert to cents
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          planType: plan.type,
          billingCycle: 'monthly',
        },
      });

      // Create annual price
      const annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.pricing.annual.amount * 100, // Convert to cents
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        metadata: {
          planType: plan.type,
          billingCycle: 'annual',
        },
      });

      logger.info(`Created Stripe prices for ${plan.name} plan`);

      // Update plan with Stripe price IDs
      plan.pricing.monthly.stripePriceId = monthlyPrice.id;
      plan.pricing.annual.stripePriceId = annualPrice.id;
    }

    return plans;
  } catch (error) {
    logger.error('Error creating Stripe products and prices:', error);
    throw error;
  }
};

// Seed plans to database
const seedPlans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Create Stripe products and prices
    const plansWithStripeIds = await createStripeProductsAndPrices();

    // Delete existing plans
    await Plan.deleteMany({});
    logger.info('Deleted existing plans');

    // Create new plans
    await Plan.insertMany(plansWithStripeIds);
    logger.info('Created new plans');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');

    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding plans:', error);
    process.exit(1);
  }
};

// Run the seed function
seedPlans();