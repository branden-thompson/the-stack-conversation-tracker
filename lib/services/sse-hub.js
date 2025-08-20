/**
 * SSE Hub Core Service
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | CRITICAL INFRASTRUCTURE
 * Central hub for managing SSE connections and event broadcasting
 * 
 * Features:
 * - Connection pool management
 * - Event broadcasting with validation
 * - Health monitoring and circuit breakers
 * - Performance optimization
 * - Emergency controls
 */

import { EventValidator } from './event-registry.js';
import { generateId } from '@/lib/utils/id-utils.js';

/**
 * SSE Connection Management
 * Handles individual client connections with health monitoring
 */
class SSEConnection {
  constructor({ sessionId, userId, clientId, controller, request }) {
    this.id = generateId('conn');
    this.sessionId = sessionId;
    this.userId = userId;
    this.clientId = clientId;
    this.controller = controller;
    this.request = request;
    this.createdAt = Date.now();
    this.lastHeartbeat = Date.now();
    this.eventsSent = 0;
    this.isActive = true;
    this.cleanup = null;
  }

  /**
   * Send event to this connection
   */
  async sendEvent(event) {
    if (!this.isActive) {
      return { success: false, error: 'Connection inactive' };
    }

    try {
      const sseMessage = this.formatSSEMessage(event);
      this.controller.enqueue(sseMessage);
      this.eventsSent++;
      return { success: true };
    } catch (error) {
      console.error(`Failed to send event to connection ${this.id}:`, error);
      this.markInactive();
      return { success: false, error: error.message };
    }
  }

  /**
   * Format event for SSE transmission
   */
  formatSSEMessage(event) {
    const data = JSON.stringify({
      eventType: event.eventType,
      eventData: event.eventData,
      eventId: event.eventId,
      timestamp: event.timestamp,
      sessionId: event.sessionId,
      userId: event.userId
    });
    
    return `data: ${data}\n\n`;
  }

  /**
   * Update heartbeat timestamp
   */
  updateHeartbeat() {
    this.lastHeartbeat = Date.now();
  }

  /**
   * Mark connection as inactive
   */
  markInactive() {
    this.isActive = false;
    if (this.cleanup) {
      this.cleanup();
    }
  }

  /**
   * Get connection health metrics
   */
  getHealthMetrics() {
    const now = Date.now();
    return {
      id: this.id,
      sessionId: this.sessionId,
      userId: this.userId,
      uptime: now - this.createdAt,
      lastHeartbeat: now - this.lastHeartbeat,
      eventsSent: this.eventsSent,
      isActive: this.isActive
    };
  }
}

/**
 * SSE Hub Performance Monitor
 * Tracks performance metrics and triggers optimizations
 */
class SSEPerformanceMonitor {
  constructor() {
    this.latencyWindow = [];
    this.windowSize = 100;
    this.maxLatency = 100; // 100ms requirement
    this.eventCounts = new Map();
    this.lastCleanup = Date.now();
    this.cleanupInterval = 300000; // 5 minutes
  }

  /**
   * Record event latency
   */
  recordLatency(startTime, endTime) {
    const latency = endTime - startTime;
    this.latencyWindow.push(latency);
    
    if (this.latencyWindow.length > this.windowSize) {
      this.latencyWindow.shift();
    }
    
    return this.analyzePerformance();
  }

  /**
   * Record event processing
   */
  recordEvent(eventType) {
    const count = this.eventCounts.get(eventType) || 0;
    this.eventCounts.set(eventType, count + 1);
  }

  /**
   * Analyze current performance
   */
  analyzePerformance() {
    const averageLatency = this.calculateAverageLatency();
    const status = averageLatency > this.maxLatency ? 'degraded' : 'healthy';
    
    return {
      status,
      averageLatency,
      maxLatency: Math.max(...this.latencyWindow),
      minLatency: Math.min(...this.latencyWindow),
      eventCounts: Object.fromEntries(this.eventCounts)
    };
  }

  /**
   * Calculate average latency
   */
  calculateAverageLatency() {
    if (this.latencyWindow.length === 0) return 0;
    
    const sum = this.latencyWindow.reduce((a, b) => a + b, 0);
    return sum / this.latencyWindow.length;
  }

