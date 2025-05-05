import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useSubscription, SUBSCRIPTION_PLANS } from '@/contexts/SubscriptionContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Calendar, CheckCircle, AlertCircle, ArrowUpCircle } from 'lucide-react';

interface SubscriptionManagerProps {
  onUpgrade?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onUpgrade }) => {
  const { 
    currentSubscription, 
    getCurrentPlan, 
    cancelSubscription, 
    reactivateSubscription,
    toggleAutoRenew,
    isLoading 
  } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentPlan = getCurrentPlan();
  
  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle plan upgrade
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };
  
  // Handle subscription cancellation
  const handleCancel = async () => {
    if (!currentSubscription) return;
    
    setIsProcessing(true);
    try {
      await cancelSubscription();
      toast({
        title: 'Subscription canceled',
        description: 'Your subscription has been canceled. You will still have access until the end of your billing period.',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle subscription reactivation
  const handleReactivate = async () => {
    if (!currentSubscription) return;
    
    setIsProcessing(true);
    try {
      await reactivateSubscription();
      toast({
        title: 'Subscription reactivated',
        description: 'Your subscription has been reactivated successfully.',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reactivate subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle auto-renew toggle
  const handleAutoRenewToggle = async () => {
    if (!currentSubscription) return;
    
    setIsProcessing(true);
    try {
      await toggleAutoRenew();
      toast({
        title: 'Auto-renew updated',
        description: `Auto-renew has been ${currentSubscription.autoRenew ? 'disabled' : 'enabled'}.`,
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update auto-renew setting. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Get status badge
  const getStatusBadge = () => {
    if (!currentSubscription) return null;
    
    switch (currentSubscription.status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Canceled</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Upgrade to access premium features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <Button onClick={handleUpgrade}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and billing settings
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Plan details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">
                {currentPlan.name} Plan
              </h3>
              <p className="text-sm text-gray-500">
                {currentSubscription.status === 'active' ? 'Active' : 
                 currentSubscription.status === 'canceled' ? 'Access until end of billing period' : 
                 'Expired'}
              </p>
            </div>
            {currentPlan.price > 0 && (
              <div className="text-right">
                <div className="text-xl font-bold">${currentPlan.price.toFixed(2)}</div>
                <div className="text-sm text-gray-500">
                  per {currentPlan.billingCycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-500">Started on</div>
              <div>{formatDate(currentSubscription.startDate)}</div>
            </div>
            <div>
              <div className="font-medium text-gray-500">
                {currentSubscription.status === 'canceled' ? 'Access until' : 'Renews on'}
              </div>
              <div>{formatDate(currentSubscription.endDate)}</div>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div>
          <h3 className="text-lg font-medium mb-3">Included Features</h3>
          <ul className="space-y-2">
            {currentPlan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Payment method */}
        {currentSubscription.paymentMethod && (
          <div>
            <h3 className="text-lg font-medium mb-3">Payment Method</h3>
            <div className="flex items-center p-3 border rounded-md">
              {currentSubscription.paymentMethod.type === 'credit_card' ? (
                <>
                  <CreditCard className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <div className="font-medium">Credit Card</div>
                    <div className="text-sm text-gray-500">
                      •••• {currentSubscription.paymentMethod.last4 || '4242'}
                      {currentSubscription.paymentMethod.expiry && (
                        <span className="ml-2">Expires {currentSubscription.paymentMethod.expiry}</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082h-2.19a1.87 1.87 0 0 0-1.846 1.582l-1.187 7.527h5.47a.641.641 0 0 0 .633-.74l.44-2.78a.641.641 0 0 1 .633-.739h1.497c4.299 0 6.837-2.75 7.668-6.443.383-1.703.324-3.11-.912-4.202z" />
                  </svg>
                  <div>
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-gray-500">
                      {/* In a real app, you might show the PayPal email here */}
                      Connected account
                    </div>
                  </div>
                </>
              )}
              <Button variant="outline" size="sm" className="ml-auto">
                Update
              </Button>
            </div>
          </div>
        )}
        
        {/* Auto-renew toggle */}
        {currentSubscription.status === 'active' && (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Auto-renew subscription</h3>
              <p className="text-sm text-gray-500">
                {currentSubscription.autoRenew 
                  ? 'Your subscription will automatically renew on the billing date' 
                  : 'Your subscription will expire at the end of the billing period'}
              </p>
            </div>
            <Switch 
              checked={currentSubscription.autoRenew} 
              onCheckedChange={handleAutoRenewToggle}
              disabled={isProcessing}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {currentPlan.type !== 'enterprise' && (
          <Button variant="outline" onClick={handleUpgrade} disabled={isProcessing}>
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        )}
        
        {currentSubscription.status === 'active' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isProcessing}>
                Cancel Subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel your subscription? You'll still have access to all features until {formatDate(currentSubscription.endDate)}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  Yes, Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        {currentSubscription.status === 'canceled' && (
          <Button onClick={handleReactivate} disabled={isProcessing}>
            Reactivate Subscription
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionManager;