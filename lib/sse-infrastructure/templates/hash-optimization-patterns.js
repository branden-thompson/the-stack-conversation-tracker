/**
 * SSE Hash Optimization Templates and Patterns
 * 
 * CLASSIFICATION: SSE INFRASTRUCTURE | OPTIMIZATION TEMPLATES
 * PURPOSE: Reusable hash optimization patterns for consistent performance across features
 * 
 * FEATURES:
 * - Pre-configured optimization patterns for common use cases
 * - Flexible essential data extractors
 * - Performance-optimized hash calculation strategies
 * - Template patterns for different data types
 * - Best practice configurations
 */

'use client';

/**
 * Common optimization patterns for different use cases
 */
export const OPTIMIZATION_PATTERNS = {
  // For user/session data (Active Stackers, User Lists)
  USER_LIST: {
    name: 'UserList',
    excludeFromHash: [
      'loading',           // Changes on fetch cycles
      'timestamp',         // Changes every update
      'lastUpdate',        // Internal processing time
      'processingTime',    // Performance data
      'rawSessions',       // Internal data with timestamps
      'sessionInfo',       // Session state separate from user data
      'stats',             // Performance statistics
      'connectionMode',    // Internal connection state
      'isConnected'        // Connection state
    ],
    extractEssentialData: (data) => {
      if (!data || !data.processedUsers) return { isEmpty: true };
      
      const users = data.processedUsers;
      return {
        // Core user data affecting UI
        userCount: users.length,
        userIds: users.map(u => u.id).sort(), // Sort for consistent ordering
        displayNames: users.map(u => u.displayName).sort(),
        
        // Display calculations
        displayLimit: data.displayLimit || 3,
        hasOverflow: users.length > (data.displayLimit || 3),
        
        // Error states affecting UI
        hasError: !!data.error,
        errorMessage: data.error?.message || null
      };
    }
  },

  // For conversation/card data
  CONVERSATION_LIST: {
    name: 'ConversationList',
    excludeFromHash: [
      'loading',
      'timestamp',
      'lastUpdate',
      'processingTime',
      'lastFetchTime',
      'stats',
      'connectionInfo'
    ],
    extractEssentialData: (data) => {
      if (!data || !data.conversations) return { isEmpty: true };
      
      const conversations = data.conversations;
      return {
        // Core conversation data
        conversationCount: conversations.length,
        conversationIds: conversations.map(c => c.id).sort(),
        statuses: conversations.map(c => c.status).sort(),
        
        // Active conversation
        activeConversationId: data.activeConversationId || null,
        
        // Display states
        hasActiveConversation: !!data.activeConversationId,
        activeConversationStatus: data.activeConversation?.status || null,
        
        // Error states
        hasError: !!data.error,
        errorMessage: data.error?.message || null
      };
    }
  },

  // For simple data lists (tags, categories, etc.)
  SIMPLE_LIST: {
    name: 'SimpleList',
    excludeFromHash: [
      'loading',
      'timestamp',
      'lastUpdate',
      'processingTime',
      'fetchTime',
      'stats'
    ],
    extractEssentialData: (data) => {
      if (!data || !data.items) return { isEmpty: true };
      
      const items = data.items;
      return {
        itemCount: items.length,
        itemIds: items.map(item => item.id || item).sort(),
        
        // Error states
        hasError: !!data.error,
        errorMessage: data.error?.message || null
      };
    }
  },

  // For real-time status data
  STATUS_DATA: {
    name: 'StatusData',
    excludeFromHash: [
      'loading',
      'timestamp',
      'lastUpdate',
      'processingTime',
      'lastPingTime',
      'responseTime',
      'connectionStats'
    ],
    extractEssentialData: (data) => {
      if (!data) return { isEmpty: true };
      
      return {
        // Status values that affect UI
        status: data.status || 'unknown',
        isHealthy: data.isHealthy || false,
        
        // Counts and metrics that affect display
        activeCount: data.activeCount || 0,
        totalCount: data.totalCount || 0,
        
        // Alert states
        hasWarnings: data.warnings?.length > 0,
        hasErrors: data.errors?.length > 0,
        alertLevel: data.alertLevel || 'none',
        
        // Error states
        hasError: !!data.error,
        errorMessage: data.error?.message || null
      };
    }
  },

  // For configuration/settings data
  CONFIG_DATA: {
    name: 'ConfigData',
    excludeFromHash: [
      'loading',
      'timestamp',
      'lastUpdate',
      'processingTime',
      'lastSaveTime',
      'saveStatus'
    ],
    extractEssentialData: (data) => {
      if (!data || !data.config) return { isEmpty: true };
      
      return {
        // Configuration values that affect UI
        configHash: JSON.stringify(data.config),
        
        // Validation states
        isValid: data.isValid !== false,
        validationErrors: data.validationErrors?.length || 0,
        
        // Dirty state
        hasChanges: data.hasChanges || false,
        
        // Error states
        hasError: !!data.error,
        errorMessage: data.error?.message || null
      };
    }
  }
};

