/**
 * SSE Environment Configuration
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | ENVIRONMENT CONFIGURATION
 * PURPOSE: Production-safe configuration for Docker deployments and development
 * 
 * FEATURES:
 * - Environment-aware polling intervals
 * - Docker container optimization
 * - Production safety controls
 * - Request coordination settings
 */

'use client';

/**
 * Environment detection utilities
 */
export const Environment = {
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test',
  isDocker: () => process.env.DOCKER_ENV === 'true' || process.env.RUNNING_IN_DOCKER === 'true',
  
  // Browser environment detection
  isBrowser: () => typeof window !== 'undefined',
  isServer: () => typeof window === 'undefined'
};

/**
 * Production-safe polling intervals
 * Prevents API runaway in Docker containers and production environments
 */
export const POLLING_INTERVALS = {
  // Development: More frequent for testing (but not aggressive)
  development: {
    sessions: 5000,      // 5 seconds (was 3000)
    conversations: 8000, // 8 seconds
    users: 10000,        // 10 seconds
    events: 3000         // 3 seconds (event polling can be more frequent)
  },
  
  // Production: Conservative intervals for Docker containers
  production: {
    sessions: 10000,     // 10 seconds
    conversations: 15000,// 15 seconds  
    users: 20000,        // 20 seconds
    events: 5000         // 5 seconds
  },
  
  // Docker: Optimized for container environments
  docker: {
    sessions: 8000,      // 8 seconds (Docker-optimized)
    conversations: 12000,// 12 seconds
    users: 15000,        // 15 seconds
    events: 4000         // 4 seconds
  },
  
  // Test: Fast intervals for automated testing
  test: {
    sessions: 1000,      // 1 second
    conversations: 1000, // 1 second
    users: 1000,         // 1 second
    events: 500          // 500ms
  }
};

/**
 * Get appropriate polling interval for current environment
 */
export function getPollingInterval(type = 'sessions') {
  const env = Environment;
  
  if (env.isTest()) {
    return POLLING_INTERVALS.test[type] || POLLING_INTERVALS.test.sessions;
  }
  
  if (env.isDocker()) {
    return POLLING_INTERVALS.docker[type] || POLLING_INTERVALS.docker.sessions;
  }
  
  if (env.isProduction()) {
    return POLLING_INTERVALS.production[type] || POLLING_INTERVALS.production.sessions;
  }
  
  // Default to development
  return POLLING_INTERVALS.development[type] || POLLING_INTERVALS.development.sessions;
}

/**
 * Request coordination configuration
 * Prevents multiple hooks from making simultaneous requests
 */
export const REQUEST_COORDINATION = {
  // Maximum concurrent requests per endpoint
  maxConcurrentRequests: {
    sessions: 1,        // Only 1 sessions request at a time
    conversations: 2,   // Allow 2 conversation requests
    users: 1,          // Only 1 user request at a time
    events: 3          // Allow 3 event requests (more dynamic)
  },
  
  // Request deduplication window (ms)
  deduplicationWindow: {
    sessions: 2000,     // 2 seconds
    conversations: 3000,// 3 seconds
    users: 5000,        // 5 seconds
    events: 1000        // 1 second
  },
  
  // Timeout for requests
  requestTimeout: {
    sessions: 15000,    // 15 seconds
    conversations: 10000,// 10 seconds
    users: 8000,        // 8 seconds
    events: 5000        // 5 seconds
  }
};

/**
 * Production safety controls
 */
export const SAFETY_CONTROLS = {
  // Circuit breaker settings
  circuitBreaker: {
    failureThreshold: 5,        // Max failures before opening circuit
    recoveryTimeout: 30000,     // 30 seconds before retry
    monitoringWindow: 60000     // 1 minute monitoring window
  },
  
  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: 20,   // Max 20 requests per minute per hook
    burstLimit: 5,              // Allow burst of 5 requests
    windowSize: 60000           // 1 minute window
  },
  
  // Resource monitoring
  resourceLimits: {
    maxMemoryUsage: 50,         // Max 50MB memory usage
    maxConcurrentConnections: 3, // Max 3 SSE connections
    maxQueuedRequests: 10       // Max 10 queued requests
  }
};

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const env = Environment;
  
  return {
    environment: {
      type: env.isDevelopment() ? 'development' : 
            env.isProduction() ? 'production' : 
            env.isTest() ? 'test' : 'unknown',
      isDocker: env.isDocker(),
      isBrowser: env.isBrowser(),
      isServer: env.isServer()
    },
    
    polling: {
      sessions: getPollingInterval('sessions'),
      conversations: getPollingInterval('conversations'),
      users: getPollingInterval('users'),
      events: getPollingInterval('events')
    },
    
    coordination: REQUEST_COORDINATION,
    safety: SAFETY_CONTROLS,
    
    // Feature flags
    features: {
      enableSSE: env.isDevelopment() || env.isProduction(),
      enableOptimization: env.isDevelopment() || process.env.NEXT_PUBLIC_SSE_OPTIMIZATION_ENABLED === 'true',
      enableMonitoring: true,
      enableCircuitBreaker: env.isProduction() || env.isDocker(),
      enableRequestDeduplication: true
    }
  };
}

/**
 * Docker-specific optimizations
 */
export const DOCKER_OPTIMIZATIONS = {
  // Memory management
  memory: {
    enableGarbageCollection: true,
    gcInterval: 30000,              // 30 seconds
    maxHeapUsage: 80                // 80% of available memory
  },
  
  // Network optimizations
  network: {
    keepAlive: true,
    keepAliveTimeout: 30000,        // 30 seconds
    maxSockets: 10,                 // Max 10 sockets per host
    timeout: 15000                  // 15 second timeout
  },
  
  // Logging optimizations
  logging: {
    enableVerboseLogging: false,    // Disable verbose in Docker
    logLevel: 'info',               // Info level logging
    enablePerformanceLogging: true  // Keep performance logs
  }
};

/**
 * Apply Docker optimizations if running in container
 */
export function applyDockerOptimizations() {
  if (!Environment.isDocker()) {
    return null;
  }
  
  const opts = DOCKER_OPTIMIZATIONS;
  
  // Apply memory optimizations
  if (opts.memory.enableGarbageCollection && typeof global !== 'undefined' && global.gc) {
    setInterval(() => {
      if (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal > opts.memory.maxHeapUsage / 100) {
        global.gc();
      }
    }, opts.memory.gcInterval);
  }
  
  return opts;
}

const EnvironmentConfig = {
  Environment,
  POLLING_INTERVALS,
  REQUEST_COORDINATION,
  SAFETY_CONTROLS,
  DOCKER_OPTIMIZATIONS,
  getPollingInterval,
  getEnvironmentConfig,
  applyDockerOptimizations
};

export default EnvironmentConfig;