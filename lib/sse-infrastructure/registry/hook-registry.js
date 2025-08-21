/**
 * SSE Hook Registry - Global Hook Coordination
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | HOOK COORDINATION
 * PURPOSE: Prevent multiple SSE hooks from running simultaneously on same endpoint
 * 
 * FEATURES:
 * - Global singleton registry for active hooks
 * - Hook lifecycle tracking for debugging
 * - Endpoint-based hook deduplication
 * - Performance monitoring and statistics
 */

'use client';

/**
 * SSE Hook Registry Class
 * Manages active SSE hooks to prevent conflicts and API runaway
 */
class SSEHookRegistry {
  constructor() {
    // Core registry data
    this.activeHooks = new Map(); // endpoint -> { hookId, config, startTime, stats }
    this.hookLifecycle = new Map(); // hookId -> { endpoint, registration, events }
    
    // Performance tracking
    this.stats = {
      totalRegistrations: 0,
      activeCount: 0,
      rejectedRegistrations: 0,
      averageLifetime: 0,
      lastResetTime: Date.now()
    };
    
    // Cleanup interval for stale hooks
    this.setupCleanupInterval();
    
    console.log('[SSEHookRegistry] Registry initialized');
  }
  
  /**
   * Generate unique hook ID for tracking
   */
  generateHookId(endpoint, componentName = 'unknown') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${componentName}-${endpoint.replace(/[^a-zA-Z0-9]/g, '')}-${timestamp}-${random}`;
  }
  
  /**
   * Register a new SSE hook for an endpoint
   * @param {string} endpoint - API endpoint (e.g., '/api/sessions')
   * @param {string} componentName - Component name for debugging
   * @param {object} config - Hook configuration
   * @returns {string|null} - Hook ID if registered, null if rejected
   */
  registerHook(endpoint, componentName, config = {}) {
    const hookId = this.generateHookId(endpoint, componentName);
    
    // Check for existing hook on this endpoint
    if (this.activeHooks.has(endpoint)) {
      const existing = this.activeHooks.get(endpoint);
      this.stats.rejectedRegistrations++;
      
      console.warn(`[SSEHookRegistry] Registration REJECTED: Hook already active for ${endpoint}`, {
        existingHook: existing.hookId,
        attemptedHook: hookId,
        existingComponent: existing.config.componentName,
        attemptedComponent: componentName
      });
      
      return null;
    }
    
    // Register the new hook
    const registration = {
      hookId,
      config: { ...config, componentName },
      startTime: Date.now(),
      endpoint,
      stats: {
        requestCount: 0,
        errorCount: 0,
        lastActivity: Date.now()
      }
    };
    
    this.activeHooks.set(endpoint, registration);
    this.hookLifecycle.set(hookId, {
      endpoint,
      registration: Date.now(),
      events: []
    });
    
    // Update statistics
    this.stats.totalRegistrations++;
    this.stats.activeCount = this.activeHooks.size;
    
    console.log(`[SSEHookRegistry] Hook REGISTERED: ${hookId}`, {
      endpoint,
      componentName,
      config,
      totalActive: this.stats.activeCount
    });
    
    return hookId;
  }
  
  /**
   * Unregister an SSE hook
   * @param {string} hookId - Hook ID to unregister
   * @returns {boolean} - True if successfully unregistered
   */
  unregisterHook(hookId) {
    const lifecycle = this.hookLifecycle.get(hookId);
    if (!lifecycle) {
      console.warn(`[SSEHookRegistry] Unregistration FAILED: Hook not found - ${hookId}`);
      return false;
    }
    
    const { endpoint } = lifecycle;
    const active = this.activeHooks.get(endpoint);
    
    // Verify this is the correct hook
    if (!active || active.hookId !== hookId) {
      console.warn(`[SSEHookRegistry] Unregistration FAILED: Hook mismatch`, {
        hookId,
        endpoint,
        activeHookId: active?.hookId
      });
      return false;
    }
    
    // Calculate lifetime for statistics
    const lifetime = Date.now() - active.startTime;
    this.updateLifetimeStats(lifetime);
    
    // Remove from registry
    this.activeHooks.delete(endpoint);
    this.hookLifecycle.delete(hookId);
    this.stats.activeCount = this.activeHooks.size;
    
    console.log(`[SSEHookRegistry] Hook UNREGISTERED: ${hookId}`, {
      endpoint,
      lifetime: `${lifetime}ms`,
      totalActive: this.stats.activeCount
    });
    
    return true;
  }
  
  /**
   * Check if a hook is registered and active
   * @param {string} hookId - Hook ID to check
   * @returns {boolean} - True if hook is active
   */
  isHookActive(hookId) {
    return this.hookLifecycle.has(hookId);
  }
  
  /**
   * Get active hook for an endpoint
   * @param {string} endpoint - Endpoint to check
   * @returns {object|null} - Active hook data or null
   */
  getActiveHook(endpoint) {
    return this.activeHooks.get(endpoint) || null;
  }
  
  /**
   * Track hook activity (requests, errors, etc.)
   * @param {string} hookId - Hook ID
   * @param {string} activity - Activity type
   * @param {object} data - Activity data
   */
  trackActivity(hookId, activity, data = {}) {
    const lifecycle = this.hookLifecycle.get(hookId);
    if (!lifecycle) {
      return;
    }
    
    // Add to lifecycle events
    lifecycle.events.push({
      type: activity,
      timestamp: Date.now(),
      data
    });
    
    // Update hook stats
    const active = this.activeHooks.get(lifecycle.endpoint);
    if (active && active.hookId === hookId) {
      active.stats.lastActivity = Date.now();
      
      if (activity === 'request') {
        active.stats.requestCount++;
      } else if (activity === 'error') {
        active.stats.errorCount++;
      }
    }
    
    // Keep only recent events (last 50)
    if (lifecycle.events.length > 50) {
      lifecycle.events = lifecycle.events.slice(-50);
    }
  }
  
  /**
   * Get registry statistics
   * @returns {object} - Registry statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.lastResetTime;
    
    return {
      ...this.stats,
      uptime,
      activeHooks: Array.from(this.activeHooks.entries()).map(([endpoint, hook]) => ({
        endpoint,
        hookId: hook.hookId,
        componentName: hook.config.componentName,
        uptime: Date.now() - hook.startTime,
        requestCount: hook.stats.requestCount,
        errorCount: hook.stats.errorCount,
        lastActivity: Date.now() - hook.stats.lastActivity
      }))
    };
  }
  
  /**
   * Update lifetime statistics
   * @private
   */
  updateLifetimeStats(lifetime) {
    const currentAvg = this.stats.averageLifetime;
    const totalCompleted = this.stats.totalRegistrations - this.stats.activeCount;
    
    if (totalCompleted === 1) {
      this.stats.averageLifetime = lifetime;
    } else {
      // Running average calculation
      this.stats.averageLifetime = ((currentAvg * (totalCompleted - 1)) + lifetime) / totalCompleted;
    }
  }
  
  /**
   * Setup cleanup interval for stale hooks
   * @private
   */
  setupCleanupInterval() {
    const cleanupInterval = 60000; // 1 minute
    const staleThreshold = 300000; // 5 minutes
    
    setInterval(() => {
      const now = Date.now();
      const staleHooks = [];
      
      for (const [endpoint, hook] of this.activeHooks.entries()) {
        const inactiveTime = now - hook.stats.lastActivity;
        if (inactiveTime > staleThreshold) {
          staleHooks.push({ endpoint, hookId: hook.hookId, inactiveTime });
        }
      }
      
      // Clean up stale hooks
      staleHooks.forEach(({ hookId, inactiveTime }) => {
        console.warn(`[SSEHookRegistry] Cleaning up stale hook: ${hookId} (inactive for ${inactiveTime}ms)`);
        this.unregisterHook(hookId);
      });
      
    }, cleanupInterval);
  }
  
  /**
   * Reset registry (for testing/debugging)
   */
  reset() {
    this.activeHooks.clear();
    this.hookLifecycle.clear();
    this.stats = {
      totalRegistrations: 0,
      activeCount: 0,
      rejectedRegistrations: 0,
      averageLifetime: 0,
      lastResetTime: Date.now()
    };
    
    console.log('[SSEHookRegistry] Registry reset');
  }
}

// Global singleton instance
let globalRegistry = null;

/**
 * Get or create global SSE hook registry
 * @returns {SSEHookRegistry} - Global registry instance
 */
export function getSSEHookRegistry() {
  if (!globalRegistry) {
    globalRegistry = new SSEHookRegistry();
  }
  return globalRegistry;
}

/**
 * React hook for SSE hook registration
 * @param {string} endpoint - API endpoint
 * @param {string} componentName - Component name for debugging
 * @param {object} config - Hook configuration
 * @returns {object} - Registration utilities
 */
export function useSSEHookRegistration(endpoint, componentName, config = {}) {
  const registry = getSSEHookRegistry();
  
  return {
    registerHook: () => registry.registerHook(endpoint, componentName, config),
    unregisterHook: (hookId) => registry.unregisterHook(hookId),
    trackActivity: (hookId, activity, data) => registry.trackActivity(hookId, activity, data),
    isActive: (hookId) => registry.isHookActive(hookId),
    getStats: () => registry.getStats()
  };
}

export default {
  getSSEHookRegistry,
  useSSEHookRegistration,
  SSEHookRegistry
};