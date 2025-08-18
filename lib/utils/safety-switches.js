/**
 * Safety Switches and Circuit Breakers
 * 
 * Provides emergency disable capabilities for all major application systems.
 * Follows the circuit breaker pattern to prevent cascading failures.
 * 
 * Usage:
 *   const isEnabled = useSafetySwitch('reactQuery');
 *   if (isEnabled) { ... }
 * 
 * Environment Variables:
 *   NEXT_PUBLIC_USE_REACT_QUERY=false - Disable React Query migration
 *   NEXT_PUBLIC_CARD_EVENTS_ENABLED=false - Disable card event tracking
 *   NEXT_PUBLIC_USER_TRACKING_ENABLED=false - Disable user session tracking
 *   NEXT_PUBLIC_SESSION_EVENTS_ENABLED=false - Disable session event emission
 *   NEXT_PUBLIC_CONVERSATION_POLLING_ENABLED=false - Disable conversation polling
 *   NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED=false - Keep performance monitoring disabled
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// Default safety switch states
const DEFAULT_SWITCHES = {
  // React Query Migration
  reactQuery: true,
  
  // Core Application Systems
  cardEvents: true,
  userTracking: true,
  sessionEvents: true,
  conversationPolling: true,
  
  // Performance Monitoring (keep disabled)
  performanceMonitoring: false,
  
  // Emergency Global Disable
  emergencyDisable: false,
};

// Environment variable mapping
const ENV_MAPPING = {
  reactQuery: 'NEXT_PUBLIC_USE_REACT_QUERY',
  cardEvents: 'NEXT_PUBLIC_CARD_EVENTS_ENABLED', 
  userTracking: 'NEXT_PUBLIC_USER_TRACKING_ENABLED',
  sessionEvents: 'NEXT_PUBLIC_SESSION_EVENTS_ENABLED',
  conversationPolling: 'NEXT_PUBLIC_CONVERSATION_POLLING_ENABLED',
  performanceMonitoring: 'NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED',
  emergencyDisable: 'NEXT_PUBLIC_EMERGENCY_DISABLE',
};

/**
 * Get safety switch state from environment variables and localStorage
 */
export function getSafetySwitch(switchName) {
  // Check for emergency global disable first
  const emergencyDisable = typeof window !== 'undefined' 
    ? localStorage.getItem('emergency-disable') === 'true'
    : process.env.NEXT_PUBLIC_EMERGENCY_DISABLE === 'true';
    
  if (emergencyDisable) {
    return false;
  }
  
  // Check environment variable
  const envVar = ENV_MAPPING[switchName];
  if (envVar && process.env[envVar] === 'false') {
    return false;
  }
  
  // Check localStorage override (for runtime toggling)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`safety-switch-${switchName}`);
    if (stored !== null) {
      return stored === 'true';
    }
  }
  
  // Return default
  return DEFAULT_SWITCHES[switchName] ?? true;
}

/**
 * React hook for using safety switches
 */
export function useSafetySwitch(switchName) {
  const [isEnabled, setIsEnabled] = useState(() => getSafetySwitch(switchName));
  
  useEffect(() => {
    const handleStorageChange = () => {
      setIsEnabled(getSafetySwitch(switchName));
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from dev tools
    window.addEventListener('safety-switch-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('safety-switch-changed', handleStorageChange);
    };
  }, [switchName]);
  
  return isEnabled;
}

/**
 * Get all safety switch states
 */
export function getAllSafetySwitches() {
  const switches = {};
  Object.keys(DEFAULT_SWITCHES).forEach(key => {
    switches[key] = getSafetySwitch(key);
  });
  return switches;
}

/**
 * Set a safety switch at runtime (for dev tools)
 */
export function setSafetySwitch(switchName, enabled) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(`safety-switch-${switchName}`, enabled.toString());
  
  // Dispatch custom event to update other components
  window.dispatchEvent(new CustomEvent('safety-switch-changed', {
    detail: { switchName, enabled }
  }));
  
  console.log(`[Safety Switch] ${switchName}: ${enabled ? 'ENABLED' : 'DISABLED'}`);
}

/**
 * Emergency disable all systems
 */
export function emergencyDisableAll() {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('emergency-disable', 'true');
  window.dispatchEvent(new CustomEvent('safety-switch-changed'));
  
  console.error('[Safety Switch] EMERGENCY DISABLE ACTIVATED - All systems disabled');
}

