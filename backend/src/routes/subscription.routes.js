const express = require('express');
const { protect } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscription.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Subscription routes
router.get('/current', subscriptionController.getCurrentSubscription);
router.get('/history', subscriptionController.getSubscriptionHistory);
router.post('/', subscriptionController.createSubscription);
router.post('/change-plan', subscriptionController.changePlan);
router.delete('/:subscriptionId', subscriptionController.cancelSubscription);
router.post('/:subscriptionId/reactivate', subscriptionController.reactivateSubscription);
router.post('/:subscriptionId/toggle-auto-renew', subscriptionController.toggleAutoRenew);

// Plan routes
router.get('/plans', subscriptionController.getAvailablePlans);

// Payment routes
router.post('/payment-intent', subscriptionController.createPaymentIntent);
router.get('/payment-methods', subscriptionController.getPaymentMethods);
router.post('/payment-methods', subscriptionController.addPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', subscriptionController.removePaymentMethod);

module.exports = router;