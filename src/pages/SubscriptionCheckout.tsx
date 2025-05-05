import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import SubscriptionCheckoutComponent from '@/components/subscription/SubscriptionCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { PlanType } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SubscriptionCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Get plan type and billing cycle from URL params
  const searchParams = new URLSearchParams(location.search);
  const planParam = searchParams.get('plan') as PlanType | null;
  const billingCycleParam = searchParams.get('billing') as 'monthly' | 'annual' | null;
  
  const [planType, setPlanType] = useState<PlanType>(planParam || 'pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(billingCycleParam || 'monthly');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname + location.search));
    }
  }, [isAuthenticated, navigate, location]);
  
  // Handle successful checkout
  const handleSuccess = () => {
    navigate('/profile?tab=subscription');
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/pricing');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => navigate('/pricing')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
          
          <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Purchase</h1>
          
          <SubscriptionCheckoutComponent
            planType={planType}
            billingCycle={billingCycle}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubscriptionCheckoutPage;