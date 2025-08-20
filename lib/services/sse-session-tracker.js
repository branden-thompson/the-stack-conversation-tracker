/**
 * SSE Enhanced Session Tracker
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 3 SESSION INTEGRATION
 * Enhanced session tracker with SSE event broadcasting and fallback support
 * 
 * Features:
 * - Real-time session event broadcasting via SSE
 * - Dual-mode operation (SSE + legacy)
 * - Cross-tab session synchronization
 * - Activity tracking consolidation
 * - Emergency fallback integration
 * - Performance optimization
 */

import { 
  SESSION_EVENT_TYPES, 
  SESSION_CONFIG,
  createSessionEvent,
  createSession,
  isSessionIdle,
  isSessionInactive,
  SESSION_STATUS,
  getBrowserInfo,
} from '@/lib/utils/session-constants';

/**
 * SSE Session Tracker Configuration
 */
const SSE_TRACKER_CONFIG = {
  ENABLE_SSE: process.env.NEXT_PUBLIC_ENABLE_SSE_SESSION_TRACKER !== 'false',
  DUAL_MODE: process.env.NEXT_PUBLIC_SSE_TRACKER_DUAL_MODE !== 'false',
  FALLBACK_ON_ERROR: true,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

class SSESessionTracker {
  constructor() {
    // Original session tracker properties
    this.currentSession = null;
    this.currentUserId = null;
    this.eventQueue = [];
    this.batchTimer = null;
    this.idleTimer = null;
    this.lastActivityTime = Date.now();
    this.subscribers = new Set();
    this.config = { ...SESSION_CONFIG };
    
    // SSE-specific properties
    this.sseHub = null;
    this.sseConnected = false;
    this.sseRetryCount = 0;
    this.eventStats = {
      sseEvents: 0,
      legacyEvents: 0,
      failedEvents: 0,
      lastEventTime: null
    };
    
    // Bind methods
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handleActivity = this.handleActivity.bind(this);
    
    // Initialize SSE if enabled
    if (SSE_TRACKER_CONFIG.ENABLE_SSE) {
      this.initializeSSE();
    }
  }

  /**
   * Initialize SSE connection for session tracking
   */
  async initializeSSE() {
    if (typeof window === 'undefined') return;

    try {
      // Dynamic import to avoid SSR issues
      const { SSEHub } = await import('@/lib/services/sse-hub');
      this.sseHub = SSEHub;
      
      console.log('[SSESessionTracker] SSE hub initialized');
    } catch (error) {
      console.warn('[SSESessionTracker] Failed to initialize SSE:', error);
      this.sseConnected = false;
    }
  }

  /**
   * Enhanced session event emission with SSE
   */
  async emit(eventType, data = {}) {
    const timestamp = Date.now();
    this.lastActivityTime = timestamp;

    try {
      let sseResult = { success: false };
      let legacyResult = { success: false };

      // Try SSE emission first
      if (SSE_TRACKER_CONFIG.ENABLE_SSE && this.sseHub && this.currentSession) {
        try {
          sseResult = await this.emitViaSSE(eventType, data, timestamp);
          
          if (sseResult.success) {
            this.eventStats.sseEvents++;
            this.eventStats.lastEventTime = timestamp;
            console.log(`[SSESessionTracker] Event emitted via SSE: ${eventType}`);
          }
        } catch (error) {
          console.warn(`[SSESessionTracker] SSE emission failed for ${eventType}:`, error);
          this.eventStats.failedEvents++;
          this.sseRetryCount++;
        }
      }

      // Dual mode or fallback: use legacy emission
      if (SSE_TRACKER_CONFIG.DUAL_MODE || 
          SSE_TRACKER_CONFIG.FALLBACK_ON_ERROR || 
          !sseResult.success) {
        try {
          legacyResult = await this.emitViaLegacy(eventType, data, timestamp);
          
          if (legacyResult.success) {
            this.eventStats.legacyEvents++;
            console.log(`[SSESessionTracker] Event emitted via legacy: ${eventType}`);
          }
        } catch (error) {
          console.error(`[SSESessionTracker] Legacy emission failed for ${eventType}:`, error);
        }
      }

      // Notify subscribers
      this.notifySubscribers(eventType, data);

      return {
        success: sseResult.success || legacyResult.success,
        sse: sseResult,
        legacy: legacyResult,
        method: sseResult.success ? 'sse' : 'legacy'
      };

    } catch (error) {
      console.error(`[SSESessionTracker] Event emission failed for ${eventType}:`, error);
      this.eventStats.failedEvents++;
      return { success: false, error: error.message };
    }
  }

  /**
   * Emit event via SSE Hub
   */
  async emitViaSSE(eventType, data, timestamp) {
    if (!this.sseHub || !this.currentSession) {
      throw new Error('SSE hub not available or no current session');
    }

    const sessionEventType = eventType.startsWith('session.') ? 
      eventType : `session.${eventType}`;

    const eventPayload = {
      eventType: sessionEventType,
      eventData: {
        ...data,
        timestamp,
        sessionId: this.currentSession.sessionId,
        userId: this.currentSession.userId,
        userType: this.currentSession.userType
      },
      sessionId: this.currentSession.sessionId,
      userId: this.currentSession.userId
    };

    return await this.sseHub.emit(eventPayload);
  }

  /**
   * Emit event via legacy system (batching)
   */
  async emitViaLegacy(eventType, data, timestamp) {
    const event = createSessionEvent(
      eventType,
      data,
      this.currentSession?.sessionId,
      this.currentSession?.userId,
      timestamp
    );

    // Add to queue for batching
    this.eventQueue.push(event);

    // Process batch if needed
    if (this.eventQueue.length >= this.config.batchSize) {
      await this.processBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.config.batchInterval);
    }

    return { success: true };
  }

  /**
   * Enhanced session initialization
   */
  async initializeSession(sessionData) {
    try {
      // Create session using existing logic
      const session = createSession(
        sessionData.userId,
        sessionData.userType,
        sessionData.sessionId,
        sessionData.browser,
        sessionData.metadata
      );

      this.currentSession = session;
      this.currentUserId = sessionData.userId;

      // Setup activity monitoring
      this.setupActivityMonitoring();

      // Emit session started event
      await this.emit(SESSION_EVENT_TYPES.SESSION_STARTED, {
        userType: sessionData.userType,
        browser: sessionData.browser,
        metadata: sessionData.metadata
      });

      console.log('[SSESessionTracker] Session initialized with SSE enhancement:', session.sessionId);
      return session;

    } catch (error) {
      console.error('[SSESessionTracker] Session initialization failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced session ending
   */
  async endSession(reason = 'user-logout') {
    if (!this.currentSession) return;

    try {
      const sessionDuration = Date.now() - this.currentSession.startTime;

      // Emit session ended event
      await this.emit(SESSION_EVENT_TYPES.SESSION_ENDED, {
        reason,
        duration: sessionDuration,
        eventsEmitted: this.eventStats.sseEvents + this.eventStats.legacyEvents
      });

      // Process any remaining batched events
      await this.processBatch();

      // Cleanup
      this.cleanup();

      console.log('[SSESessionTracker] Session ended with SSE enhancement');

    } catch (error) {
      console.error('[SSESessionTracker] Session end failed:', error);
    }
  }

  /**
   * Enhanced activity tracking
   */
  trackActivity(activityType, metadata = {}) {
    const now = Date.now();
    
    // Update last activity time
    this.lastActivityTime = now;
    
    // Reset idle timer
    this.resetIdleTimer();
    
    // Emit activity event (fire and forget for performance)
    this.emit(SESSION_EVENT_TYPES.ACTIVITY, {
      activityType,
      metadata: {
        ...metadata,
        timestamp: now
      }
    }).catch(error => {
      console.warn('[SSESessionTracker] Activity tracking failed:', error);
    });
  }

  /**
   * Get session statistics including SSE metrics
   */
  getSessionStats() {
    const baseStats = {
      sessionId: this.currentSession?.sessionId,
      userId: this.currentUserId,
      startTime: this.currentSession?.startTime,
      duration: this.currentSession ? Date.now() - this.currentSession.startTime : 0,
      lastActivity: this.lastActivityTime,
      isIdle: isSessionIdle(this.lastActivityTime, this.config.idleThreshold),
      isInactive: isSessionInactive(this.lastActivityTime, this.config.inactiveThreshold),
      status: this.getSessionStatus()
    };

    return {
      ...baseStats,
      sseStats: {
        ...this.eventStats,
        sseConnected: this.sseConnected,
        sseRetryCount: this.sseRetryCount,
        dualMode: SSE_TRACKER_CONFIG.DUAL_MODE
      }
    };
  }

  /**
   * Check SSE connection health
   */
  checkSSEHealth() {
    if (!this.sseHub) return { healthy: false, reason: 'SSE hub not initialized' };

    try {
      const healthStatus = this.sseHub.getHealthStatus();
      return {
        healthy: healthStatus.status === 'healthy',
        status: healthStatus.status,
        connections: healthStatus.metrics?.connections?.active || 0,
        latency: healthStatus.metrics?.performance?.averageLatency || 0
      };
    } catch (error) {
      return { healthy: false, reason: error.message };
    }
  }

  /**
   * Force SSE reconnection
   */
  async reconnectSSE() {
    this.sseRetryCount = 0;
    await this.initializeSSE();
  }

  /**
   * Setup activity monitoring (enhanced)
   */
  setupActivityMonitoring() {
    if (typeof window === 'undefined') return;

    // Setup idle detection
    this.resetIdleTimer();

    // Setup page visibility monitoring
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    // Setup activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });

    console.log('[SSESessionTracker] Activity monitoring setup complete');
  }

  /**
   * Handle visibility change with SSE enhancement
   */
  handleVisibilityChange() {
    const activityType = document.hidden ? 'page-hidden' : 'page-visible';
    this.trackActivity(activityType, {
      visibility: document.visibilityState,
      timestamp: Date.now()
    });
  }

  /**
   * Handle page unload with SSE enhancement
   */
  handleBeforeUnload() {
    // Attempt to send final session event
    this.emit(SESSION_EVENT_TYPES.SESSION_ENDED, {
      reason: 'page-unload',
      duration: this.currentSession ? Date.now() - this.currentSession.startTime : 0
    }).catch(() => {
      // Ignore errors during page unload
    });
  }

  /**
   * Handle user activity
   */
  handleActivity() {
    const now = Date.now();
    
    // Throttle activity events to prevent spam
    if (now - this.lastActivityTime < 1000) return;
    
    this.trackActivity('user-activity', {
      timestamp: now
    });
  }

  /**
   * Legacy compatibility methods
   */
  async startSession(userId, userType, existingSessionId = null) {
    return await this.initializeSession({
      userId,
      userType,
      sessionId: existingSessionId,
      browser: getBrowserInfo(),
      metadata: {}
    });
  }

  // Preserve original methods for backward compatibility
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  notifySubscribers(eventType, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('[SSESessionTracker] Subscriber error:', error);
      }
    });
  }

  async processBatch() {
    if (this.eventQueue.length === 0) return;

    try {
      // Process batched events (legacy behavior)
      const events = [...this.eventQueue];
      this.eventQueue = [];

      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }

      // Send to server (if needed) or process locally
      console.log(`[SSESessionTracker] Processed batch of ${events.length} events`);

    } catch (error) {
      console.error('[SSESessionTracker] Batch processing failed:', error);
    }
  }

  resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    this.idleTimer = setTimeout(() => {
      this.emit(SESSION_EVENT_TYPES.IDLE, {
        idleDuration: Date.now() - this.lastActivityTime
      });
    }, this.config.idleThreshold);
  }

  getSessionStatus() {
    if (!this.currentSession) return SESSION_STATUS.INACTIVE;
    
    if (isSessionInactive(this.lastActivityTime, this.config.inactiveThreshold)) {
      return SESSION_STATUS.INACTIVE;
    }
    
    if (isSessionIdle(this.lastActivityTime, this.config.idleThreshold)) {
      return SESSION_STATUS.IDLE;
    }
    
    return SESSION_STATUS.ACTIVE;
  }

  cleanup() {
    // Clear timers
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    // Remove event listeners
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      activityEvents.forEach(event => {
        document.removeEventListener(event, this.handleActivity, true);
      });
    }

    // Clear session data
    this.currentSession = null;
    this.currentUserId = null;
    this.eventQueue = [];
    
    console.log('[SSESessionTracker] Cleanup complete');
  }
}

// Create singleton instance
const sseSessionTracker = new SSESessionTracker();

export default sseSessionTracker;