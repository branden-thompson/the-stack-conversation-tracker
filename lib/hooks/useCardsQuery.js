/**
 * React Query Cards Hooks
 * 
 * React Query-powered card management hooks with optimistic updates.
 * Provides automatic caching, request deduplication, and optimistic updates for card operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { 
  fetchCards,
  createCard,
  updateCard,
  updateMultipleCards,
  deleteCard,
  moveCard,
  stackCards
} from '@/lib/api/cards-api';
import { QUERY_CONFIG } from '@/lib/providers/query-client';
import { withSafetyControls } from '@/lib/utils/safety-switches';

/**
 * Hook for fetching all cards
 */
export function useCardsQuery() {
  return useQuery({
    queryKey: QUERY_CONFIG.keys.cards,
    queryFn: withSafetyControls('cards', 'cardEvents', fetchCards),
    staleTime: QUERY_CONFIG.staleTime.cards,
    refetchInterval: QUERY_CONFIG.refetchInterval.cards,
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
 * Hook for card mutations with optimistic updates
 */
export function useCardMutations() {
  const queryClient = useQueryClient();
  
  // Create card mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: withSafetyControls('cards', 'cardEvents', createCard),
    onMutate: async (newCard) => {
      // Cancel ongoing queries to prevent overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.cards });
      
      // Snapshot the previous value
      const previousCards = queryClient.getQueryData(QUERY_CONFIG.keys.cards);
      
      // Optimistically update with temporary ID
      const tempCard = {
        ...newCard,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      queryClient.setQueryData(QUERY_CONFIG.keys.cards, (old = []) => [...old, tempCard]);
      
      return { previousCards, tempCard };
    },
    onSuccess: (realCard, variables, context) => {
      // Replace temporary card with real card
      queryClient.setQueryData(QUERY_CONFIG.keys.cards, (old = []) =>
        old.map(card => card.id === context.tempCard.id ? realCard : card)
      );
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousCards) {
        queryClient.setQueryData(QUERY_CONFIG.keys.cards, context.previousCards);
      }
      console.error('[Cards] Create failed:', error);
    },
  });
  
  // Update card mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: withSafetyControls('cards', 'cardEvents', updateCard),
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.cards });
      
      const previousCards = queryClient.getQueryData(QUERY_CONFIG.keys.cards);
      
      // Optimistically update
      queryClient.setQueryData(QUERY_CONFIG.keys.cards, (old = []) =>
        old.map(card => card.id === updateData.id 
          ? { ...card, ...updateData, updatedAt: new Date().toISOString() }
          : card
        )
      );
      
      return { previousCards };
    },
    onError: (error, variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(QUERY_CONFIG.keys.cards, context.previousCards);
      }
      console.error('[Cards] Update failed:', error);
    },
    onSettled: () => {
      // Always refetch to ensure consistency after server response
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.cards });
    },
  });
  
  // Update multiple cards mutation
  const updateMultipleMutation = useMutation({
    mutationFn: withSafetyControls('cards', 'cardEvents', updateMultipleCards),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.cards });
      
      const previousCards = queryClient.getQueryData(QUERY_CONFIG.keys.cards);
      
      // Create update map for efficient lookup
      const updateMap = new Map(updates.map(update => [update.id, update]));
      
      // Optimistically update multiple cards
      queryClient.setQueryData(QUERY_CONFIG.keys.cards, (old = []) =>
        old.map(card => {
          const update = updateMap.get(card.id);
          return update 
            ? { ...card, ...update, updatedAt: new Date().toISOString() }
            : card;
        })
      );
      
      return { previousCards };
    },
    onError: (error, variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(QUERY_CONFIG.keys.cards, context.previousCards);
      }
      console.error('[Cards] Multiple update failed:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.cards });
    },
  });
  
  // Delete card mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: withSafetyControls('cards', 'cardEvents', deleteCard),
    onMutate: async (cardId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.cards });
      
      const previousCards = queryClient.getQueryData(QUERY_CONFIG.keys.cards);
      
      // Optimistically remove card
      queryClient.setQueryData(QUERY_CONFIG.keys.cards, (old = []) =>
        old.filter(card => card.id !== cardId)
      );
      
      return { previousCards };
    },
    onError: (error, variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(QUERY_CONFIG.keys.cards, context.previousCards);
      }
      console.error('[Cards] Delete failed:', error);
    },
  });
  
  // Move card mutation (uses update under the hood)
  const moveMutation = useMutation({
    mutationFn: withSafetyControls('cards', 'cardEvents', 
      ({ cardId, newZone, position }) => moveCard(cardId, newZone, position)
    ),
    onMutate: async ({ cardId, newZone, position }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.cards });
      
      const previousCards = queryClient.getQueryData(QUERY_CONFIG.keys.cards);
      
      // Optimistically update card position and zone
      queryClient.setQueryData(QUERY_CONFIG.keys.cards, (old = []) =>
        old.map(card => card.id === cardId 
          ? { 
              ...card, 
              zone: newZone, 
              position: position || { x: 10, y: 50 },
              stackOrder: 0,
              updatedAt: new Date().toISOString()
            }
          : card
        )
      );
      
      return { previousCards };
    },
    onError: (error, variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(QUERY_CONFIG.keys.cards, context.previousCards);
      }
      console.error('[Cards] Move failed:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.cards });
    },
  });
  
  // Stack cards mutation
  const stackMutation = useMutation({
    mutationFn: withSafetyControls('cards', 'cardEvents', stackCards),
    onMutate: async (cardIds) => {
      await queryClient.cancelQueries({ queryKey: QUERY_CONFIG.keys.cards });
      
      const previousCards = queryClient.getQueryData(QUERY_CONFIG.keys.cards);
      
      // Create stack order map
      const stackMap = new Map(cardIds.map((id, index) => [id, index]));
      
      // Optimistically update stack order
      queryClient.setQueryData(QUERY_CONFIG.keys.cards, (old = []) =>
        old.map(card => {
          const stackOrder = stackMap.get(card.id);
          return stackOrder !== undefined 
            ? { ...card, stackOrder, updatedAt: new Date().toISOString() }
            : card;
        })
      );
      
      return { previousCards };
    },
    onError: (error, variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(QUERY_CONFIG.keys.cards, context.previousCards);
      }
      console.error('[Cards] Stack failed:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_CONFIG.keys.cards });
    },
  });
  
  return {
    create: createMutation.mutateAsync,
    update: useCallback(
      (id, updates) => updateMutation.mutateAsync({ id, ...updates }),
      [updateMutation]
    ),
    updateMultiple: updateMultipleMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    move: useCallback(
      (cardId, newZone, position) => moveMutation.mutateAsync({ cardId, newZone, position }),
      [moveMutation]
    ),
    stack: stackMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending || updateMultipleMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMoving: moveMutation.isPending,
    isStacking: stackMutation.isPending,
    
    // General loading state
    isMutating: createMutation.isPending || updateMutation.isPending || 
                updateMultipleMutation.isPending || deleteMutation.isPending ||
                moveMutation.isPending || stackMutation.isPending,
  };
}

/**
 * Combined cards hook - matches the interface of the legacy hook
 */
export function useCards() {
  const { data: cards = [], isLoading, error, refetch } = useCardsQuery();
  const mutations = useCardMutations();
  
  // Get cards organized by zone (memoized for performance)
  const getCardsByZone = useMemo(() => {
    return () => {
      return cards.reduce((acc, card) => {
        if (!acc[card.zone]) {
          acc[card.zone] = [];
        }
        acc[card.zone].push(card);
        return acc;
      }, {});
    };
  }, [cards]);
  
  // Create interface compatible with legacy hook
  return {
    cards,
    loading: isLoading,
    error: error?.message || null,
    
    // Card operations
    createCard: mutations.create,
    updateCard: mutations.update,
    updateMultipleCards: mutations.updateMultiple,
    deleteCard: mutations.delete,
    moveCard: mutations.move,
    stackCards: mutations.stack,
    
    // Utility functions
    getCardsByZone,
    refreshCards: refetch,
    
    // Loading states (bonus functionality not in legacy)
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isDeleting: mutations.isDeleting,
    isMoving: mutations.isMoving,
    isStacking: mutations.isStacking,
    isMutating: mutations.isMutating,
  };
}