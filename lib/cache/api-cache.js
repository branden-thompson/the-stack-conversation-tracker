/**
 * API Response Caching System
 * Provides TTL-based caching for API responses to improve performance
 * Now with memory-efficient LRU cache to prevent unbounded growth
 */

import { LRUCache } from './lru-cache.js';

// Initialize LRU cache with memory limits
const cache = new LRUCache({
  maxSize: 200,                    // Maximum 200 cache entries
  defaultTTL: 30 * 1000           // 30 second default TTL
});

// Automatic cleanup interval (runs every 2 minutes)
let cleanupInterval = null;

// Initialize automatic cleanup when module loads
if (typeof window === 'undefined') {
  // Server-side: set up cleanup interval
  startAutomaticCleanup();
} else {
  // Client-side: cleanup on visibility change and page unload
  setupClientCleanup();
}

/**
 * Start automatic cache cleanup (server-side)
 */
function startAutomaticCleanup() {
  if (cleanupInterval) return; // Already running
  
  cleanupInterval = setInterval(() => {
    const cleaned = cleanupExpiredEntries();
    const stats = cache.getStats();
    
    // Log memory usage in development
    if (process.env.NODE_ENV === 'development' && (cleaned > 0 || stats.size > 100)) {
      console.log(`[Cache] Automatic cleanup: ${cleaned} expired, ${stats.size}/${stats.maxSize} entries, ${stats.memoryUsage.estimatedKB}KB`);
    }
  }, 2 * 60 * 1000); // Every 2 minutes
}

/**
 * Setup client-side cache cleanup
 */
function setupClientCleanup() {
  // Cleanup when tab becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      cleanupExpiredEntries();
    }
  });
  
  // Cleanup before page unload
  window.addEventListener('beforeunload', () => {
    cleanupExpiredEntries();
  });
}

/**
 * Stop automatic cleanup (for testing or shutdown)
 */
export function stopAutomaticCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Cache configuration with different TTL for different data types
 */
const CACHE_CONFIG = {
  // Static/semi-static data - longer TTL
  users: {
    ttl: 60 * 1000,        // 60 seconds
    key: 'api:users:all',
  },
  user: {
    ttl: 30 * 1000,        // 30 seconds  
    keyPrefix: 'api:user:',
  },
  conversations: {
    ttl: 30 * 1000,        // 30 seconds
    key: 'api:conversations:all',
  },
  conversation: {
    ttl: 15 * 1000,        // 15 seconds
    keyPrefix: 'api:conversation:',
  },
  
  // Dynamic data - shorter TTL
  sessions: {
    ttl: 10 * 1000,        // 10 seconds
    key: 'api:sessions:all',
  },
  session: {
    ttl: 5 * 1000,         // 5 seconds
    keyPrefix: 'api:session:',
  },
  events: {
    ttl: 5 * 1000,         // 5 seconds
    key: 'api:events:recent',
  },
  
  // Very dynamic data - minimal TTL
  cards: {
    ttl: 5 * 1000,         // 5 seconds
    key: 'api:cards:all',
  },
  browserSessions: {
    ttl: 2 * 1000,         // 2 seconds
    keyPrefix: 'api:browser-session:',
  },
};

/**
 * Cache entry structure (simplified - TTL now handled by LRU cache)
 */
class CacheEntry {
  constructor(data, ttl) {
    this.data = data;
    this.timestamp = Date.now();
    this.ttl = ttl;
  }

  // TTL management now delegated to LRU cache
  isExpired() {
    // LRU cache handles expiration
    return false;
  }

  getRemainingTTL() {
    // Approximation - LRU cache manages actual TTL
    return this.ttl;
  }
}

/**
 * Get cached response if available and not expired
 */
export function getCachedResponse(cacheKey) {
  const entry = cache.get(cacheKey);
  
  if (!entry) {
    return null;
  }
  
  // LRU cache handles expiration automatically
  return entry.data;
}

/**
 * Set cached response with TTL
 */
export function setCachedResponse(cacheKey, data, ttl) {
  const entry = new CacheEntry(data, ttl);
  cache.set(cacheKey, entry, ttl); // TTL passed to LRU cache
  
  // Optional: Log cache set for debugging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cache] Set ${cacheKey} (TTL: ${ttl}ms)`);
  }
}

/**
 * Invalidate specific cache key
 */
export function invalidateCache(cacheKey) {
  const deleted = cache.delete(cacheKey);
  
  if (process.env.NODE_ENV === 'development' && deleted) {
    console.log(`[Cache] Invalidated ${cacheKey}`);
  }
  
  return deleted;
}

/**
 * Invalidate cache keys matching a pattern (prefix)
 */
export function invalidateCachePattern(pattern) {
  let deletedCount = 0;
  
  for (const [key] of cache) {
    if (key.startsWith(pattern)) {
      cache.delete(key);
      deletedCount++;
    }
  }
  
  if (process.env.NODE_ENV === 'development' && deletedCount > 0) {
    console.log(`[Cache] Invalidated ${deletedCount} keys matching "${pattern}*"`);
  }
  
  return deletedCount;
}

/**
 * Clear all cache entries
 */
export function clearCache() {
  const size = cache.size;
  cache.clear();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cache] Cleared all ${size} entries`);
  }
  
  return size;
}

/**
 * Get cache statistics (enhanced with LRU cache stats)
 */
export function getCacheStats() {
  const lruStats = cache.getStats();
  
  return {
    ...lruStats,
    timestamp: Date.now(),
  };
}

/**
 * Cleanup expired entries (delegated to LRU cache)
 */
export function cleanupExpiredEntries() {
  const cleanedCount = cache.cleanup();
  
  if (process.env.NODE_ENV === 'development' && cleanedCount > 0) {
    console.log(`[Cache] Cleaned up ${cleanedCount} expired entries`);
  }
  
  return cleanedCount;
}

/**
 * Higher-level cache helper for API routes
 */
export function withCache(cacheType, identifier = null) {
  return {
    getKey: () => {
      const config = CACHE_CONFIG[cacheType];
      if (!config) {
        throw new Error(`Unknown cache type: ${cacheType}`);
      }
      
      if (config.key) {
        return config.key;
      } else if (config.keyPrefix && identifier) {
        return `${config.keyPrefix}${identifier}`;
      } else {
        throw new Error(`Cache type ${cacheType} requires identifier`);
      }
    },
    
    get: function() {
      return getCachedResponse(this.getKey());
    },
    
    set: function(data) {
      const config = CACHE_CONFIG[cacheType];
      setCachedResponse(this.getKey(), data, config.ttl);
    },
    
    invalidate: function() {
      return invalidateCache(this.getKey());
    },
    
    getTTL: () => CACHE_CONFIG[cacheType].ttl,
  };
}

/**
 * Middleware wrapper for API routes
 */
export function cacheMiddleware(cacheType, identifier = null) {
  return function(handler) {
    return async function(request, ...args) {
      const cache = withCache(cacheType, identifier);
      
      // Try to get from cache first
      const cachedResponse = cache.get();
      if (cachedResponse) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Cache] HIT ${cache.getKey()}`);
        }
        return cachedResponse;
      }
      
      // Cache miss - execute handler
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache] MISS ${cache.getKey()}`);
      }
      
      const response = await handler(request, ...args);
      
      // Cache successful responses only
      if (response && !response.error && response.status !== 500) {
        cache.set(response);
      }
      
      return response;
    };
  };
}

export { CACHE_CONFIG };