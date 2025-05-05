
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  recommended?: boolean;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out the platform",
    features: [
      "Up to 4 participants",
      "40 minutes per meeting",
      "Basic audio/video quality",
      "Screen sharing",
      "Chat functionality",
    ],
    buttonText: "Get Started",
  },
  {
    name: "Pro",
    price: "$15",
    description: "For professional educators and small teams",
    features: [
      "Up to 25 participants",
      "Unlimited meeting duration",
      "HD audio/video quality",
      "Advanced screen sharing",
      "Digital whiteboard",
      "Annotation tools",
      "Breakout rooms",
      "Cloud recording (10 hours)",
      "Language teaching tools",
    ],
    buttonText: "Upgrade to Pro",
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For educational institutions and organizations",
    features: [
      "Unlimited participants",
      "Unlimited meeting duration",
      "4K video quality",
      "All Pro features",
      "Custom branding",
      "SSO integration",
      "Dedicated support",
      "Advanced analytics",
      "Custom integrations",
    ],
    buttonText: "Contact Us",
  },
];

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handlePlanSelection = (plan: string) => {
    if (plan === "Free") {
      if (isAuthenticated) {
        navigate("/subscription/checkout?plan=free&billing=" + billingCycle);
      } else {
        navigate("/register");
      }
    } else if (plan === "Pro") {
      if (isAuthenticated) {
        navigate("/subscription/checkout?plan=pro&billing=" + billingCycle);
      } else {
        navigate("/register?plan=pro");
      }
    } else {
      // Enterprise plan would lead to a contact form
      window.location.href = "mailto:sales@example.com?subject=Enterprise%20Plan%20Inquiry";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-5 text-xl text-gray-500 max-w-3xl mx-auto">
              Choose the perfect plan for your language teaching needs
            </p>
            
            <div className="mt-8 flex justify-center">
              <div className="bg-gray-100 p-1 rounded-full inline-flex">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`${
                    billingCycle === "monthly" 
                      ? "bg-white shadow-sm text-gray-900" 
                      : "text-gray-500"
                  } py-2 px-6 rounded-full focus:outline-none transition-all duration-200`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`${
                    billingCycle === "annual" 
                      ? "bg-white shadow-sm text-gray-900" 
                      : "text-gray-500"
                  } py-2 px-6 rounded-full focus:outline-none transition-all duration-200`}
                >
                  Annual (20% off)
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`
                  relative rounded-2xl border p-8 shadow-sm flex flex-col
                  ${plan.recommended ? "border-brand-teal ring-1 ring-brand-teal" : "border-gray-200"}
                `}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-brand-teal py-1 px-3 text-xs font-medium text-white">
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                </div>
                
                <div className="mb-5">
                  <span className="text-4xl font-bold text-gray-900">
                    {billingCycle === "annual" && plan.price !== "Custom" && plan.price !== "$0"
                      ? `$${parseInt(plan.price.replace("$", "")) * 0.8 * 12}`
                      : plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-gray-500">
                      {billingCycle === "annual" ? "/year" : "/month"}
                    </span>
                  )}
                </div>
                
                <ul className="mb-8 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-brand-teal" />
                      <span className="ml-3 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handlePlanSelection(plan.name)}
                  className={`w-full ${
                    plan.recommended
                      ? "bg-brand-teal hover:bg-brand-teal/90 text-white"
                      : ""
                  }`}
                  variant={plan.recommended ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <div>
                <h3 className="font-medium text-gray-900">Can I try before I buy?</h3>
                <p className="mt-2 text-gray-500">
                  Yes! You can start with our free plan to experience the core features before upgrading.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Can I change plans later?</h3>
                <p className="mt-2 text-gray-500">
                  You can upgrade your plan at any time. If you need to downgrade, you can do so at the end of your billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Do you offer discounts for educational institutions?</h3>
                <p className="mt-2 text-gray-500">
                  Yes, we offer special pricing for schools and educational organizations. Contact our sales team for details.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">What payment methods do you accept?</h3>
                <p className="mt-2 text-gray-500">
                  We accept all major credit cards, PayPal, and bank transfers for annual enterprise plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