/**
 * Create optimized configuration for specific pattern
 */
export function createOptimizationConfig(patternName, customizations = {}) {
  const pattern = OPTIMIZATION_PATTERNS[patternName];
  if (!pattern) {
    throw new Error(`Unknown optimization pattern: ${patternName}`);
  }
  
  return {
    // Base pattern configuration
    excludeFromHash: [
      ...pattern.excludeFromHash,
      ...(customizations.excludeFromHash || [])
    ],
    extractEssentialData: customizations.extractEssentialData || pattern.extractEssentialData,
    
    // Additional optimization settings
    debug: {
      enabled: process.env.NODE_ENV === 'development',
      level: 'info',
      showHashChanges: process.env.NEXT_PUBLIC_SSE_HASH_LOGGING === 'true',
      componentName: `${pattern.name}${customizations.suffix || ''}`,
      ...customizations.debug
    },
    
    // Performance monitoring
    enablePerformanceMonitoring: customizations.enablePerformanceMonitoring !== false,
    
    // Pattern metadata
    _pattern: {
      name: patternName,
      optimized: true,
      version: '1.0.0'
    }
  };
}

/**
 * Enhanced essential data extractors with better performance
 */
export const ENHANCED_EXTRACTORS = {
  /**
   * User data extractor with advanced sorting and grouping
   */
  userDataAdvanced: (data) => {
    if (!data || !data.processedUsers) return { isEmpty: true };
    
    const users = data.processedUsers;
    
    // Group users by type for more stable hashing
    const usersByType = users.reduce((acc, user) => {
      const type = user.isGuest ? 'guest' : 'registered';
      if (!acc[type]) acc[type] = [];
      acc[type].push({
        id: user.id,
        name: user.displayName,
        status: user.status || 'active'
      });
      return acc;
    }, {});
    
    // Sort within each group
    Object.keys(usersByType).forEach(type => {
      usersByType[type].sort((a, b) => a.id.localeCompare(b.id));
    });
    
    return {
      userGroups: usersByType,
      totalUsers: users.length,
      userTypes: Object.keys(usersByType).sort(),
      displayLimit: data.displayLimit || 3,
      hasOverflow: users.length > (data.displayLimit || 3),
      hasError: !!data.error,
      errorMessage: data.error?.message || null
    };
  },

  /**
   * Conversation data extractor with status grouping
   */
  conversationDataAdvanced: (data) => {
    if (!data || !data.conversations) return { isEmpty: true };
    
    const conversations = data.conversations;
    
    // Group by status for stable representation
    const statusGroups = conversations.reduce((acc, conv) => {
      const status = conv.status || 'unknown';
      if (!acc[status]) acc[status] = [];
      acc[status].push({
        id: conv.id,
        title: conv.title || 'Untitled',
        lastActivity: conv.lastActivity
      });
      return acc;
    }, {});
    
    // Sort within each status group
    Object.keys(statusGroups).forEach(status => {
      statusGroups[status].sort((a, b) => a.id.localeCompare(b.id));
    });
    
    return {
      statusGroups,
      totalConversations: conversations.length,
      statusTypes: Object.keys(statusGroups).sort(),
      activeConversationId: data.activeConversationId || null,
      hasActiveConversation: !!data.activeConversationId,
      hasError: !!data.error,
      errorMessage: data.error?.message || null
    };
  },

  /**
   * Minimal extractor for simple data with fast hashing
   */
  minimalData: (data) => {
    if (!data) return { isEmpty: true };
    
    // Extract only the absolute essentials
    return {
      contentHash: typeof data === 'object' ? 
        JSON.stringify(Object.keys(data).sort()) : 
        String(data).substring(0, 100),
      hasContent: !!data,
      hasError: !!data.error
    };
  }
};

/**
 * Performance-optimized hash calculation strategies
 */
export const HASH_STRATEGIES = {
  /**
   * Fast hash for simple data structures
   */
  fast: (data) => {
    if (!data) return '';
    
    // Use shorter representation for speed
    const essential = {
      type: typeof data,
      count: Array.isArray(data) ? data.length : Object.keys(data).length,
      hash: JSON.stringify(data).substring(0, 200)
    };
    
    return JSON.stringify(essential);
  },

  /**
   * Stable hash for complex nested data
   */
  stable: (data) => {
    if (!data) return '';
    
    // Recursive stable sorting for consistent hashes
    const stabilize = (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(stabilize).sort((a, b) => {
          const aStr = JSON.stringify(a);
          const bStr = JSON.stringify(b);
          return aStr.localeCompare(bStr);
        });
      }
      
      const stabilized = {};
      Object.keys(obj).sort().forEach(key => {
        stabilized[key] = stabilize(obj[key]);
      });
      return stabilized;
    };
    
    return JSON.stringify(stabilize(data));
  },

  /**
   * Memory-efficient hash for large datasets
   */
  efficient: (data) => {
    if (!data) return '';
    
    // Use checksums instead of full content for large objects
    const createChecksum = (obj) => {
      const str = JSON.stringify(obj);
      if (str.length < 1000) return str;
      
      // Simple checksum for large objects
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return `checksum_${hash}_length_${str.length}`;
    };
    
    return createChecksum(data);
  }
};

