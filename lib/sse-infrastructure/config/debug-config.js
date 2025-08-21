/**
 * SSE Debug Configuration System
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | DEBUG UTILITIES
 * PURPOSE: Centralized debug configuration for all SSE components
 * 
 * FEATURES:
 * - Environment-based configuration
 * - Runtime debug toggles
 * - Granular logging control
 * - Performance monitoring toggles
 * - Hot-reloadable settings
 */

/**
 * Debug levels with descriptions
 */
export const DEBUG_LEVELS = {
  OFF: 'off',          // No debug output
  ERROR: 'error',      // Only errors
  WARN: 'warn',        // Errors and warnings
  INFO: 'info',        // Errors, warnings, and info
  VERBOSE: 'verbose'   // All debug output including detailed tracing
};

/**
 * Debug categories for granular control
 */
export const DEBUG_CATEGORIES = {
  CONNECTION: 'connection',
  PROCESSING: 'processing', 
  OPTIMIZATION: 'optimization',
  INTEGRATION: 'integration',
  PERFORMANCE: 'performance',
  HASH_CHANGES: 'hash_changes',
  RENDER_TRACKING: 'render_tracking'
};

/**
 * Default debug configuration
 */
const DEFAULT_DEBUG_CONFIG = {
  // Global debug enable/disable
  enabled: false,
  
  // Debug level
  level: DEBUG_LEVELS.INFO,
  
  // Category-specific toggles
  categories: {
    [DEBUG_CATEGORIES.CONNECTION]: true,
    [DEBUG_CATEGORIES.PROCESSING]: true,
    [DEBUG_CATEGORIES.OPTIMIZATION]: true,
    [DEBUG_CATEGORIES.INTEGRATION]: true,
    [DEBUG_CATEGORIES.PERFORMANCE]: true,
    [DEBUG_CATEGORIES.HASH_CHANGES]: false,
    [DEBUG_CATEGORIES.RENDER_TRACKING]: false
  },
  
  // Performance monitoring
  performanceMonitoring: false,
  
  // Hash change detailed logging
  showHashChanges: false,
  
  // Render frequency tracking
  trackRenderFrequency: false,
  
  // Console grouping for better organization
  useConsoleGrouping: true,
  
  // Timestamp in debug messages
  includeTimestamp: true,
  
  // Component name in debug messages
  includeComponent: true
};

/**
 * Get debug configuration from environment variables and runtime settings
 */
export function getDebugConfig() {
  // Start with defaults
  let config = { ...DEFAULT_DEBUG_CONFIG };
  
  // Environment-based overrides
  if (typeof window !== 'undefined') {
    // Client-side environment variables
    config.enabled = process.env.NEXT_PUBLIC_SSE_DEBUG_MODE === 'true' ||
                     process.env.NODE_ENV === 'development';
    
    config.level = process.env.NEXT_PUBLIC_SSE_DEBUG_LEVEL || DEBUG_LEVELS.INFO;
    
    config.performanceMonitoring = 
      process.env.NEXT_PUBLIC_SSE_PERFORMANCE_MONITORING === 'true';
    
    config.showHashChanges = 
      process.env.NEXT_PUBLIC_SSE_HASH_LOGGING === 'true';
    
    config.trackRenderFrequency = 
      process.env.NEXT_PUBLIC_SSE_RENDER_TRACKING === 'true';

    // Runtime overrides from window object (for hot-reloading)
    if (window.__SSE_DEBUG_CONFIG) {
      config = { ...config, ...window.__SSE_DEBUG_CONFIG };
    }
  } else {
    // Server-side - minimal debug
    config.enabled = process.env.NODE_ENV === 'development';
    config.level = DEBUG_LEVELS.ERROR;
  }
  
  return config;
}

/**
 * Set runtime debug configuration (development only)
 */
export function setRuntimeDebugConfig(overrides) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('[SSE Debug] Runtime config changes only allowed in development');
    return;
  }
  
  if (typeof window !== 'undefined') {
    window.__SSE_DEBUG_CONFIG = {
      ...(window.__SSE_DEBUG_CONFIG || {}),
      ...overrides
    };
    
    console.log('[SSE Debug] Runtime configuration updated:', overrides);
  }
}

/**
 * Debug logger factory with configuration-aware logging
 */
