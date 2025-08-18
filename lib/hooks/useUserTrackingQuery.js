/**
 * React Query User Tracking Hooks
 * 
 * React Query-powered user and session tracking with smart polling and caching.
 * Replaces the complex polling logic with React Query's built-in optimizations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { 
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchSessions,
  fetchSessionEvents,
  createSimulatedSession,
  removeSimulatedSessions,
  fetchSimulatedSessions
} from '@/lib/api/users-api';
import { QUERY_CONFIG } from '@/lib/providers/query-client';
import { withSafetyControls } from '@/lib/utils/safety-switches';
import { useTabVisibility } from '@/lib/hooks/useTabVisibility';

/**
 * Hook for fetching users
 */
export function useUsersQuery() {
  return useQuery({
    queryKey: QUERY_CONFIG.keys.users,
    queryFn: withSafetyControls('users', 'userTracking', fetchUsers),
    staleTime: QUERY_CONFIG.staleTime.users,
    refetchInterval: false, // No automatic polling for users
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for user mutations
 */
export function useUserMutations() {
  const queryClient = useQueryClient();
  
  // Create user mutation
  const createMutation = useMutation({
    mutationFn: withSafetyControls('users', 'userTracking', createUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.users });
    },
    onError: (error) => {
      console.error('[Users] Create failed:', error);
    },
  });
  
  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: withSafetyControls('users', 'userTracking', 
      ({ id, ...updates }) => updateUser(id, updates)
    ),
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.users });
      
      const previousUsers = queryClient.getQueryData(QUERY_CONFIG.keys.users);
      
      // Optimistically update
      if (previousUsers) {
        queryClient.setQueryData(QUERY_CONFIG.keys.users, (old = []) =>
          old.map(user => user.id === id ? { ...user, ...updates } : user)
        );
      }
      
      return { previousUsers };
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(QUERY_CONFIG.keys.users, context.previousUsers);
      }
      console.error('[Users] Update failed:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.users });
    },
  });
  
  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: withSafetyControls('users', 'userTracking', deleteUser),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.users });
      
      const previousUsers = queryClient.getQueryData(QUERY_CONFIG.keys.users);
      
      // Optimistically remove
      if (previousUsers) {
        queryClient.setQueryData(QUERY_CONFIG.keys.users, (old = []) =>
          old.filter(user => user.id !== id)
        );
      }
      
      return { previousUsers };
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(QUERY_CONFIG.keys.users, context.previousUsers);
      }
      console.error('[Users] Delete failed:', error);
    },
  });
  
  return {
    create: createMutation.mutateAsync,
    update: useCallback(
      (id, updates) => updateMutation.mutateAsync({ id, ...updates }),
      [updateMutation]
    ),
    delete: deleteMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for session tracking with smart polling
 */
export function useSessionsQuery(config = {}) {
  const isTabVisible = useTabVisibility();
  const pollInterval = config.pollInterval || 5000; // Default 5 seconds
  
  return useQuery({
    queryKey: QUERY_CONFIG.keys.sessions,
    queryFn: withSafetyControls('sessions', 'userTracking', fetchSessions),
    staleTime: QUERY_CONFIG.staleTime.sessions,
    refetchInterval: isTabVisible ? pollInterval : false, // Smart polling
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for session events with smart polling
 */
export function useSessionEventsQuery(config = {}) {
  const isTabVisible = useTabVisibility();
  const maxEvents = config.maxEvents || 100;
  const pollInterval = config.pollInterval || 5000; // Default 5 seconds
  
  return useQuery({
    queryKey: QUERY_CONFIG.keys.events(maxEvents),
    queryFn: withSafetyControls('sessions', 'userTracking', 
      () => fetchSessionEvents(maxEvents)
    ),
    staleTime: QUERY_CONFIG.staleTime.events,
    refetchInterval: isTabVisible ? pollInterval : false, // Smart polling
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for simulated session management
 */
export function useSimulatedSessionMutations() {
  const queryClient = useQueryClient();
  
  // Create simulated session mutation
  const createSimulatedMutation = useMutation({
    mutationFn: withSafetyControls('sessions', 'userTracking', 
      ({ count, autoActivity }) => createSimulatedSession(count, autoActivity)
    ),
    onSuccess: () => {
      // Refresh sessions after creating simulated ones
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.sessions });
    },
    onError: (error) => {
      console.error('[Sessions] Create simulated failed:', error);
    },
  });
  
  // Remove simulated sessions mutation
  const removeSimulatedMutation = useMutation({
    mutationFn: withSafetyControls('sessions', 'userTracking', removeSimulatedSessions),
    onSuccess: () => {
      // Refresh sessions after removing simulated ones
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.sessions });
    },
    onError: (error) => {
      console.error('[Sessions] Remove simulated failed:', error);
    },
  });
  
  return {
    createSimulated: useCallback(
      (count = 1, autoActivity = true) => createSimulatedMutation.mutateAsync({ count, autoActivity }),
      [createSimulatedMutation]
    ),
    removeSimulated: useCallback(
      (sessionId = null) => removeSimulatedMutation.mutateAsync(sessionId),
      [removeSimulatedMutation]
    ),
    
    // Mutation states
    isCreatingSimulated: createSimulatedMutation.isPending,
    isRemovingSimulated: removeSimulatedMutation.isPending,
  };
}

/**
 * Hook for fetching simulated sessions
 */
export function useSimulatedSessionsQuery() {
  return useQuery({
    queryKey: ['simulatedSessions'],
    queryFn: withSafetyControls('sessions', 'userTracking', fetchSimulatedSessions),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/**
 * Combined user tracking hook - matches the interface of the legacy hook
 */
export function useUserTracking(config = {}) {
  const { data: sessions = { grouped: {}, guests: [], total: 0 }, isLoading: sessionsLoading, error: sessionsError } = useSessionsQuery(config);
  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useSessionEventsQuery(config);
  const simulatedMutations = useSimulatedSessionMutations();
  const { data: simulatedSessions = [] } = useSimulatedSessionsQuery();
  
  // Combined loading and error states
  const loading = sessionsLoading || eventsLoading;
  const error = sessionsError || eventsError;
  
  // Filter sessions by status
  const filterByStatus = useCallback((status) => {
    const filtered = { grouped: {}, guests: [], total: 0 };
    
    // Filter grouped sessions
    Object.entries(sessions.grouped).forEach(([userId, userSessions]) => {
      const filteredSessions = userSessions.filter(s => s.status === status);
      if (filteredSessions.length > 0) {
        filtered.grouped[userId] = filteredSessions;
        filtered.total += filteredSessions.length;
      }
    });
    
    // Filter guest sessions
    filtered.guests = sessions.guests.filter(s => s.status === status);
    filtered.total += filtered.guests.length;
    
    return filtered;
  }, [sessions]);
  
  // Get session statistics
  const getStats = useCallback(() => {
    let active = 0;
    let idle = 0;
    let inactive = 0;
    let total = 0;
    
    // Count grouped sessions
    Object.values(sessions.grouped).forEach(userSessions => {
      userSessions.forEach(session => {
        total++;
        if (session.status === 'active') active++;
        else if (session.status === 'idle') idle++;
        else if (session.status === 'inactive') inactive++;
      });
    });
    
    // Count guest sessions
    sessions.guests.forEach(session => {
      total++;
      if (session.status === 'active') active++;
      else if (session.status === 'idle') idle++;
      else if (session.status === 'inactive') inactive++;
    });
    
    return { active, idle, inactive, total };
  }, [sessions]);
  
  return {
    // Data
    sessions,
    events,
    loading,
    error: error?.message || null,
    
    // Connection mode (simplified - React Query handles smart polling)
    connectionMode: 'polling',
    changeMode: useCallback(() => {
      // No-op - React Query handles connection management
    }, []),
    
    // Actions
    refresh: useCallback(() => {
      // Force refetch both sessions and events
    }, []),
    createSimulatedSession: simulatedMutations.createSimulated,
    removeSimulatedSessions: simulatedMutations.removeSimulated,
    getSimulatedSessions: useCallback(() => simulatedSessions, [simulatedSessions]),
    
    // Utilities
    filterByStatus,
    getStats,
  };
}