/**
 * Create custom optimization configuration with multiple patterns
 */
export function createHybridOptimization(patterns, customConfig = {}) {
  const combinedExclusions = new Set();
  const extractors = [];
  
  // Combine exclusions from all patterns
  patterns.forEach(patternName => {
    const pattern = OPTIMIZATION_PATTERNS[patternName];
    if (pattern) {
      pattern.excludeFromHash.forEach(field => combinedExclusions.add(field));
      extractors.push(pattern.extractEssentialData);
    }
  });
  
  return {
    excludeFromHash: [...combinedExclusions, ...(customConfig.excludeFromHash || [])],
    
    extractEssentialData: (data) => {
      // Run all extractors and combine results
      const results = {};
      extractors.forEach((extractor, index) => {
        try {
          const result = extractor(data);
          Object.assign(results, { [`pattern_${index}`]: result });
        } catch (err) {
          results[`pattern_${index}_error`] = err.message;
        }
      });
      
      return results;
    },
    
    debug: {
      enabled: process.env.NODE_ENV === 'development',
      level: 'info',
      showHashChanges: process.env.NEXT_PUBLIC_SSE_HASH_LOGGING === 'true',
      componentName: `Hybrid_${patterns.join('_')}`,
      ...customConfig.debug
    },
    
    _pattern: {
      name: 'HYBRID',
      patterns: patterns,
      optimized: true,
      version: '1.0.0'
    }
  };
}

/**
 * Validation utilities for optimization configurations
 */
export const OptimizationValidation = {
  /**
   * Validate optimization configuration
   */
  validateConfig: (config) => {
    const errors = [];
    const warnings = [];
    
    // Check required fields
    if (!config.extractEssentialData || typeof config.extractEssentialData !== 'function') {
      errors.push('extractEssentialData must be a function');
    }
    
    if (!Array.isArray(config.excludeFromHash)) {
      errors.push('excludeFromHash must be an array');
    }
    
    // Check for common mistakes
    if (config.excludeFromHash?.includes('id')) {
      warnings.push('Excluding "id" field may cause issues with item identification');
    }
    
    if (config.excludeFromHash?.includes('error')) {
      warnings.push('Excluding "error" field may prevent error state updates');
    }
    
    // Test the extractor with sample data
    try {
      const testData = { items: [{ id: 1, name: 'test' }] };
      const result = config.extractEssentialData(testData);
      
      if (!result || typeof result !== 'object') {
        warnings.push('extractEssentialData should return an object');
      }
    } catch (err) {
      errors.push(`extractEssentialData throws error: ${err.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Test optimization effectiveness
   */
  testEffectiveness: (config, testDataSets) => {
    const results = {
      totalTests: testDataSets.length,
      hashCollisions: 0,
      processingTimes: [],
      recommendations: []
    };
    
    const hashes = new Set();
    
    testDataSets.forEach((testData, index) => {
      const start = performance.now();
      
      try {
        const essentialData = config.extractEssentialData(testData);
        const hash = JSON.stringify(essentialData);
        
        if (hashes.has(hash)) {
          results.hashCollisions++;
        } else {
          hashes.add(hash);
        }
        
        results.processingTimes.push(performance.now() - start);
      } catch (err) {
        results.recommendations.push(`Test ${index} failed: ${err.message}`);
      }
    });
    
    const avgTime = results.processingTimes.reduce((a, b) => a + b, 0) / results.processingTimes.length;
    
    if (avgTime > 10) {
      results.recommendations.push('Consider optimizing extractEssentialData - average processing time is high');
    }
    
    if (results.hashCollisions / results.totalTests > 0.1) {
      results.recommendations.push('High hash collision rate - consider including more distinctive data in essential extraction');
    }
    
    results.averageProcessingTime = avgTime;
    results.collisionRate = (results.hashCollisions / results.totalTests * 100).toFixed(1);
    
    return results;
  }
};

export default {
  OPTIMIZATION_PATTERNS,
  ENHANCED_EXTRACTORS,
  HASH_STRATEGIES,
  createOptimizationConfig,
  createHybridOptimization,
  OptimizationValidation
};