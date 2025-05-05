# ElMeet Subscription Backend Implementation Guide

This document provides a comprehensive guide for implementing the subscription management backend for the ElMeet application.

## Architecture Overview

The backend follows a modular architecture with clear separation of concerns:

1. **API Layer**: Express routes and controllers that handle HTTP requests and responses
2. **Service Layer**: Business logic for subscription management and payment processing
3. **Data Access Layer**: MongoDB models and database operations
4. **Integration Layer**: Stripe API integration for payment processing

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB (v4.4+)
- Stripe account with API keys

### Installation

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and update with your configuration
5. Initialize the database with subscription plans: `node src/scripts/seedPlans.js`
6. Start the server: `npm run dev`

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token
- `GET /api/auth/me`: Get current user information

### Subscription Management

- `GET /api/subscriptions/current`: Get current subscription
- `GET /api/subscriptions/history`: Get subscription history
- `POST /api/subscriptions`: Create a new subscription
- `DELETE /api/subscriptions/:id`: Cancel a subscription
- `POST /api/subscriptions/:id/reactivate`: Reactivate a canceled subscription
- `POST /api/subscriptions/change-plan`: Change subscription plan
- `POST /api/subscriptions/:id/toggle-auto-renew`: Toggle auto-renew setting

### Plans

- `GET /api/subscriptions/plans`: Get all available subscription plans

### Payment Processing

- `POST /api/subscriptions/payment-intent`: Create a payment intent
- `GET /api/subscriptions/payment-methods`: Get saved payment methods
- `POST /api/subscriptions/payment-methods`: Add a payment method
- `DELETE /api/subscriptions/payment-methods/:id`: Remove a payment method

### Webhooks

- `POST /api/webhooks/stripe`: Handle Stripe webhook events

## Database Schema

### User

```javascript
{
  name: String,
  email: String,
  password: String,
  picture: String,
  role: String,
  isEmailVerified: Boolean,
  googleId: String,
  stripeCustomerId: String,
  defaultPaymentMethod: String,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription

```javascript
{
  userId: ObjectId,
  planType: String,
  status: String,
  startDate: Date,
  endDate: Date,
  billingCycle: String,
  autoRenew: Boolean,
  stripeSubscriptionId: String,
  stripePriceId: String,
  stripeCurrentPeriodEnd: Date,
  usage: {
    participants: Number,
    meetingMinutes: Number,
    recordingStorage: Number
  },
  canceledAt: Date,
  cancellationReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Plan

```javascript
{
  name: String,
  type: String,
  description: String,
  features: [String],
  limits: {
    participants: Number,
    duration: Number,
    recording: Number
  },
  pricing: {
    monthly: {
      amount: Number,
      stripePriceId: String
    },
    annual: {
      amount: Number,
      stripePriceId: String
    }
  },
  isActive: Boolean,
  displayOrder: Number,
  metadata: Map,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment

```javascript
{
  userId: ObjectId,
  subscriptionId: ObjectId,
  amount: Number,
  currency: String,
  status: String,
  paymentMethod: String,
  stripePaymentIntentId: String,
  stripeChargeId: String,
  paypalTransactionId: String,
  receiptUrl: String,
  invoiceId: String,
  description: String,
  metadata: Map,
  refundedAt: Date,
  refundReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Stripe Integration

### Setting Up Stripe

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add the secret key to your `.env` file
4. Create products and prices in Stripe (or use the seedPlans.js script)
5. Set up webhook endpoints in the Stripe Dashboard

### Webhook Events

The backend handles the following Stripe webhook events:

- `payment_intent.succeeded`: When a payment is successful
- `payment_intent.payment_failed`: When a payment fails
- `customer.subscription.created`: When a subscription is created
- `customer.subscription.updated`: When a subscription is updated
- `customer.subscription.deleted`: When a subscription is deleted
- `invoice.payment_succeeded`: When an invoice is paid
- `invoice.payment_failed`: When an invoice payment fails

## Security Considerations

1. **Authentication**: JWT-based authentication with secure token handling
2. **Authorization**: Role-based access control for subscription management
3. **Payment Security**: All payment processing is handled by Stripe
4. **Data Protection**: Sensitive payment information is never stored in our database
5. **API Security**: CORS, Helmet, and rate limiting to protect API endpoints

## Testing

1. Unit tests: `npm test`
2. Integration tests: `npm run test:integration`
3. Stripe webhook testing: Use Stripe CLI for local webhook testing

## Deployment

### Production Checklist

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2 or Docker containers
3. Set up proper logging and monitoring
4. Configure a reverse proxy (Nginx, Apache) with SSL
5. Set up database backups
6. Configure Stripe webhooks for production

### Scaling Considerations

1. Use a MongoDB replica set for database redundancy
2. Implement caching for frequently accessed data
3. Consider using a message queue for webhook processing
4. Set up horizontal scaling for the API servers

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**: Check that your webhook secret is correct
2. **Payment Processing Errors**: Check Stripe Dashboard for detailed error information
3. **Subscription Status Inconsistencies**: Verify webhook events are being processed correctly

### Debugging

1. Check application logs for error messages
2. Use Stripe Dashboard to inspect payment and subscription status
3. Verify database records for consistency

## Future Enhancements

1. **Multi-currency Support**: Add support for different currencies
2. **Tax Calculation**: Integrate with a tax calculation service
3. **Promotional Codes**: Implement discount codes and promotions
4. **Usage-based Billing**: Charge based on actual resource usage
5. **Subscription Analytics**: Advanced reporting on subscription metrics