  /**
   * Cleanup old metrics
   */
  cleanup() {
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.eventCounts.clear();
      this.lastCleanup = now;
    }
  }
}

/**
 * SSE Hub Circuit Breaker
 * Monitors system health and triggers fallbacks
 */
class SSECircuitBreaker {
  constructor() {
    this.state = 'closed'; // closed, open, half-open
    this.failureCount = 0;
    this.failureThreshold = 5;
    this.retryTimeout = 30000; // 30 seconds
    this.lastFailure = 0;
    this.successCount = 0;
    this.halfOpenSuccessThreshold = 3;
  }

  /**
   * Record successful operation
   */
  recordSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.state = 'closed';
        this.successCount = 0;
        console.log('Circuit breaker closed - system recovered');
      }
    }
  }

  /**
   * Record failed operation
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailure = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      console.warn('Circuit breaker opened - system degraded');
    }
  }

  /**
   * Check if operation should be allowed
   */
  shouldAllowOperation() {
    if (this.state === 'closed') {
      return true;
    }
    
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailure > this.retryTimeout) {
        this.state = 'half-open';
        this.successCount = 0;
        console.log('Circuit breaker half-open - testing recovery');
        return true;
      }
      return false;
    }
    
    // half-open state
    return true;
  }

  /**
   * Get circuit breaker status
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailure: this.lastFailure,
      isOperational: this.shouldAllowOperation()
    };
  }
}

/**
 * Main SSE Hub Class
 * Central coordination point for all SSE operations
 */
class SSEHubService {
  constructor() {
    this.connections = new Map();
    this.performanceMonitor = new SSEPerformanceMonitor();
    this.circuitBreaker = new SSECircuitBreaker();
    this.isEnabled = true;
    this.eventQueue = [];
    this.maxQueueSize = 1000;
    this.processingQueue = false;
    
    // Start background processes
    this.startHealthMonitoring();
    this.startQueueProcessor();
  }

  /**
   * Create new SSE connection
   */
  createConnection({ sessionId, userId, clientId, controller, request }) {
    const connection = new SSEConnection({
      sessionId,
      userId,
      clientId,
      controller,
      request
    });
    
    this.connections.set(connection.id, connection);
    
    console.log(`SSE connection created: ${connection.id} for user ${userId}`);
    
    // Report connection metrics
    this.performanceMonitor.recordEvent('connection.created');
    
    return connection;
  }

