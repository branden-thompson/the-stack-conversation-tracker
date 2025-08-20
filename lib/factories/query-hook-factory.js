/**
 * React Query Hook Factory
 * 
 * Creates standardized React Query hooks with consistent patterns for
 * data fetching, caching, mutations, and optimistic updates.
 * Reduces code duplication across 5+ query hook files.
 * 
 * Part of: Mini-Project 2 - Pattern Extraction & API Standardization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { QUERY_CONFIG } from '@/lib/providers/query-client';
import { withSafetyControls } from '@/lib/utils/safety-switches';

/**
 * Default query configurations
 */
const DEFAULT_QUERY_CONFIG = {
  staleTime: 30000,    // 30 seconds
  gcTime: 300000,      // 5 minutes
  refetchInterval: false,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
};

/**
 * Create standardized query hook
 */
export function createQueryHook(config) {
  const {
    resource,
    queryKey,
    queryFn,
    safetyControls = [],
    queryOptions = {},
    mutations = {},
    optimisticUpdates = {},
    cache = {},
  } = config;

  const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);

  return function useResourceQuery(options = {}) {
    const queryClient = useQueryClient();

    // Merge query options with defaults
    const finalQueryOptions = {
      ...DEFAULT_QUERY_CONFIG,
      staleTime: QUERY_CONFIG.staleTime[resource] || DEFAULT_QUERY_CONFIG.staleTime,
      refetchInterval: QUERY_CONFIG.refetchInterval[resource] || DEFAULT_QUERY_CONFIG.refetchInterval,
      ...queryOptions,
      ...options,
    };

    // Create query with safety controls
    const query = useQuery({
      queryKey: typeof queryKey === 'function' ? queryKey(options) : queryKey,
      queryFn: safetyControls.length > 0 
        ? withSafetyControls(...safetyControls, queryFn)
        : queryFn,
      ...finalQueryOptions,
    });

    // Create mutations
    const mutations = useMemo(() => {
      const mutationHandlers = {};

      // Create mutation
      if (mutations.create) {
        mutationHandlers.create = useMutation({
          mutationFn: mutations.create.fn,
          onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Optimistic update
            if (optimisticUpdates.create) {
              const previousData = queryClient.getQueryData(queryKey);
              const optimisticData = optimisticUpdates.create(previousData, variables);
              queryClient.setQueryData(queryKey, optimisticData);
              return { previousData };
            }

            return null;
          },
          onError: (err, variables, context) => {
            // Rollback optimistic update
            if (context?.previousData) {
              queryClient.setQueryData(queryKey, context.previousData);
            }
            
            if (mutations.create.onError) {
              mutations.create.onError(err, variables, context);
            }
          },
          onSuccess: (data, variables, context) => {
            // Invalidate and refetch
            if (cache.invalidateOnCreate !== false) {
              queryClient.invalidateQueries({ queryKey });
            }
            
            if (mutations.create.onSuccess) {
              mutations.create.onSuccess(data, variables, context);
            }
          },
        });
      }

      // Update mutation
      if (mutations.update) {
        mutationHandlers.update = useMutation({
          mutationFn: mutations.update.fn,
          onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });

            if (optimisticUpdates.update) {
              const previousData = queryClient.getQueryData(queryKey);
              const optimisticData = optimisticUpdates.update(previousData, variables);
              queryClient.setQueryData(queryKey, optimisticData);
              return { previousData };
            }

            return null;
          },
          onError: (err, variables, context) => {
            if (context?.previousData) {
              queryClient.setQueryData(queryKey, context.previousData);
            }
            
            if (mutations.update.onError) {
              mutations.update.onError(err, variables, context);
            }
          },
          onSuccess: (data, variables, context) => {
            if (cache.invalidateOnUpdate !== false) {
              queryClient.invalidateQueries({ queryKey });
            }
            
            if (mutations.update.onSuccess) {
              mutations.update.onSuccess(data, variables, context);
            }
          },
        });
      }

      // Delete mutation
      if (mutations.delete) {
        mutationHandlers.delete = useMutation({
          mutationFn: mutations.delete.fn,
          onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });

            if (optimisticUpdates.delete) {
              const previousData = queryClient.getQueryData(queryKey);
              const optimisticData = optimisticUpdates.delete(previousData, variables);
              queryClient.setQueryData(queryKey, optimisticData);
              return { previousData };
            }

            return null;
          },
          onError: (err, variables, context) => {
            if (context?.previousData) {
              queryClient.setQueryData(queryKey, context.previousData);
            }
            
            if (mutations.delete.onError) {
              mutations.delete.onError(err, variables, context);
            }
          },
          onSuccess: (data, variables, context) => {
            if (cache.invalidateOnDelete !== false) {
              queryClient.invalidateQueries({ queryKey });
            }
            
            if (mutations.delete.onSuccess) {
              mutations.delete.onSuccess(data, variables, context);
            }
          },
        });
      }

      // Bulk operations
      if (mutations.updateMany) {
        mutationHandlers.updateMany = useMutation({
          mutationFn: mutations.updateMany.fn,
          onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });

            if (optimisticUpdates.updateMany) {
              const previousData = queryClient.getQueryData(queryKey);
              const optimisticData = optimisticUpdates.updateMany(previousData, variables);
              queryClient.setQueryData(queryKey, optimisticData);
              return { previousData };
            }

            return null;
          },
          onError: (err, variables, context) => {
            if (context?.previousData) {
              queryClient.setQueryData(queryKey, context.previousData);
            }
            
            if (mutations.updateMany.onError) {
              mutations.updateMany.onError(err, variables, context);
            }
          },
          onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey });
            
            if (mutations.updateMany.onSuccess) {
              mutations.updateMany.onSuccess(data, variables, context);
            }
          },
        });
      }

      return mutationHandlers;
    }, [queryClient, queryKey]);

    // Create utility functions
    const utils = useMemo(() => ({
      // Invalidate cache
      invalidate: useCallback(() => {
        queryClient.invalidateQueries({ queryKey });
      }, [queryClient, queryKey]),

      // Refetch data
      refetch: useCallback(() => {
        return queryClient.refetchQueries({ queryKey });
      }, [queryClient, queryKey]),

      // Get cached data
      getCachedData: useCallback(() => {
        return queryClient.getQueryData(queryKey);
      }, [queryClient, queryKey]),

      // Set cached data
      setCachedData: useCallback((data) => {
        queryClient.setQueryData(queryKey, data);
      }, [queryClient, queryKey]),

      // Remove from cache
      removeFromCache: useCallback(() => {
        queryClient.removeQueries({ queryKey });
      }, [queryClient, queryKey]),

      // Prefetch data
      prefetch: useCallback((options = {}) => {
        return queryClient.prefetchQuery({
          queryKey,
          queryFn: safetyControls.length > 0 
            ? withSafetyControls(...safetyControls, queryFn)
            : queryFn,
          ...finalQueryOptions,
          ...options,
        });
      }, [queryClient, queryKey, finalQueryOptions, safetyControls, queryFn]),
    }), [queryClient, queryKey, finalQueryOptions, safetyControls, queryFn]);

    // Return query data and operations
    return {
      // Query state
      data: query.data,
      error: query.error,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isRefetching: query.isRefetching,
      isStale: query.isStale,
      isSuccess: query.isSuccess,
      isError: query.isError,
      status: query.status,
      fetchStatus: query.fetchStatus,

      // Raw query object for advanced usage
      query,

      // Mutations
      ...mutations,

      // Utilities
      ...utils,

      // Legacy aliases for backwards compatibility
      loading: query.isLoading,
      refetching: query.isRefetching,
      refresh: utils.refetch,
    };
  };
}

