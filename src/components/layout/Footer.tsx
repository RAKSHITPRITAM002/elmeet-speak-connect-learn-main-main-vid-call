
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">
                EL:MEET
              </span>
            </Link>
            <p className="mt-4 text-gray-600 text-sm">
              The best video conferencing platform for language teaching and learning.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/features" className="text-base text-gray-600 hover:text-brand-teal">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-base text-gray-600 hover:text-brand-teal">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-base text-gray-600 hover:text-brand-teal">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-base text-gray-600 hover:text-brand-teal">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-600 hover:text-brand-teal">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:contact@elmeet.com" className="text-base text-gray-600 hover:text-brand-teal">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Account</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/dashboard" className="text-base text-gray-600 hover:text-brand-teal">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-base text-gray-600 hover:text-brand-teal">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/meeting" className="text-base text-gray-600 hover:text-brand-teal">
                  Start Meeting
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} EL:MEET. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
