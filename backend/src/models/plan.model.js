const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
    limits: {
      participants: {
        type: Number,
        required: true,
      },
      duration: {
        type: Number, // in minutes
        required: true,
      },
      recording: {
        type: Number, // in GB
        required: true,
      },
    },
    pricing: {
      monthly: {
        amount: {
          type: Number,
          required: true,
        },
        stripePriceId: {
          type: String,
          sparse: true,
        },
      },
      annual: {
        amount: {
          type: Number,
          required: true,
        },
        stripePriceId: {
          type: String,
          sparse: true,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
planSchema.index({ type: 1 });
planSchema.index({ isActive: 1, displayOrder: 1 });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;