  /**
   * Remove SSE connection
   */
  removeConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.markInactive();
      this.connections.delete(connectionId);
      console.log(`SSE connection removed: ${connectionId}`);
      this.performanceMonitor.recordEvent('connection.removed');
    }
  }

  /**
   * Emit event through SSE hub
   */
  async emit(event) {
    const startTime = Date.now();
    
    try {
      // Check circuit breaker
      if (!this.circuitBreaker.shouldAllowOperation()) {
        return {
          success: false,
          error: 'Circuit breaker open - system degraded',
          fallback: true
        };
      }

      // Validate event
      const validation = EventValidator.validateEvent(event);
      if (!validation.valid) {
        this.circuitBreaker.recordFailure();
        return {
          success: false,
          error: validation.error,
          code: validation.code
        };
      }

      // Enrich event
      const enrichedEvent = {
        ...validation.event,
        eventId: event.eventId || generateId('evt'),
        timestamp: event.timestamp || Date.now()
      };

      // Add to processing queue
      const queueResult = this.enqueueEvent(enrichedEvent);
      if (!queueResult.success) {
        return queueResult;
      }

      // Record performance
      const endTime = Date.now();
      const performance = this.performanceMonitor.recordLatency(startTime, endTime);
      this.performanceMonitor.recordEvent(enrichedEvent.eventType);
      
      this.circuitBreaker.recordSuccess();
      
      return {
        success: true,
        eventId: enrichedEvent.eventId,
        timestamp: enrichedEvent.timestamp,
        performance
      };

    } catch (error) {
      this.circuitBreaker.recordFailure();
      console.error('SSE Hub emission error:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Add event to processing queue
   */
  enqueueEvent(event) {
    if (this.eventQueue.length >= this.maxQueueSize) {
      // Remove oldest non-critical events
      this.eventQueue = this.eventQueue.filter(e => 
        EventValidator.shouldPersist(e.eventType)
      );
      
      if (this.eventQueue.length >= this.maxQueueSize) {
        return {
          success: false,
          error: 'Event queue overflow',
          code: 'QUEUE_OVERFLOW'
        };
      }
    }
    
    this.eventQueue.push(event);
    return { success: true };
  }

  /**
   * Process event queue
   */
  async processEventQueue() {
    if (this.processingQueue || this.eventQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        await this.broadcastEvent(event);
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Broadcast event to appropriate connections
   */
  async broadcastEvent(event) {
    const config = EventValidator.getEventConfig(event.eventType);
    if (!config || !config.broadcast) {
      return;
    }

    const targetConnections = this.getTargetConnections(event, config);
    const results = [];
    
    for (const connection of targetConnections) {
      const result = await connection.sendEvent(event);
      results.push({ connectionId: connection.id, ...result });
      
      if (!result.success) {
        this.removeConnection(connection.id);
      }
    }
    
    return results;
  }

  /**
   * Get target connections for event
   */
  getTargetConnections(event, config) {
    const activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.isActive);
    
    switch (config.authorization) {
      case 'session-owner':
        return activeConnections.filter(conn => 
          conn.sessionId === event.sessionId
        );
      
      case 'user-scoped':
        return activeConnections.filter(conn => 
          conn.userId === event.userId
        );
      
      case 'system':
        return activeConnections; // Broadcast to all
      
      default:
        return activeConnections.filter(conn => 
          conn.sessionId === event.sessionId
        );
    }
  }

  /**
   * Start health monitoring background process
   */
  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // 30 second intervals
  }

  /**
   * Start queue processor background process
   */
  startQueueProcessor() {
    setInterval(() => {
      this.processEventQueue();
    }, 50); // 50ms intervals for responsive processing
  }

  /**
   * Perform health check on all connections
   */
  performHealthCheck() {
    const now = Date.now();
    const maxSilentPeriod = 90000; // 90 seconds
    
    for (const [connectionId, connection] of this.connections) {
      const timeSinceHeartbeat = now - connection.lastHeartbeat;
      
      if (timeSinceHeartbeat > maxSilentPeriod) {
        console.warn(`Connection ${connectionId} exceeded silent period, removing`);
        this.removeConnection(connectionId);
      }
    }
    
    // Cleanup performance metrics
    this.performanceMonitor.cleanup();
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    const activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.isActive);
    
    const performance = this.performanceMonitor.analyzePerformance();
    const circuitBreaker = this.circuitBreaker.getStatus();
    
    const overallStatus = 
      !this.isEnabled ? 'disabled' :
      !circuitBreaker.isOperational ? 'critical' :
      performance.status === 'degraded' ? 'degraded' :
      'healthy';
    
    return {
      status: overallStatus,
      timestamp: Date.now(),
      metrics: {
        connections: {
          active: activeConnections.length,
          total: this.connections.size
        },
        performance: {
          averageLatency: performance.averageLatency,
          maxLatency: performance.maxLatency,
          status: performance.status
        },
        queue: {
          pending: this.eventQueue.length,
          maxSize: this.maxQueueSize,
          processing: this.processingQueue
        },
        circuitBreaker: circuitBreaker
      }
    };
  }

  /**
   * Report error to monitoring system
   */
  reportError(type, error) {
    console.error(`SSE Hub Error [${type}]:`, error);
    
    // Record error for circuit breaker
    this.circuitBreaker.recordFailure();
    
    // Record error metrics
    this.performanceMonitor.recordEvent('error.' + type);
  }

  /**
   * Emergency disable SSE system
   */
  emergencyDisable(reason) {
    console.warn(`SSE Hub emergency disable: ${reason}`);
    this.isEnabled = false;
    
    // Close all connections
    for (const connection of this.connections.values()) {
      connection.markInactive();
    }
    this.connections.clear();
    
    // Clear queue
    this.eventQueue = [];
  }

  /**
   * Re-enable SSE system
   */
  enable() {
    console.log('SSE Hub enabled');
    this.isEnabled = true;
    this.circuitBreaker = new SSECircuitBreaker(); // Reset circuit breaker
  }
}

// Export singleton instance
export const SSEHub = new SSEHubService();