/**
 * Create collection query hook with item operations
 */
export function createCollectionQueryHook(config) {
  const baseHook = createQueryHook(config);
  
  return function useCollectionQuery(options = {}) {
    const baseResult = baseHook(options);
    
    // Add collection-specific utilities
    const collectionUtils = useMemo(() => ({
      // Find item by ID
      findById: useCallback((id) => {
        const data = baseResult.data;
        if (Array.isArray(data)) {
          return data.find(item => item.id === id);
        }
        return null;
      }, [baseResult.data]),

      // Filter items
      filter: useCallback((predicate) => {
        const data = baseResult.data;
        if (Array.isArray(data)) {
          return data.filter(predicate);
        }
        return [];
      }, [baseResult.data]),

      // Get item count
      count: useMemo(() => {
        const data = baseResult.data;
        return Array.isArray(data) ? data.length : 0;
      }, [baseResult.data]),

      // Check if collection is empty
      isEmpty: useMemo(() => {
        const data = baseResult.data;
        return !Array.isArray(data) || data.length === 0;
      }, [baseResult.data]),

      // Get items by property
      getBy: useCallback((property, value) => {
        const data = baseResult.data;
        if (Array.isArray(data)) {
          return data.filter(item => item[property] === value);
        }
        return [];
      }, [baseResult.data]),
    }), [baseResult]);

    return {
      ...baseResult,
      ...collectionUtils,
    };
  };
}

