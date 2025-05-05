import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { 
  CreditCard, Clock, Calendar, ArrowLeft, Download, 
  Shield, Bell, Key, FileText, CheckCircle, AlertCircle 
} from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock payment history data
interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  status: 'succeeded' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'paypal';
  description: string;
  receiptUrl?: string;
}

const BillingManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentSubscription, getCurrentPlan, toggleAutoRenew } = useSubscription();
  const [activeTab, setActiveTab] = useState("subscription");
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Load payment history
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For this example, we'll use mock data
    
    // Mock payment history
    const mockPaymentHistory: PaymentHistory[] = [
      {
        id: "payment-1",
        date: new Date(Date.now() - 86400000 * 30), // 30 days ago
        amount: 15.00,
        status: 'succeeded',
        paymentMethod: 'credit_card',
        description: 'Pro Plan - Monthly subscription',
        receiptUrl: '#'
      },
      {
        id: "payment-2",
        date: new Date(Date.now() - 86400000 * 60), // 60 days ago
        amount: 15.00,
        status: 'succeeded',
        paymentMethod: 'credit_card',
        description: 'Pro Plan - Monthly subscription',
        receiptUrl: '#'
      },
      {
        id: "payment-3",
        date: new Date(Date.now() - 86400000 * 90), // 90 days ago
        amount: 15.00,
        status: 'succeeded',
        paymentMethod: 'credit_card',
        description: 'Pro Plan - Monthly subscription',
        receiptUrl: '#'
      }
    ];
    
    setPaymentHistory(mockPaymentHistory);
  }, []);
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle auto-renew toggle
  const handleAutoRenewToggle = async () => {
    if (!currentSubscription) return;
    
    setIsProcessing(true);
    try {
      await toggleAutoRenew();
      // In a real app, this would update the subscription in the backend
      console.log(`Auto-renew ${currentSubscription.autoRenew ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Get status badge
  const getStatusBadge = () => {
    if (!currentSubscription) return null;
    
    switch (currentSubscription.status) {
      case 'active':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500">
            <AlertCircle className="mr-1 h-3 w-3" /> Canceled
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            <AlertCircle className="mr-1 h-3 w-3" /> Expired
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // If not authenticated, show loading
  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          
          <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="payment-history">Payment History</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription">
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
                  {currentSubscription ? (
                    <>
                      {/* Plan details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-medium">
                              {currentSubscription.planType.charAt(0).toUpperCase() + currentSubscription.planType.slice(1)} Plan
                            </h3>
                            <p className="text-sm text-gray-500">
                              {currentSubscription.status === 'active' ? 'Active' : 
                              currentSubscription.status === 'canceled' ? 'Access until end of billing period' : 
                              'Expired'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              ${currentSubscription.planType === 'free' ? '0.00' : 
                                currentSubscription.planType === 'pro' ? '15.00' : '99.00'}
                            </div>
                            <div className="text-sm text-gray-500">
                              per {currentSubscription.billingCycle}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between text-sm">
                          <div>
                            <div className="font-medium">Started on</div>
                            <div>{formatDate(new Date(currentSubscription.startDate))}</div>
                          </div>
                          <div>
                            <div className="font-medium">Current period ends</div>
                            <div>{formatDate(new Date(currentSubscription.endDate))}</div>
                          </div>
                          <div>
                            <div className="font-medium">Billing cycle</div>
                            <div>{currentSubscription.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Auto-renew toggle */}
                      {currentSubscription.status === 'active' && currentSubscription.planType !== 'free' && (
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
                      
                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => navigate('/pricing')}>
                          Change Plan
                        </Button>
                        {currentSubscription.status === 'active' && currentSubscription.planType !== 'free' && (
                          <Button 
                            variant="outline" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.")) {
                                // In a real app, this would call an API to cancel the subscription
                                console.log("Subscription cancelled");
                                alert("Your subscription has been canceled. You will have access until the end of your current billing period.");
                              }
                            }}
                          >
                            Cancel Subscription
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You don't have an active subscription.</p>
                      <Button onClick={() => navigate('/pricing')}>Choose a Plan</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment-methods">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment methods for subscription billing
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Credit Card */}
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CreditCard className="h-8 w-8 mr-3 text-gray-400" />
                          <div>
                            <div className="font-medium">Visa ending in 4242</div>
                            <div className="text-sm text-gray-500">Expires 12/2025</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge className="mr-2">Default</Badge>
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button>
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment-history">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    View your payment history and download receipts
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {paymentHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Receipt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment: PaymentHistory) => (
                          <TableRow key={payment.id}>
                            <TableCell>{formatDate(payment.date)}</TableCell>
                            <TableCell>{payment.description}</TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {payment.status === 'succeeded' ? (
                                <Badge className="bg-green-500">Paid</Badge>
                              ) : payment.status === 'failed' ? (
                                <Badge variant="destructive">Failed</Badge>
                              ) : (
                                <Badge variant="outline">Refunded</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {payment.receiptUrl && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No payment history available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>
                    View and download your invoices
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Download</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map((payment: { id: any; date: Date; amount: number; status: string; }, index: number) => (
                        <TableRow key={payment.id}>
                          <TableCell>INV-{2023000 + index + 1}</TableCell>
                          <TableCell>{formatDate(payment.date)}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {payment.status === 'succeeded' ? (
                              <Badge className="bg-green-500">Paid</Badge>
                            ) : payment.status === 'failed' ? (
                              <Badge variant="destructive">Failed</Badge>
                            ) : (
                              <Badge variant="outline">Refunded</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BillingManagement;


