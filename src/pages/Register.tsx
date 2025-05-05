import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Loader2, CheckCircle2, Info, Mail } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { validateEmail, suggestDomains } from "@/utils/emailValidator";

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isAuthenticated, isLoading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [isValidEmail, setIsValidEmail] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !registrationSuccess) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, registrationSuccess]);

  // Email validation
  useEffect(() => {
    if (!email) {
      setEmailError(null);
      setEmailSuggestions([]);
      setIsValidEmail(false);
      return;
    }

    // Check if it contains @ symbol
    if (!email.includes('@')) {
      setEmailError("Please include an @ symbol in the email address");
      
      // Suggest domains if user has typed something before the @
      if (email.length > 2) {
        const suggestedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
        setEmailSuggestions(suggestedDomains);
      } else {
        setEmailSuggestions([]);
      }
      setIsValidEmail(false);
      return;
    }

    // If there's an @ symbol, validate the email
    const validation = validateEmail(email);
    setIsValidEmail(validation.isValid);
    
    if (!validation.isValid) {
      setEmailError(validation.message || "Invalid email address");
      
      // If there's a domain part, suggest similar domains
      const domainPart = email.split('@')[1];
      if (domainPart && domainPart.length > 1) {
        setEmailSuggestions(suggestDomains(domainPart));
      } else {
        setEmailSuggestions([]);
      }
    } else {
      setEmailError(null);
      setEmailSuggestions([]);
    }
  }, [email]);

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback([]);
      return;
    }

    const feedback = [];
    let strength = 0;

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push("Password should be at least 8 characters long");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Include at least one uppercase letter");
    }

    // Lowercase and number check
    if (/[a-z]/.test(password) && /\d/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Include lowercase letters and numbers");
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Include at least one special character");
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    
    try {
      // Validate inputs
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      if (passwordStrength < 75) {
        throw new Error("Please use a stronger password");
      }
      
      // Validate email
      if (!isValidEmail) {
        throw new Error(emailError || "Please enter a valid email address");
      }
      
      // Call registration function
      await register(name, email, password, role);
      
      // Show success message
      setRegistrationSuccess(true);
      
      // In a real app, you might redirect to email verification page
      // For demo, we'll show a success message and then redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err: any) {
      setLocalError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLocalError(null);
    setIsSubmitting(true);
    
    try {
      // Decode Google credential to extract user info
      const decoded: any = jwtDecode(credentialResponse.credential);
      
      await loginWithGoogle({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture
      });
      
      navigate("/dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Failed to register with Google. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleFailure = () => {
    setLocalError("Google sign up failed. Please try again.");
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Registration Successful!</CardTitle>
            <CardDescription className="text-center">
              Your account has been created successfully. You will be redirected to the dashboard shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Welcome to ElMeet! You can now access all features of the platform.
              </AlertDescription>
            </Alert>
            <Progress value={100} className="h-2 bg-gray-200" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to get started with ElMeet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || localError) && (
            <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`mt-1 ${emailError ? 'border-red-500 pr-10' : isValidEmail && email ? 'border-green-500 pr-10' : ''}`}
                />
                {emailError && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                )}
                {isValidEmail && email && !emailError && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              {emailError && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  {emailError}
                </p>
              )}
              
              {emailSuggestions.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs text-gray-500 mb-1">Did you mean:</p>
                  <div className="flex flex-wrap gap-1">
                    {emailSuggestions.map((suggestion, index) => {
                      // If there's no @ in the email, suggest full email
                      const suggestedEmail = email.includes('@') 
                        ? email.split('@')[0] + '@' + suggestion 
                        : email + '@' + suggestion;
                        
                      return (
                        <button
                          key={index}
                          type="button"
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full flex items-center"
                          onClick={() => setEmail(suggestedEmail)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          {suggestedEmail}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="mt-1"
              />
              
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">Password strength:</span>
                    <span className="text-xs font-medium">
                      {passwordStrength < 50 ? "Weak" : 
                       passwordStrength < 75 ? "Medium" : "Strong"}
                    </span>
                  </div>
                  <Progress 
                    value={passwordStrength} 
                    className={`h-1 ${getPasswordStrengthColor()}`} 
                  />
                  
                  {passwordFeedback.length > 0 && (
                    <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-4">
                      {passwordFeedback.map((feedback, index) => (
                        <li key={index}>{feedback}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="mt-1"
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="role">I am a</Label>
              <Select 
                value={role} 
                onValueChange={setRole}
              >
                <SelectTrigger id="role" className="mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isLoading || password !== confirmPassword || passwordStrength < 50 || !isValidEmail}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                theme="filled_blue"
                size="large"
                shape="pill"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;