/**
 * Create paginated query hook
 */
export function createPaginatedQueryHook(config) {
  const baseConfig = {
    ...config,
    queryKey: (options) => [
      ...(typeof config.queryKey === 'function' ? config.queryKey(options) : config.queryKey),
      { page: options.page || 1, limit: options.limit || 10 }
    ],
    queryFn: (context) => {
      const { page = 1, limit = 10 } = context.queryKey[context.queryKey.length - 1];
      return config.queryFn({ ...context, page, limit });
    },
  };

  const baseHook = createQueryHook(baseConfig);

  return function usePaginatedQuery(options = {}) {
    const { page = 1, limit = 10, ...queryOptions } = options;
    const result = baseHook({ page, limit, ...queryOptions });

    // Add pagination utilities
    const paginationUtils = useMemo(() => ({
      currentPage: page,
      pageSize: limit,
      hasNextPage: result.data?.hasNext || false,
      hasPreviousPage: page > 1,
      totalCount: result.data?.total || 0,
      totalPages: Math.ceil((result.data?.total || 0) / limit),
      
      // Navigation
      nextPage: useCallback(() => {
        if (result.data?.hasNext) {
          return baseHook({ page: page + 1, limit, ...queryOptions });
        }
      }, [result.data, page, limit, queryOptions]),

      previousPage: useCallback(() => {
        if (page > 1) {
          return baseHook({ page: page - 1, limit, ...queryOptions });
        }
      }, [page, limit, queryOptions]),

      goToPage: useCallback((targetPage) => {
        return baseHook({ page: targetPage, limit, ...queryOptions });
      }, [limit, queryOptions]),
    }), [result.data, page, limit, queryOptions]);

    return {
      ...result,
      ...paginationUtils,
      items: result.data?.items || [],
    };
  };
}

/**
 * Optimistic update helpers
 */
export const optimisticUpdateHelpers = {
  /**
   * Add item to collection optimistically
   */
  addToCollection: (collection, newItem) => {
    if (!Array.isArray(collection)) return [newItem];
    return [...collection, newItem];
  },

  /**
   * Update item in collection optimistically
   */
  updateInCollection: (collection, updatedItem) => {
    if (!Array.isArray(collection)) return [updatedItem];
    return collection.map(item => 
      item.id === updatedItem.id ? { ...item, ...updatedItem } : item
    );
  },

  /**
   * Remove item from collection optimistically
   */
  removeFromCollection: (collection, itemId) => {
    if (!Array.isArray(collection)) return [];
    return collection.filter(item => item.id !== itemId);
  },

  /**
   * Update multiple items in collection optimistically
   */
  updateManyInCollection: (collection, updates) => {
    if (!Array.isArray(collection)) return updates;
    const updateMap = new Map(updates.map(item => [item.id, item]));
    return collection.map(item => 
      updateMap.has(item.id) ? { ...item, ...updateMap.get(item.id) } : item
    );
  },
};

export default createQueryHook;