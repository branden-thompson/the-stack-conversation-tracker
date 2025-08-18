/**
 * API Response Caching System
 * Provides TTL-based caching for API responses to improve performance
 */

const cache = new Map();

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
 * Cache entry structure
 */
class CacheEntry {
  constructor(data, ttl) {
    this.data = data;
    this.timestamp = Date.now();
    this.ttl = ttl;
    this.expiresAt = this.timestamp + ttl;
  }

  isExpired() {
    return Date.now() > this.expiresAt;
  }

  getRemainingTTL() {
    return Math.max(0, this.expiresAt - Date.now());
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
  
  if (entry.isExpired()) {
    cache.delete(cacheKey);
    return null;
  }
  
  return entry.data;
}

/**
 * Set cached response with TTL
 */
export function setCachedResponse(cacheKey, data, ttl) {
  const entry = new CacheEntry(data, ttl);
  cache.set(cacheKey, entry);
  
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
 * Get cache statistics
 */
export function getCacheStats() {
  let expired = 0;
  let active = 0;
  const now = Date.now();
  
  for (const [key, entry] of cache) {
    if (entry.isExpired()) {
      expired++;
    } else {
      active++;
    }
  }
  
  return {
    total: cache.size,
    active,
    expired,
    timestamp: now,
  };
}

/**
 * Cleanup expired entries (can be called periodically)
 */
export function cleanupExpiredEntries() {
  let cleanedCount = 0;
  
  for (const [key, entry] of cache) {
    if (entry.isExpired()) {
      cache.delete(key);
      cleanedCount++;
    }
  }
  
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