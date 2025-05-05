const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer'],
      required: true,
    },
    // Stripe-specific fields
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    stripeChargeId: {
      type: String,
      sparse: true,
    },
    // PayPal-specific fields
    paypalTransactionId: {
      type: String,
      sparse: true,
    },
    // Receipt and invoice
    receiptUrl: {
      type: String,
      sparse: true,
    },
    invoiceId: {
      type: String,
      sparse: true,
    },
    // Metadata
    description: {
      type: String,
      default: 'Subscription payment',
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    // Refund details
    refundedAt: {
      type: Date,
      sparse: true,
    },
    refundReason: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
paymentSchema.index({ paypalTransactionId: 1 }, { sparse: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;