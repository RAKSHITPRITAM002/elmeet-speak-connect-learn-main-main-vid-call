import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  lastLoginAt?: string | number | Date;
  createdAt?: string | number | Date;
  role?: 'student' | 'teacher' | 'admin';
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (userData: Partial<User>) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in (from secure token)
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // In a real app, you would validate the token with your backend
        // For now, we'll parse the stored user data
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        
        if (userData && userData.id) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Helper to securely store user data
  const storeUserData = (token: string, userData: User) => {
    // Store the auth token securely
    localStorage.setItem('auth_token', token);
    
    // Store user data
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Set session expiry (8 hours)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 8);
    localStorage.setItem('session_expiry', expiry.toISOString());
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call to your authentication endpoint
      // For demo purposes, we'll simulate a successful login
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user data (in a real app, this would come from your API)
      const userData: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0],
        email,
        picture: 'https://via.placeholder.com/150',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        role: 'student',
        verified: true
      };
      
      // Generate mock token (in a real app, this would come from your API)
      const token = 'mock_token_' + Math.random().toString(36).substring(2, 15);
      
      // Store user data securely
      storeUserData(token, userData);
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async (googleData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would verify the Google token with your backend
      // For demo purposes, we'll simulate a successful login
      
      // Validate inputs
      if (!googleData.email) {
        throw new Error('Email is required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user data
      const userData: User = {
        id: 'google_user_' + Math.random().toString(36).substring(2, 9),
        name: googleData.name || googleData.email?.split('@')[0] || 'User',
        email: googleData.email,
        picture: googleData.picture || 'https://via.placeholder.com/150',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        role: 'student',
        verified: true
      };
      
      // Generate mock token (in a real app, this would come from your API)
      const token = 'google_token_' + Math.random().toString(36).substring(2, 15);
      
      // Store user data securely
      storeUserData(token, userData);
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to login with Google. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (name: string, email: string, password: string, role: string = 'student') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!name || !email || !password) {
        throw new Error('Name, email, and password are required');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call to register the user
      // For demo purposes, we'll simulate a successful registration
      
      // Create user data (in a real app, this would come from your API)
      const userData: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        name,
        email,
        picture: 'https://via.placeholder.com/150',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        role: role as 'student' | 'teacher' | 'admin',
        verified: false // Requires email verification
      };
      
      // In a real app, you would send a verification email here
      console.log('Verification email would be sent to:', email);
      
      // For demo purposes, we'll automatically verify the user
      userData.verified = true;
      
      // Generate mock token
      const token = 'reg_token_' + Math.random().toString(36).substring(2, 15);
      
      // Store user data securely
      storeUserData(token, userData);
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Clear secure storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('session_expiry');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login page
    navigate('/login');
  };

  // Verify email
  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would verify the token with your backend
      // For demo purposes, we'll simulate a successful verification
      
      if (!token) {
        throw new Error('Invalid verification token');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If user is already logged in, update their verification status
      if (user) {
        const updatedUser = { ...user, verified: true };
        setUser(updatedUser);
        
        // Update stored user data
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
      
      // In a real app, you might redirect to login or dashboard
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(err.message || 'Failed to verify email. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate input
      if (!email) {
        throw new Error('Email is required');
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send a password reset email
      console.log('Password reset email would be sent to:', email);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const updatePassword = async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!oldPassword || !newPassword) {
        throw new Error('Old and new passwords are required');
      }
      
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }
      
      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumbers = /\d/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
      
      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would update the password with your backend
      console.log('Password would be updated');
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      const updatedUser = { ...user, ...userData };
      
      // In a real app, you would update the profile with your backend
      
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      error,
      login,
      loginWithGoogle,
      register,
      logout,
      verifyEmail,
      resetPassword,
      updatePassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};