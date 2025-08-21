/**
 * React Query Client Configuration and Provider
 * 
 * Provides optimized Query Client configuration for the conversation tracker application.
 * Includes proper error handling, retry logic, and performance optimizations.
 */

'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { useSafetySwitch } from '@/lib/utils/safety-switches';
import { createSSEOnlyQueryClient } from '@/lib/hooks/useSSEOnlyQueryClient';

/**
 * Create Query Client with optimized settings
 * 
 * PHASE 4 UPDATE: Uses SSE-Only Query Client for selective polling elimination
 */
function createQueryClient() {
  // Check if Phase 4 SSE-Only mode is enabled
  const phase4Enabled = process.env.NEXT_PUBLIC_PHASE4_SSE_ONLY === 'true' || 
                       process.env.NODE_ENV === 'development';
  
  if (phase4Enabled) {
    console.log('[QueryClient] Phase 4: Using SSE-Only Query Client with selective polling elimination');
    return createSSEOnlyQueryClient();
  }
  
  // Legacy Query Client (Pre-Phase 4)
  console.log('[QueryClient] Using legacy Query Client with standard polling');
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache settings optimized for conversation tracker
        staleTime: 30000, // 30 seconds - data is considered fresh
        gcTime: 300000, // 5 minutes - cache garbage collection
        
        // Retry configuration
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Background refetch settings
        refetchOnWindowFocus: true, // Sync when user returns to tab
        refetchOnMount: true, // Always fetch on component mount
        refetchOnReconnect: true, // Refetch when network reconnects
        
        // Performance optimizations
        refetchInterval: 30000, // Pre-Phase 4: Standard 30s polling for all systems
        refetchIntervalInBackground: false, // Don't poll in background
        
        // Error handling
        throwOnError: false, // Let components handle errors gracefully
        
        // Network mode
        networkMode: 'online', // Only make requests when online
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        retryDelay: 1000,
        
        // Error handling
        throwOnError: false,
        
        // Network mode  
        networkMode: 'online',
      },
    },
  });
}

/**
 * React Query Provider Component
 */
export function QueryProvider({ children }) {
  // Create query client (only once per provider instance)
  const [queryClient] = useState(createQueryClient);
  
  // Check if React Query is enabled via safety switch
  const reactQueryEnabled = useSafetySwitch('reactQuery');
  
  // If disabled, render children without React Query
  if (!reactQueryEnabled) {
    console.warn('[React Query] Disabled via safety switch - using legacy data fetching');
    return <>{children}</>;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
          toggleButtonProps={{
            style: {
              backgroundColor: '#10B981', // Green to match our theme
              borderRadius: '6px',
              border: 'none',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
            }
          }}
        />
      )}
    </QueryClientProvider>
  );
}

/**
 * Query configuration constants
 */
export const QUERY_CONFIG = {
  // Stale times for different data types
  staleTime: {
    conversations: 30000, // 30 seconds
    cards: 15000, // 15 seconds (more dynamic)
    users: 60000, // 1 minute (changes less frequently)
    sessions: 30000, // 30 seconds
    events: 10000, // 10 seconds (very dynamic)
  },
  
  // Refetch intervals for polling
  refetchInterval: {
    conversations: 5000, // 5 seconds (matches current)
    cards: false, // No auto-polling (event-driven updates)
    users: 30000, // 30 seconds 
    sessions: 5000, // 5 seconds (matches current)
    events: 5000, // 5 seconds (matches current)
  },
  
  // Query keys (standardized)
  keys: {
    conversations: ['conversations'],
    conversationById: (id) => ['conversations', id],
    cards: ['cards'],
    cardById: (id) => ['cards', id],
    cardsByZone: (zone) => ['cards', 'zone', zone],
    users: ['users'],
    userById: (id) => ['users', id],
    sessions: ['sessions'],
    sessionById: (id) => ['sessions', id],
    events: (limit = 100) => ['events', limit],
    activeUsers: ['activeUsers'],
  },
};

/**
 * Error handler for React Query
 */
export function handleQueryError(error, query) {
  console.error(`[React Query] Error in ${query.queryKey.join('/')}:`, error);
  
  // You can add additional error handling here:
  // - Send to error tracking service
  // - Show user notifications
  // - Log to analytics
  
  return error;
}

/**
 * Custom hook to get the query client
 */
export function useQueryClient() {
  return useQueryClient();
}