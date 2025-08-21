/**
 * SSE-Only Query Client Configuration - Phase 4
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | CRITICAL IMPLEMENTATION
 * PURPOSE: Eliminate polling for SSE-migrated systems while maintaining card polling
 * 
 * PHASE 4 TARGET:
 * - UI Events: SSE-only (no polling)
 * - Session Events: SSE-only (no polling) 
 * - Card Events: Maintain polling (Phase 5 target)
 */

import { QueryClient } from '@tanstack/react-query';
import { EmergencyController } from '@/lib/services/emergency-controller';

/**
 * SSE System Classification
 * Determines which systems have been migrated to SSE-only operation
 */
const SSE_MIGRATED_SYSTEMS = {
  // Phase 2 UI Events (SSE-only)
  'ui-state': true,
  'theme-state': true,
  'dialog-state': true,
  'tray-state': true,
  'modal-state': true,
  'button-tracking': true,
  
  // Phase 3 Session Events (SSE-only)
  'session-data': true,
  'user-activity': true,
  'session-state': true,
  'session-tracking': true,
  'session-lifecycle': true,
  
  // Phase 5 targets (still polling)
  'cards': false,
  'card-state': false,
  'card-updates': false,
  
  // Session simulation (maintain polling)
  'simulatedSessions': false,
};

/**
 * Determines if a query key represents an SSE-migrated system
 */
function isSSEMigrated(queryKey) {
  if (!Array.isArray(queryKey)) return false;
  
  const [primaryKey] = queryKey;
  
  // Direct system check
  if (SSE_MIGRATED_SYSTEMS.hasOwnProperty(primaryKey)) {
    return SSE_MIGRATED_SYSTEMS[primaryKey];
  }
  
  // Pattern matching for related queries
  for (const [system, isSSE] of Object.entries(SSE_MIGRATED_SYSTEMS)) {
    if (primaryKey.includes(system) || primaryKey.startsWith(system)) {
      return isSSE;
    }
  }
  
  // Default: not SSE migrated (use polling)
  return false;
}

/**
 * Phase 4: SSE-Only Query Client Configuration
 * 
 * Eliminates polling for UI and Session systems while maintaining card polling
 */
export function createSSEOnlyQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Selective polling elimination based on SSE migration status
        refetchInterval: (query) => {
          // Emergency override: If SSE is disabled, enable all polling
          if (!EmergencyController.isSSEEnabled()) {
            console.warn('[Phase4] SSE disabled - enabling polling for all systems');
            return 30000; // 30 second polling fallback
          }
          
          const queryKey = query.queryKey;
          
          // SSE-migrated systems: No polling
          if (isSSEMigrated(queryKey)) {
            console.log(`[Phase4] SSE-only operation for: ${queryKey[0]}`);
            return false; // ✅ Pure SSE operation
          }
          
          // Legacy systems (cards): Keep polling
          console.log(`[Phase4] Polling maintained for: ${queryKey[0]}`);
          return 30000; // ❌ Cards still polling (Phase 5 target)
        },
        
        // Optimized stale time for SSE vs polling systems
        staleTime: (query) => {
          const queryKey = query.queryKey;
          
          // SSE systems: Long stale time (event-driven updates)
          if (isSSEMigrated(queryKey)) {
            return 1000 * 60 * 60; // 1 hour - events drive freshness
          }
          
          // Polling systems: Short stale time
          return 30000; // 30 seconds for polling systems
        },
        
        // Retry configuration optimized for SSE vs polling
        retry: (failureCount, error, query) => {
          const queryKey = query.queryKey;
          
          // SSE systems: Aggressive retry (fallback activation)
          if (isSSEMigrated(queryKey)) {
            return failureCount < 3;
          }
          
          // Polling systems: Standard retry
          return failureCount < 2;
        },
        
        // Network mode optimization
        networkMode: 'online',
        
        // Prevent background refetch for SSE systems
        refetchOnWindowFocus: (query) => {
          return !isSSEMigrated(query.queryKey);
        },
        
        refetchOnReconnect: (query) => {
          return !isSSEMigrated(query.queryKey);
        },
      },
      
      mutations: {
        // Standard mutation configuration
        retry: 1,
        networkMode: 'online',
      },
    },
  });
  
  // Phase 4 logging and monitoring
  queryClient.setMutationDefaults(['sse-fallback'], {
    onSuccess: (data, variables) => {
      console.log(`[Phase4] Fallback activation successful:`, variables);
    },
    onError: (error, variables) => {
      console.error(`[Phase4] Fallback activation failed:`, error, variables);
    },
  });
  
  return queryClient;
}

/**
 * Hook: useSSEOnlyQueryClient
 * 
 * Provides Phase 4 query client with selective polling elimination
 */
export function useSSEOnlyQueryClient() {
  return createSSEOnlyQueryClient();
}

/**
 * Phase 4 Query Client Status
 * 
 * Monitors the current state of polling elimination
 */
export function getQueryClientStatus() {
  const stats = {
    sseOnlySystems: Object.entries(SSE_MIGRATED_SYSTEMS)
      .filter(([, isSSE]) => isSSE)
      .map(([system]) => system),
    
    pollingSystems: Object.entries(SSE_MIGRATED_SYSTEMS)
      .filter(([, isSSE]) => !isSSE)
      .map(([system]) => system),
    
    totalSSEMigrated: Object.values(SSE_MIGRATED_SYSTEMS).filter(Boolean).length,
    totalSystemsRemaining: Object.values(SSE_MIGRATED_SYSTEMS).filter(v => !v).length,
  };
  
  return {
    phase: 4,
    status: 'sse-only-partial',
    pollingEliminated: `${stats.totalSSEMigrated}/${Object.keys(SSE_MIGRATED_SYSTEMS).length} systems`,
    sseOnlySystems: stats.sseOnlySystems,
    pollingSystems: stats.pollingSystems,
    networkReductionEstimate: '40-50%',
  };
}

/**
 * Debug: Force system migration status (development only)
 */
export function debugSetSystemSSEStatus(system, isSSE) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('[Phase4] System status changes only allowed in development');
    return false;
  }
  
  if (SSE_MIGRATED_SYSTEMS.hasOwnProperty(system)) {
    const oldStatus = SSE_MIGRATED_SYSTEMS[system];
    SSE_MIGRATED_SYSTEMS[system] = isSSE;
    console.log(`[Phase4] Debug: ${system} changed from ${oldStatus} to ${isSSE}`);
    return true;
  }
  
  console.warn(`[Phase4] Unknown system for debug change: ${system}`);
  return false;
}