import React from "react";
import Navbar from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/hero/HeroSection";
import { FeaturesList } from "../components/features/FeaturesList";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Users, Video, Monitor, Cpu, Award, Shield } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={null} onSignOut={() => navigate("/login")} />
      
      <div className="pt-16"> {/* Padding to account for fixed navbar */}
        <HeroSection />
        <FeaturesList />
        
        {/* How it works section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                How EL:MEET works
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Simple, intuitive, and powerful - designed for language teaching.
              </p>
            </div>
            
            <div className="mt-16">
              <div className="flex flex-col md:flex-row gap-8 items-center mb-16">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Create or schedule a meeting</h3>
                  <p className="text-gray-600 mb-6">
                    Start an instant meeting or schedule one for later. Generate a unique link to share with your students.
                  </p>
                  <div className="flex items-center space-x-2 text-brand-teal">
                    <Users size={20} />
                    <span>Supports up to 25 participants</span>
                  </div>
                </div>
                <div className="md:w-1/2 bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg shadow-md w-4/5">
                    <h4 className="font-medium text-gray-900 mb-4">New Meeting</h4>
                    <Button className="w-full bg-brand-teal hover:bg-brand-teal/90 mb-3">
                      Start instantly
                    </Button>
                    <Button variant="outline" className="w-full border-brand-teal text-brand-teal">
                      Schedule for later
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row-reverse gap-8 items-center mb-16">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">High-quality video conferencing</h3>
                  <p className="text-gray-600 mb-6">
                    Experience HD video with ultra-low latency, perfect for real-time language conversation and pronunciation practice.
                  </p>
                  <div className="flex items-center space-x-2 text-brand-teal">
                    <Video size={20} />
                    <span>Adaptive streaming for any connection</span>
                  </div>
                </div>
                <div className="md:w-1/2 bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div className="bg-brand-teal h-24 rounded-lg"></div>
                    <div className="bg-brand-orange h-24 rounded-lg"></div>
                    <div className="bg-gray-300 h-24 rounded-lg"></div>
                    <div className="bg-gray-400 h-24 rounded-lg"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Specialized teaching tools</h3>
                  <p className="text-gray-600 mb-6">
                    Use advanced annotation, optimized screen sharing, whiteboard, and language-specific tools to make your lessons more effective.
                  </p>
                  <div className="flex items-center space-x-2 text-brand-teal">
                    <Monitor size={20} />
                    <span>Smooth YouTube sharing with audio</span>
                  </div>
                </div>
                <div className="md:w-1/2 bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="bg-white w-4/5 h-4/5 rounded-lg shadow-md flex flex-col">
                    <div className="h-8 bg-brand-teal rounded-t-lg"></div>
                    <div className="flex-1 p-3">
                      <div className="bg-gray-100 h-full rounded flex items-center justify-center">
                        <div className="text-gray-400 text-sm">Screen sharing area</div>
                      </div>
                    </div>
                    <div className="h-10 border-t border-gray-200 flex items-center justify-center gap-3 px-4">
                      <div className="w-8 h-8 rounded-full bg-brand-teal"></div>
                      <div className="w-8 h-8 rounded-full bg-brand-orange"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why choose us section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why choose EL:MEET?
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Built specifically for language teachers and learners.
              </p>
            </div>
            
            <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-brand-orange bg-opacity-10 rounded-full flex items-center justify-center text-brand-orange mb-4">
                  <Cpu size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ultra-Low Latency</h3>
                <p className="text-gray-600">
                  Our proprietary technology ensures minimal delay for natural conversation flow.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-brand-teal bg-opacity-10 rounded-full flex items-center justify-center text-brand-teal mb-4">
                  <Award size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Specialized Features</h3>
                <p className="text-gray-600">
                  Tools designed specifically for language teaching, not generic video conferencing.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-brand-orange bg-opacity-10 rounded-full flex items-center justify-center text-brand-orange mb-4">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                <p className="text-gray-600">
                  End-to-end encryption and robust infrastructure for uninterrupted lessons.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-brand-teal py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to transform your language teaching?
            </h2>
            <p className="mt-4 text-xl text-white opacity-90 max-w-2xl mx-auto">
              Join the growing community of language teachers using EL:MEET.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/register">
                <Button className="px-8 py-3 text-brand-teal bg-white hover:bg-gray-100 rounded-md shadow-md">
                  Get started for free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

// Export as default
export default Home;