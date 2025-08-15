/**
 * Authentication Hook
 * 
 * Provides authentication state and methods for the entire application
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserCapabilities } from '@/lib/auth/permissions';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  capabilities: {},
  login: async () => {},
  logout: async () => {},
  refresh: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Derived state
  const isAuthenticated = !!user;
  const capabilities = getUserCapabilities(user);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Important for cookie-based auth
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    router.push('/auth/login?message=You have been logged out');
  };

  // Refresh user data
  const refresh = async () => {
    await checkAuth();
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    capabilities,
    login,
    logout,
    refresh
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for requiring authentication
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}

// Hook for requiring specific permissions
export function useRequirePermission(permission, redirectTo = '/unauthorized') {
  const { user, isLoading, capabilities } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Check if user has the required permission
      const hasPermission = Object.keys(capabilities).some(cap => 
        capabilities[cap] && cap.includes(permission)
      );

      if (!hasPermission) {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, capabilities, permission, router, redirectTo]);

  return { user, isLoading, hasPermission: true }; // Simplified for now
}

// Hook for requiring specific roles
export function useRequireRole(roles, redirectTo = '/unauthorized') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(user.role)) {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, roles, router, redirectTo]);

  return { user, isLoading, hasRole: true }; // Simplified for now
}