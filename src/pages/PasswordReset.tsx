import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { ResetPasswordRequest } from "@/components/auth/reset-password/ResetPasswordRequest";
import { ResetPasswordConfirm } from "@/components/auth/reset-password/ResetPasswordConfirm";
import { ResetPasswordContainer } from "@/components/auth/reset-password/ResetPasswordContainer";
const PasswordReset = () => {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for access token in URL hash
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const tokenMatch = hash.match(/access_token=([^&]+)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        setAccessToken(token);
        setStep("confirm");
        const emailMatch = hash.match(/email=([^&]+)/);
        if (emailMatch) {
          setEmail(decodeURIComponent(emailMatch[1]));
        }
        toast({
          title: "Reset link verified",
          description: "You can now reset your password",
        });
      }
      return;
    }
    
    // Fallback to URL search params
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get("email");
    const stepParam = searchParams.get("step");
    
    if (emailParam) setEmail(emailParam);
    if (stepParam === "confirm") setStep("confirm");
  }, [location, toast]);

  const handleResetRequestSuccess = (email: string) => {
    setEmail(email);
  };

  // Temporary development toggle to switch between reset forms
  const toggleStep = () => {
    setStep(prev => (prev === "request" ? "confirm" : "request"));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        user={null} 
        onSignOut={() => { console.log("Sign out clicked"); }} 
      />
      <main className="flex-1 container mx-auto px-4 py-12">
        {process.env.NODE_ENV === "development" && (
          <button 
            className="mb-4 px-3 py-1 bg-gray-200 rounded"
            onClick={toggleStep}
          >
            Toggle Form (Current: {step})
          </button>
        )}
        <ResetPasswordContainer title={step === "request" ? "Reset Your Password" : "Set New Password"}>
          {step === "request" ? (
            <ResetPasswordRequest onSuccess={handleResetRequestSuccess} />
          ) : (
            <ResetPasswordConfirm email={email} accessToken={accessToken} />
          )}
        </ResetPasswordContainer>
      </main>
      <Footer />
    </div>
  );
};

export default PasswordReset;