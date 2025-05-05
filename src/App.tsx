import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
// Import pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Meeting from "./pages/Meeting";
import MeetingNew from "./pages/MeetingNew";
import MeetingEnhanced from "./pages/MeetingEnhanced";
import PasswordReset from "./pages/PasswordReset";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import BillingManagement from "./pages/BillingManagement";
import MeetingPreJoin from "./pages/MeetingPreJoin";
import MeetingPreJoinEnhanced from "./pages/MeetingPreJoinEnhanced";
// Import contexts
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { Toaster } from "@/components/ui/toaster";

const App = () => {
  return (
    <GoogleOAuthProvider clientId="709186794530-8mbat80a7d5hnipequqht1n24c5f98ld.apps.googleusercontent.com">
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Authentication pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/auth" element={<Auth />} />

            {/* User pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription/checkout" element={<SubscriptionCheckout />} />
            <Route path="/subscription/billing" element={<BillingManagement />} />
            <Route path="/meeting/:meetingId?" element={<Meeting />} />
            <Route path="/meeting-new/:meetingId?" element={<MeetingNew />} />
            <Route path="/meeting-enhanced/:meetingId?" element={<MeetingEnhanced />} />
            <Route path="/meeting-prejoin/:meetingId?" element={<MeetingPreJoin />} />
            <Route path="/meeting-prejoin-enhanced/:meetingId?" element={<MeetingPreJoinEnhanced />} />

            {/* Admin pages */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;

