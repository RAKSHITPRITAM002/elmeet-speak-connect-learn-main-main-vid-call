const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      required: true,
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired', 'trial', 'past_due'],
      required: true,
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly',
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    // Stripe-specific fields
    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
    stripePriceId: {
      type: String,
      sparse: true,
    },
    stripeCurrentPeriodEnd: {
      type: Date,
      sparse: true,
    },
    // Usage tracking
    usage: {
      participants: {
        type: Number,
        default: 0,
      },
      meetingMinutes: {
        type: Number,
        default: 0,
      },
      recordingStorage: {
        type: Number, // in MB
        default: 0,
      },
    },
    // Cancellation details
    canceledAt: {
      type: Date,
      sparse: true,
    },
    cancellationReason: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function () {
  return (
    this.status === 'active' &&
    this.endDate > new Date() &&
    (!this.canceledAt || this.autoRenew)
  );
});

// Method to check if usage is within limits
subscriptionSchema.methods.isWithinLimits = function (resource, value) {
  const limits = {
    free: {
      participants: 4,
      meetingMinutes: 40,
      recordingStorage: 0,
    },
    pro: {
      participants: 25,
      meetingMinutes: 24 * 60, // 24 hours
      recordingStorage: 10 * 1024, // 10 GB in MB
    },
    enterprise: {
      participants: 100,
      meetingMinutes: 24 * 60, // 24 hours
      recordingStorage: 100 * 1024, // 100 GB in MB
    },
  };

  const planLimits = limits[this.planType];
  if (!planLimits || !planLimits[resource]) {
    return false;
  }

  return value <= planLimits[resource];
};

// Method to track usage
subscriptionSchema.methods.trackUsage = async function (resource, value) {
  if (!this.usage[resource] && this.usage[resource] !== 0) {
    return false;
  }

  this.usage[resource] += value;
  await this.save();
  return true;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;