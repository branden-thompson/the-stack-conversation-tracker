/**
 * Session Context Provider
 * Manages user session tracking across the application
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSessionEmitter } from '@/lib/hooks/useSessionEmitter';
import { SESSION_USER_TYPES } from '@/lib/utils/session-constants';

const SessionContext = createContext(null);

export function SessionProvider({ children, user }) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize session tracking (pass null initially to prevent recursion)
  const sessionEmitter = useSessionEmitter(null);
  
  // Create initial session on mount
  useEffect(() => {
    const initSession = async () => {
      if (user && !isInitialized) {
        console.log('[SessionProvider] Initializing session for user:', user);
        
        // Determine user type
        const userType = user.isGuest 
          ? SESSION_USER_TYPES.GUEST 
          : SESSION_USER_TYPES.REGISTERED;
        
        // Create session on server
        try {
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userType,
              browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
              metadata: {
                userName: user.name,
                route: typeof window !== 'undefined' ? window.location.pathname : '/',
                isSystemUser: user.isSystemUser || false,
                avatar: user.avatar,
              },
            }),
          });
          
          if (response.ok) {
            const session = await response.json();
            console.log('[SessionProvider] Session created:', session.id);
            setIsInitialized(true);
          }
        } catch (error) {
          console.error('[SessionProvider] Failed to create initial session:', error);
        }
      }
    };
    
    initSession();
  }, [user, isInitialized]);
  
  // Create provisioned guest session if no user
  useEffect(() => {
    const createGuestSession = async () => {
      if (!user && !isInitialized) {
        console.log('[SessionProvider] Creating provisioned guest session');
        
        try {
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: `guest_${Date.now()}`,
              userType: SESSION_USER_TYPES.GUEST,
              browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
              metadata: {
                userName: 'Provisioned Guest',
                route: typeof window !== 'undefined' ? window.location.pathname : '/',
                provisioned: true,
              },
            }),
          });
          
          if (response.ok) {
            const session = await response.json();
            console.log('[SessionProvider] Provisioned guest session created:', session.id);
            setIsInitialized(true);
          }
        } catch (error) {
          console.error('[SessionProvider] Failed to create guest session:', error);
        }
      }
    };
    
    // Delay slightly to allow user detection
    const timer = setTimeout(createGuestSession, 1000);
    return () => clearTimeout(timer);
  }, [user, isInitialized]);
  
  const contextValue = {
    ...sessionEmitter,
    isInitialized,
    user,
  };
  
  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}