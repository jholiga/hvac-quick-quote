import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter a valid email and password' };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid email or password' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const signup = async (email: string, password: string) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter a valid email and password' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 10 characters in length' };
    }

    const redirectUrl = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'This email is already registered. Please log in instead.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      return { success: false, error: 'Please enter your email' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=login`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn: !!session, 
      user, 
      session,
      isLoading,
      login, 
      signup, 
      logout,
      resetPassword,
    }}>
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