/**
 * Re-enable all systems after emergency disable
 */
export function emergencyRecover() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('emergency-disable');
  window.dispatchEvent(new CustomEvent('safety-switch-changed'));
  
  console.log('[Safety Switch] Emergency disable cleared - Systems restored to normal state');
}

/**
 * Circuit Breaker Class for advanced error handling
 */
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 300000; // 5 minutes
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    this.stats = {
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      timeouts: 0,
    };
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker OPEN for ${this.name}`);
      } else {
        this.state = 'HALF_OPEN';
      }
    }
    
    try {
      this.stats.totalRequests++;
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.stats.successCount++;
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log(`[Circuit Breaker] ${this.name} recovered to CLOSED state`);
    }
  }
  
  onFailure() {
    this.stats.failureCount++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.recoveryTimeout;
      
      console.error(`[Circuit Breaker] ${this.name} OPENED due to ${this.failureCount} failures`);
      
      // Auto-disable related safety switch if configured
      if (this.autoDisableSwitch) {
        setSafetySwitch(this.autoDisableSwitch, false);
      }
    }
  }
  
  getStats() {
    return {
      ...this.stats,
      state: this.state,
      failureCount: this.failureCount,
      nextAttemptTime: this.nextAttemptTime,
      failureRate: this.stats.totalRequests > 0 
        ? (this.stats.failureCount / this.stats.totalRequests * 100).toFixed(2)
        : 0,
    };
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    console.log(`[Circuit Breaker] ${this.name} manually reset`);
  }
}

/**
 * Create circuit breakers for major application systems
 */
export const circuitBreakers = {
  conversations: new CircuitBreaker('conversations', {
    failureThreshold: 3,
    recoveryTimeout: 30000,
    autoDisableSwitch: 'conversationPolling'
  }),
  
  cards: new CircuitBreaker('cards', {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    autoDisableSwitch: 'cardEvents'
  }),
  
  users: new CircuitBreaker('users', {
    failureThreshold: 3,
    recoveryTimeout: 60000,
    autoDisableSwitch: 'userTracking'
  }),
  
  sessions: new CircuitBreaker('sessions', {
    failureThreshold: 3,
    recoveryTimeout: 60000,
    autoDisableSwitch: 'sessionEvents'
  }),
};

/**
 * Hook for using circuit breakers
 */
export function useCircuitBreaker(breakerName) {
  const breaker = circuitBreakers[breakerName];
  
  // Always call hooks at the top level
  const execute = useCallback((operation) => {
    if (!breaker) {
      console.warn(`[Circuit Breaker] Unknown breaker: ${breakerName}`);
      return operation();
    }
    return breaker.execute(operation);
  }, [breaker, breakerName]);
  
  const getStats = useCallback(() => {
    if (!breaker) {
      return {};
    }
    return breaker.getStats();
  }, [breaker]);
  
  const reset = useCallback(() => {
    if (!breaker) {
      return;
    }
    breaker.reset();
  }, [breaker]);
  
  return {
    execute,
    getStats,
    reset,
  };
}

/**
 * Get all circuit breaker stats for monitoring
 */
export function getAllCircuitBreakerStats() {
  const stats = {};
  Object.entries(circuitBreakers).forEach(([name, breaker]) => {
    stats[name] = breaker.getStats();
  });
  return stats;
}

/**
 * Utility function to wrap API calls with circuit breaker and safety switch
 */
export function withSafetyControls(breakerName, switchName, operation) {
  return async (...args) => {
    // Check safety switch first
    if (!getSafetySwitch(switchName)) {
      console.warn(`[Safety] ${switchName} disabled, skipping operation`);
      return null;
    }
    
    // Execute with circuit breaker
    const breaker = circuitBreakers[breakerName];
    if (breaker) {
      return breaker.execute(() => operation(...args));
    } else {
      return operation(...args);
    }
  };
}

// Export convenience object for easy access
export const SAFETY_SWITCHES = {
  // Get current state
  getAll: getAllSafetySwitches,
  get: getSafetySwitch,
  set: setSafetySwitch,
  
  // Emergency controls
  emergencyDisable: emergencyDisableAll,
  emergencyRecover: emergencyRecover,
  
  // Circuit breakers
  circuitBreakers,
  getCircuitBreakerStats: getAllCircuitBreakerStats,
  
  // Utility
  withSafetyControls,
};