/**
 * React Query Conversations Hooks
 * 
 * React Query-powered conversation management hooks.
 * Provides automatic caching, request deduplication, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { 
  fetchConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  fetchConversationEvents,
  logConversationEvent,
  clearConversationEvents
} from '@/lib/api/conversations-api';
import { QUERY_CONFIG } from '@/lib/providers/query-client';
import { withSafetyControls } from '@/lib/utils/safety-switches';

/**
 * Hook for fetching all conversations
 */
export function useConversationsQuery() {
  return useQuery({
    queryKey: QUERY_CONFIG.keys.conversations,
    queryFn: withSafetyControls('conversations', 'conversationPolling', fetchConversations),
    staleTime: QUERY_CONFIG.staleTime.conversations,
    refetchInterval: QUERY_CONFIG.refetchInterval.conversations,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for conversation mutations (create, update, delete)
 */
export function useConversationMutations() {
  const queryClient = useQueryClient();
  
  // Create conversation mutation
  const createMutation = useMutation({
    mutationFn: withSafetyControls('conversations', 'conversationPolling', createConversation),
    onSuccess: () => {
      // Invalidate conversations to refetch fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.conversations });
    },
    onError: (error) => {
      console.error('[Conversations] Create failed:', error);
    },
  });
  
  // Update conversation mutation
  const updateMutation = useMutation({
    mutationFn: withSafetyControls('conversations', 'conversationPolling', 
      ({ id, patch }) => updateConversation(id, patch)
    ),
    onMutate: async ({ id, patch }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.conversations });
      
      // Get current data for potential rollback
      const previousData = queryClient.getQueryData(QUERY_CONFIG.keys.conversations);
      
      // Optimistically update
      if (previousData) {
        queryClient.setQueryData(QUERY_CONFIG.keys.conversations, (old) => ({
          ...old,
          items: old.items.map(item => 
            item.id === id ? { ...item, ...patch } : item
          ),
        }));
      }
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_CONFIG.keys.conversations, context.previousData);
      }
      console.error('[Conversations] Update failed:', error);
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.conversations });
    },
  });
  
  // Delete conversation mutation
  const deleteMutation = useMutation({
    mutationFn: withSafetyControls('conversations', 'conversationPolling', deleteConversation),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.conversations });
      
      const previousData = queryClient.getQueryData(QUERY_CONFIG.keys.conversations);
      
      // Optimistically remove from cache
      if (previousData) {
        queryClient.setQueryData(QUERY_CONFIG.keys.conversations, (old) => ({
          ...old,
          items: old.items.filter(item => item.id !== id),
          activeId: old.activeId === id ? null : old.activeId,
        }));
      }
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(QUERY_CONFIG.keys.conversations, context.previousData);
      }
      console.error('[Conversations] Delete failed:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.conversations });
    },
  });
  
  return {
    create: createMutation.mutateAsync,
    update: useCallback(
      (id, patch) => updateMutation.mutateAsync({ id, patch }),
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
 * Hook for conversation events
 */
export function useConversationEventsQuery(conversationId) {
  return useQuery({
    queryKey: QUERY_CONFIG.keys.conversationById(conversationId).concat('events'),
    queryFn: () => withSafetyControls('conversations', 'conversationPolling', 
      () => fetchConversationEvents(conversationId)
    )(),
    enabled: !!conversationId, // Only run if we have an ID
    staleTime: QUERY_CONFIG.staleTime.events,
    refetchInterval: QUERY_CONFIG.refetchInterval.events,
  });
}

/**
 * Hook for conversation event mutations
 */
export function useConversationEventMutations(conversationId) {
  const queryClient = useQueryClient();
  const eventsQueryKey = QUERY_CONFIG.keys.conversationById(conversationId).concat('events');
  
  // Log event mutation
  const logEventMutation = useMutation({
    mutationFn: withSafetyControls('conversations', 'conversationPolling',
      ({ type, payload }) => logConversationEvent(conversationId, type, payload)
    ),
    onSuccess: () => {
      // Invalidate events query to refetch
      queryClient.invalidateQueries({ queryKey: eventsQueryKey });
    },
  });
  
  // Clear events mutation
  const clearEventsMutation = useMutation({
    mutationFn: withSafetyControls('conversations', 'conversationPolling',
      () => clearConversationEvents(conversationId)
    ),
    onSuccess: () => {
      // Clear the events cache
      queryClient.setQueryData(eventsQueryKey, []);
      queryClient.invalidateQueries({ queryKey: eventsQueryKey });
    },
  });
  
  return {
    logEvent: useCallback(
      (type, payload) => logEventMutation.mutateAsync({ type, payload }),
      [logEventMutation]
    ),
    clearEvents: clearEventsMutation.mutateAsync,
    
    // Mutation states
    isLoggingEvent: logEventMutation.isPending,
    isClearingEvents: clearEventsMutation.isPending,
  };
}

/**
 * Combined conversations hook - matches the interface of the legacy hook
 */
export function useConversations() {
  const { data, isLoading, error, refetch } = useConversationsQuery();
  const mutations = useConversationMutations();
  
  // Extract data with fallbacks
  const items = data?.items || [];
  const activeId = data?.activeId || null;
  
  // Create interface compatible with legacy hook
  return {
    loading: isLoading,
    error: error?.message || '',
    items,
    activeId,
    
    // Legacy interface methods
    setActiveId: useCallback((id) => {
      // This would require server-side update to maintain consistency
      console.warn('[useConversations] setActiveId not yet implemented for React Query version');
    }, []),
    
    refresh: refetch,
    create: mutations.create,
    patch: mutations.update,
    
    // Event methods (require conversation ID)
    listEvents: useCallback((id) => {
      return fetchConversationEvents(id);
    }, []),
    
    logEvent: useCallback((id, type, payload) => {
      return logConversationEvent(id, type, payload);
    }, []),
    
    clearEvents: useCallback((id) => {
      return clearConversationEvents(id);
    }, []),
  };
}