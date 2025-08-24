/**
 * Request Coordinator - Prevents API Runaway
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | REQUEST COORDINATION
 * PURPOSE: Prevent duplicate requests and API overload in production Docker environments
 * 
 * FEATURES:
 * - Request deduplication with configurable windows
 * - Concurrent request limiting per endpoint
 * - Circuit breaker for failed requests
 * - Memory-efficient caching with TTL
 * - Production-safe resource monitoring
 */

'use client';

import { getEnvironmentConfig } from '../config/environment-config.js';

/**
 * Global request coordinator instance
 */
class RequestCoordinator {
  constructor() {
    this.envConfig = getEnvironmentConfig();
    
    // Active requests tracking
    this.activeRequests = new Map(); // endpoint -> Set of request IDs
    this.requestCache = new Map();   // request key -> cached response
    this.circuitBreakers = new Map(); // endpoint -> circuit breaker state
    
    // Performance monitoring
    this.stats = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      failedRequests: 0,
      circuitBreakerTrips: 0,
      lastResetTime: Date.now()
    };
    
    // Cleanup intervals
    this.setupCleanupInterval();
  }

  /**
   * Generate unique request key for deduplication
   */
  generateRequestKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    
    return `${endpoint}?${sortedParams}`;
  }

  /**
   * Check if request is already in progress
   */
  isRequestInProgress(endpoint, requestId) {
    const activeSet = this.activeRequests.get(endpoint);
    return activeSet && activeSet.has(requestId);
  }

  /**
   * Check concurrent request limits
   */
  canMakeRequest(endpoint) {
    const coordination = this.envConfig.coordination;
    const maxConcurrent = coordination.maxConcurrentRequests[this.getEndpointType(endpoint)] || 1;
    const activeSet = this.activeRequests.get(endpoint);
    
    return !activeSet || activeSet.size < maxConcurrent;
  }

  /**
   * Check circuit breaker status
   */
  isCircuitBreakerOpen(endpoint) {
    if (!this.envConfig.features.enableCircuitBreaker) {
      return false;
    }
    
    const breaker = this.circuitBreakers.get(endpoint);
    if (!breaker) {
      return false;
    }
    
    const now = Date.now();
    const safety = this.envConfig.safety.circuitBreaker;
    
    // Check if recovery timeout has passed
    if (breaker.isOpen && (now - breaker.openedAt) > safety.recoveryTimeout) {
      breaker.isOpen = false;
      breaker.failureCount = 0;
      return false;
    }
    
    return breaker.isOpen;
  }

  /**
   * Get cached response if available and valid
   */
  getCachedResponse(requestKey, endpoint) {
    const cached = this.requestCache.get(requestKey);
    if (!cached) {
      return null;
    }
    
    const now = Date.now();
    const coordination = this.envConfig.coordination;
    const ttl = coordination.deduplicationWindow[this.getEndpointType(endpoint)] || 2000;
    
    if ((now - cached.timestamp) > ttl) {
      this.requestCache.delete(requestKey);
      return null;
    }
    
    return cached.response;
  }

  /**
   * Cache response with TTL
   */
  cacheResponse(requestKey, response, endpoint) {
    const coordination = this.envConfig.coordination;
    const ttl = coordination.deduplicationWindow[this.getEndpointType(endpoint)] || 2000;
    
    this.requestCache.set(requestKey, {
      response: response,
      timestamp: Date.now(),
      ttl: ttl
    });
  }

  /**
   * Track active request
   */
  trackActiveRequest(endpoint, requestId) {
    if (!this.activeRequests.has(endpoint)) {
      this.activeRequests.set(endpoint, new Set());
    }
    
    const activeSet = this.activeRequests.get(endpoint);
    activeSet.add(requestId);
  }

  /**
   * Remove active request tracking
   */
  untrackActiveRequest(endpoint, requestId) {
    const activeSet = this.activeRequests.get(endpoint);
    if (activeSet) {
      activeSet.delete(requestId);
      
      if (activeSet.size === 0) {
        this.activeRequests.delete(endpoint);
      }
    }
  }

  /**
   * Record request failure for circuit breaker
   */
  recordFailure(endpoint) {
    if (!this.envConfig.features.enableCircuitBreaker) {
      return;
    }
    
    if (!this.circuitBreakers.has(endpoint)) {
      this.circuitBreakers.set(endpoint, {
        failureCount: 0,
        isOpen: false,
        openedAt: null
      });
    }
    
    const breaker = this.circuitBreakers.get(endpoint);
    breaker.failureCount++;
    
    const safety = this.envConfig.safety.circuitBreaker;
    if (breaker.failureCount >= safety.failureThreshold) {
      breaker.isOpen = true;
      breaker.openedAt = Date.now();
      this.stats.circuitBreakerTrips++;
    }
    
    this.stats.failedRequests++;
  }

  /**
   * Record successful request
   */
  recordSuccess(endpoint) {
    // Reset circuit breaker on success
    if (this.circuitBreakers.has(endpoint)) {
      const breaker = this.circuitBreakers.get(endpoint);
      breaker.failureCount = 0;
      breaker.isOpen = false;
    }
  }

  /**
   * Get endpoint type for configuration lookup
   */
  getEndpointType(endpoint) {
    if (endpoint.includes('/sessions')) return 'sessions';
    if (endpoint.includes('/conversations')) return 'conversations';
    if (endpoint.includes('/users')) return 'users';
    if (endpoint.includes('/events')) return 'events';
    return 'sessions'; // Default
  }

  /**
   * Coordinate request execution with deduplication and limits
   */
  async coordinateRequest(endpoint, params = {}, requestFn) {
    const requestKey = this.generateRequestKey(endpoint, params);
    const requestId = `${requestKey}-${Date.now()}-${Math.random()}`;
    
    this.stats.totalRequests++;
    
    try {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(endpoint)) {
        throw new Error(`Circuit breaker open for ${endpoint}`);
      }
      
      // Check for cached response (deduplication)
      const cachedResponse = this.getCachedResponse(requestKey, endpoint);
      if (cachedResponse) {
        this.stats.deduplicatedRequests++;
        return cachedResponse;
      }
      
      // Check concurrent request limits
      if (!this.canMakeRequest(endpoint)) {
        // Wait for existing request to complete
        await this.waitForActiveRequest(endpoint);
        
        // Try cache again after waiting
        const cachedAfterWait = this.getCachedResponse(requestKey, endpoint);
        if (cachedAfterWait) {
          this.stats.deduplicatedRequests++;
          return cachedAfterWait;
        }
      }
      
      // Check limits again after potential wait
      if (!this.canMakeRequest(endpoint)) {
        throw new Error(`Too many concurrent requests for ${endpoint}`);
      }
      
      // Track active request
      this.trackActiveRequest(endpoint, requestId);
      
      try {
        // Execute the actual request
        const response = await Promise.race([
          requestFn(),
          this.createTimeoutPromise(endpoint)
        ]);
        
        // Cache the response
        this.cacheResponse(requestKey, response, endpoint);
        
        // Record success
        this.recordSuccess(endpoint);
        
        return response;
        
      } finally {
        // Always untrack the request
        this.untrackActiveRequest(endpoint, requestId);
      }
      
    } catch (error) {
      this.recordFailure(endpoint);
      throw error;
    }
  }

  /**
   * Wait for active requests to complete
   */
  async waitForActiveRequest(endpoint, maxWait = 5000) {
    const start = Date.now();
    
    while (this.activeRequests.has(endpoint) && this.activeRequests.get(endpoint).size > 0) {
      if (Date.now() - start > maxWait) {
        break; // Timeout waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Create timeout promise for request
   */
  createTimeoutPromise(endpoint) {
    const coordination = this.envConfig.coordination;
    const timeout = coordination.requestTimeout[this.getEndpointType(endpoint)] || 15000;
    
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout for ${endpoint} after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Setup cleanup intervals for memory management
   */
  setupCleanupInterval() {
    // Clean cache every 30 seconds
    setInterval(() => {
      this.cleanupCache();
    }, 30000);
    
    // Reset stats every hour
    setInterval(() => {
      this.resetStats();
    }, 3600000);
  }

  /**
   * Clean expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    
    for (const [key, cached] of this.requestCache.entries()) {
      if ((now - cached.timestamp) > cached.ttl) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      failedRequests: 0,
      circuitBreakerTrips: 0,
      lastResetTime: Date.now()
    };
  }

  /**
   * Get coordinator statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.lastResetTime;
    
    return {
      ...this.stats,
      uptime,
      deduplicationRate: this.stats.totalRequests > 0 ? 
        (this.stats.deduplicatedRequests / this.stats.totalRequests * 100).toFixed(1) : 0,
      failureRate: this.stats.totalRequests > 0 ?
        (this.stats.failedRequests / this.stats.totalRequests * 100).toFixed(1) : 0,
      activeRequests: this.activeRequests.size,
      cachedResponses: this.requestCache.size,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([endpoint, breaker]) => ({
        endpoint,
        isOpen: breaker.isOpen,
        failureCount: breaker.failureCount
      }))
    };
  }

  /**
   * Force reset coordinator state (for testing)
   */
  reset() {
    this.activeRequests.clear();
    this.requestCache.clear();
    this.circuitBreakers.clear();
    this.resetStats();
  }
}

// Global singleton instance
let globalCoordinator = null;

/**
 * Get or create global request coordinator
 */
export function getRequestCoordinator() {
  if (!globalCoordinator) {
    globalCoordinator = new RequestCoordinator();
  }
  return globalCoordinator;
}

/**
 * Coordinate a fetch request with deduplication and limits
 */
export async function coordinatedFetch(endpoint, options = {}, params = {}) {
  const coordinator = getRequestCoordinator();
  
  return coordinator.coordinateRequest(endpoint, params, async () => {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  });
}

/**
 * React hook for coordinated requests
 */
export function useCoordinatedRequest() {
  const coordinator = getRequestCoordinator();
  
  return {
    coordinatedFetch: coordinatedFetch,
    getStats: () => coordinator.getStats(),
    reset: () => coordinator.reset()
  };
}

const RequestCoordinatorExports = {
  getRequestCoordinator,
  coordinatedFetch,
  useCoordinatedRequest,
  RequestCoordinator
};

export default RequestCoordinatorExports;