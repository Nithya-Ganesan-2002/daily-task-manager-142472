import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, authService } from '../utils/supabase';

const AuthContext = createContext();

// PUBLIC_INTERFACE
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// PUBLIC_INTERFACE
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { session: initialSession } = await authService.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
          case 'USER_UPDATED':
            console.log('User updated');
            break;
          default:
            break;
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        return { 
          success: false, 
          error: error.message || 'Login failed' 
        };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        return { success: true };
      }

      return { 
        success: false, 
        error: 'Login failed - no user data received' 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred during login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signUp(email, password, fullName);
      
      if (error) {
        return { 
          success: false, 
          error: error.message || 'Registration failed' 
        };
      }

      // Check if user needs email confirmation
      if (data.user && !data.session) {
        return { 
          success: true, 
          message: 'Please check your email to confirm your account before signing in.',
          requiresConfirmation: true
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred during registration' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await authService.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }

      // Clear local state regardless of API response
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await authService.resetPassword(email);
      
      if (error) {
        return { 
          success: false, 
          error: error.message || 'Password reset failed' 
        };
      }

      return { 
        success: true, 
        message: 'Password reset email sent. Please check your inbox.' 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const updatePassword = async (password) => {
    try {
      const { data, error } = await authService.updatePassword(password);
      
      if (error) {
        return { 
          success: false, 
          error: error.message || 'Password update failed' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user && !!session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