export function createDebugLogger(componentName, category = null) {
  const config = getDebugConfig();
  
  return function debugLog(level, message, data = {}) {
    // Check if debugging is enabled
    if (!config.enabled || config.level === DEBUG_LEVELS.OFF) {
      return;
    }
    
    // Check level hierarchy
    const levelHierarchy = [
      DEBUG_LEVELS.OFF,
      DEBUG_LEVELS.ERROR, 
      DEBUG_LEVELS.WARN,
      DEBUG_LEVELS.INFO,
      DEBUG_LEVELS.VERBOSE
    ];
    
    const currentLevelIndex = levelHierarchy.indexOf(config.level);
    const messageLevelIndex = levelHierarchy.indexOf(level);
    
    if (messageLevelIndex === -1 || messageLevelIndex > currentLevelIndex) {
      return;
    }
    
    // Check category filter
    if (category && config.categories[category] === false) {
      return;
    }
    
    // Build log message
    let prefix = '[SSE';
    
    if (config.includeComponent && componentName) {
      prefix += `:${componentName}`;
    }
    
    if (category) {
      prefix += `:${category}`;
    }
    
    prefix += ']';
    
    if (config.includeTimestamp) {
      const timestamp = new Date().toISOString().substr(11, 12);
      prefix += ` ${timestamp}`;
    }
    
    const fullMessage = `${prefix} ${message}`;
    
    // Console grouping for complex data
    if (config.useConsoleGrouping && Object.keys(data).length > 3) {
      console.group(fullMessage);
      console.log(data);
      console.groupEnd();
    } else {
      // Log based on level
      switch (level) {
        case DEBUG_LEVELS.ERROR:
          console.error(fullMessage, data);
          break;
        case DEBUG_LEVELS.WARN:
          console.warn(fullMessage, data);
          break;
        case DEBUG_LEVELS.INFO:
        case DEBUG_LEVELS.VERBOSE:
        default:
          console.log(fullMessage, data);
          break;
      }
    }
  };
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Time a function execution
   */
  time: (label, fn) => {
    const config = getDebugConfig();
    if (!config.performanceMonitoring) {
      return fn();
    }
    
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    console.log(`[SSE Performance] ${label}: ${duration.toFixed(2)}ms`);
    return result;
  },
  
  /**
   * Mark performance milestones
   */
  mark: (label) => {
    const config = getDebugConfig();
    if (!config.performanceMonitoring) return;
    
    performance.mark(`sse-${label}`);
    console.log(`[SSE Performance] Mark: ${label}`);
  },
  
  /**
   * Measure between two marks
   */
  measure: (name, startMark, endMark) => {
    const config = getDebugConfig();
    if (!config.performanceMonitoring) return;
    
    try {
      performance.measure(`sse-${name}`, `sse-${startMark}`, `sse-${endMark}`);
      const measure = performance.getEntriesByName(`sse-${name}`)[0];
      console.log(`[SSE Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    } catch (err) {
      console.warn(`[SSE Performance] Measure failed: ${err.message}`);
    }
  }
};

/**
 * Development utilities for debug configuration
 */
export const DebugUtils = {
  /**
   * Get current debug configuration
   */
  getConfig: getDebugConfig,
  
  /**
   * Set runtime configuration (development only)
   */
  setConfig: setRuntimeDebugConfig,
  
  /**
   * Enable verbose logging for a specific component
   */
  enableVerbose: (componentName) => {
    setRuntimeDebugConfig({
      level: DEBUG_LEVELS.VERBOSE,
      categories: {
        ...getDebugConfig().categories,
        [componentName]: true
      }
    });
  },
  
  /**
   * Enable hash change debugging
   */
  enableHashDebug: () => {
    setRuntimeDebugConfig({
      showHashChanges: true,
      categories: {
        ...getDebugConfig().categories,
        [DEBUG_CATEGORIES.HASH_CHANGES]: true
      }
    });
  },
  
  /**
   * Enable performance monitoring
   */
  enablePerformanceMonitoring: () => {
    setRuntimeDebugConfig({
      performanceMonitoring: true,
      categories: {
        ...getDebugConfig().categories,
        [DEBUG_CATEGORIES.PERFORMANCE]: true
      }
    });
  },
  
  /**
   * Reset to minimal logging
   */
  minimal: () => {
    setRuntimeDebugConfig({
      level: DEBUG_LEVELS.ERROR,
      showHashChanges: false,
      performanceMonitoring: false,
      trackRenderFrequency: false
    });
  },
  
  /**
   * Reset to default configuration
   */
  reset: () => {
    if (typeof window !== 'undefined') {
      delete window.__SSE_DEBUG_CONFIG;
      console.log('[SSE Debug] Configuration reset to defaults');
    }
  }
};

// Export for global access in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__SSE_DEBUG_UTILS = DebugUtils;
}