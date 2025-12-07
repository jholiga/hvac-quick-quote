import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/storage';

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = storage.getAuth();
    if (auth?.isLoggedIn) {
      setIsLoggedIn(true);
      setUserEmail(auth.email);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Demo auth - in production, this would hit an API
    if (!email || !password) {
      return { success: false, error: 'Please enter email and password' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Invalid credentials' };
    }

    storage.login(email);
    setIsLoggedIn(true);
    setUserEmail(email);
    return { success: true };
  };

  const signup = async (email: string, password: string) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter email and password' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email' };
    }

    storage.login(email);
    setIsLoggedIn(true);
    setUserEmail(email);
    return { success: true };
  };

  const logout = () => {
    storage.logout();
    setIsLoggedIn(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
