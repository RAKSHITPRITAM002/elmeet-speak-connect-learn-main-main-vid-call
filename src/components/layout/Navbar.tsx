import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export type User = {
  name: string;
  picture: string;
  email: string;
};

export type NavbarProps = {
  user?: User | null;
  onSignOut?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ user: propUser, onSignOut: propOnSignOut }) => {
  const navigate = useNavigate();
  const { user: contextUser, logout: contextLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Use props if provided, otherwise use context
  const user = propUser !== undefined ? propUser : contextUser;
  const onSignOut = propOnSignOut || contextLogout;

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="/lovable-uploads/618f9a75-93a1-49f8-aab2-c029783e99b2.png"
                alt="Earn Language Logo"
                className="h-8 w-auto mr-2"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">
                EL:MEET
              </span>
            </Link>
            <div className="hidden md:flex ml-6 space-x-6">
              <Link to="/features" className="text-gray-700 hover:text-brand-teal">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-brand-teal">
                Pricing
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-brand-teal">
                About
              </Link>
            </div>
          </div>
          {user ? (
            <div className="hidden md:flex items-center space-x-4 relative">
              <Link to="/meeting">
                <Button className="bg-brand-teal hover:bg-brand-teal/90 text-white">
                  Start Meeting
                </Button>
              </Link>
              <button
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none"
              >
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="ml-2 hidden sm:inline">{user.name}</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/dashboard");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/password-reset");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onSignOut();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="ml-4">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-brand-teal focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/features"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            {user ? (
              <div className="flex flex-col space-y-2 mt-4">
                <Link to="/meeting" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white">
                    Start Meeting
                  </Button>
                </Link>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full text-red-500 border-red-500" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSignOut();
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 mt-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;