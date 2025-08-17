/**
 * Session Tracker Service
 * Manages user session tracking, event batching, and real-time updates
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

class SessionTracker {
  constructor() {
    // Current session info
    this.currentSession = null;
    this.currentUserId = null;
    
    // Event batching
    this.eventQueue = [];
    this.batchTimer = null;
    
    // Activity tracking
    this.idleTimer = null;
    this.lastActivityTime = Date.now();
    
    // Subscribers for real-time updates
    this.subscribers = new Set();
    
    // Configuration
    this.config = { ...SESSION_CONFIG };
    
    // Bind methods
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handleActivity = this.handleActivity.bind(this);
  }

  /**
   * Initialize session tracking for a user
   */
  async startSession(userId, userType, existingSessionId = null) {
    console.log('[SessionTracker] Starting session for:', userId, userType, 'with ID:', existingSessionId);
    
    // If already have a session for this user, skip
    if (this.currentSession && this.currentUserId === userId) {
      console.log('[SessionTracker] Session already exists for user:', userId);
      return this.currentSession;
    }
    
    // End previous session if exists for different user
    if (this.currentSession) {
      await this.endSession();
    }

    // Create new session or use existing ID
    if (existingSessionId) {
      // Use the session ID from the API
      this.currentSession = {
        id: existingSessionId,
        userId,
        userType,
        startedAt: Date.now(),
        lastActivityAt: Date.now(),
        status: SESSION_STATUS.ACTIVE,
        browser: typeof window !== 'undefined' ? getBrowserInfo() : 'Unknown',
        currentRoute: typeof window !== 'undefined' ? window.location.pathname : '/',
        eventCount: 0,
        recentActions: [],
        metadata: {},
      };
    } else {
      // Create new session with generated ID
      this.currentSession = createSession(userId, userType);
    }
    this.currentUserId = userId;
    
    console.log('[SessionTracker] Session created:', this.currentSession.id);
    
    // Emit session start event
    this.emitEvent(SESSION_EVENT_TYPES.SESSION_START, {
      userId,
      userType,
      browser: this.currentSession.browser,
      route: this.currentSession.currentRoute,
    });

    // Setup event listeners
    this.setupEventListeners();
    
    // Start idle detection
    this.startIdleDetection();
    
    // Notify subscribers
    this.notifySubscribers('session_started', this.currentSession);
    
    return this.currentSession;
  }

  /**
   * End current session
   */
  async endSession() {
    if (!this.currentSession) return;

    // Emit session end event
    this.emitEvent(SESSION_EVENT_TYPES.SESSION_END, {
      userId: this.currentUserId,
      duration: Date.now() - this.currentSession.startedAt,
    });

    // Flush any pending events
    await this.flushEvents();

    // Update session status
    this.currentSession.status = SESSION_STATUS.ENDED;
    
    // Cleanup
    this.cleanup();
    
    // Notify subscribers
    this.notifySubscribers('session_ended', this.currentSession);
    
    const session = this.currentSession;
    this.currentSession = null;
    this.currentUserId = null;
    
    return session;
  }

  /**
   * Emit a tracking event
   */
  emitEvent(type, metadata = {}) {
    if (!this.currentSession) {
      console.warn('[SessionTracker] No current session, cannot emit event:', type);
      return;
    }

    const event = createSessionEvent(type, {
      ...metadata,
      sessionId: this.currentSession.id,
      userId: this.currentUserId,
      route: window.location.pathname,
    });

    // Add to queue
    this.eventQueue.push(event);
    
    // Update session
    this.currentSession.eventCount++;
    this.currentSession.lastActivityAt = Date.now();
    
    // Add to recent actions (keep last 10)
    this.currentSession.recentActions.unshift({
      type,
      timestamp: event.timestamp,
      metadata: event.metadata,
    });
    this.currentSession.recentActions = this.currentSession.recentActions.slice(0, 10);

    // Reset idle detection
    this.resetIdleDetection();
    
    // Schedule batch send
    this.scheduleBatchSend();
    
    // Notify subscribers of event
    this.notifySubscribers('event_emitted', event);
    
    return event;
  }

  /**
   * Schedule batch send of events
   */
  scheduleBatchSend() {
    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Check if should send immediately
    if (this.eventQueue.length >= this.config.BATCH_SIZE) {
      this.flushEvents();
      return;
    }

    // Schedule batch send
    this.batchTimer = setTimeout(() => {
      this.flushEvents();
    }, this.config.BATCH_TIMEOUT_MS);
  }

  /**
   * Flush pending events to server
   */
  async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch('/api/sessions/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.currentSession?.id,
          events,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send session events:', response.statusText);
        // Re-queue events on failure
        this.eventQueue.unshift(...events);
      }
    } catch (error) {
      console.error('Error sending session events:', error);
      // Re-queue events on error
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Update current route
   */
  updateRoute(route) {
    if (!this.currentSession) return;

    const previousRoute = this.currentSession.currentRoute;
    this.currentSession.currentRoute = route;

    // Emit route change event
    if (previousRoute !== route) {
      this.emitEvent(SESSION_EVENT_TYPES.ROUTE_CHANGE, {
        from: previousRoute,
        to: route,
      });
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Page visibility
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Before unload
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Activity detection
    document.addEventListener('click', this.handleActivity);
    document.addEventListener('keypress', this.handleActivity);
    document.addEventListener('scroll', this.handleActivity);
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('click', this.handleActivity);
    document.removeEventListener('keypress', this.handleActivity);
    document.removeEventListener('scroll', this.handleActivity);
    
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
    }
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (!this.currentSession) return;

    if (document.hidden) {
      this.currentSession.status = SESSION_STATUS.INACTIVE;
      this.notifySubscribers('status_changed', SESSION_STATUS.INACTIVE);
    } else {
      this.currentSession.status = SESSION_STATUS.ACTIVE;
      this.emitEvent(SESSION_EVENT_TYPES.USER_ACTIVE);
      this.notifySubscribers('status_changed', SESSION_STATUS.ACTIVE);
    }
  }

  /**
   * Handle before unload
   */
  handleBeforeUnload() {
    // Synchronously flush events
    if (this.eventQueue.length > 0) {
      navigator.sendBeacon('/api/sessions/events', JSON.stringify({
        sessionId: this.currentSession?.id,
        events: this.eventQueue,
      }));
    }
  }

  /**
   * Handle user activity
   */
  handleActivity() {
    this.lastActivityTime = Date.now();
    
    if (this.currentSession && this.currentSession.status === SESSION_STATUS.IDLE) {
      this.currentSession.status = SESSION_STATUS.ACTIVE;
      this.emitEvent(SESSION_EVENT_TYPES.USER_ACTIVE);
      this.notifySubscribers('status_changed', SESSION_STATUS.ACTIVE);
    }
  }

  /**
   * Start idle detection
   */
  startIdleDetection() {
    this.idleTimer = setInterval(() => {
      if (!this.currentSession) return;

      const now = Date.now();
      const timeSinceActivity = now - this.lastActivityTime;

      if (timeSinceActivity > this.config.IDLE_THRESHOLD_MS && 
          this.currentSession.status !== SESSION_STATUS.IDLE) {
        this.currentSession.status = SESSION_STATUS.IDLE;
        this.emitEvent(SESSION_EVENT_TYPES.USER_IDLE);
        this.notifySubscribers('status_changed', SESSION_STATUS.IDLE);
      } else if (timeSinceActivity > this.config.INACTIVE_THRESHOLD_MS && 
                 this.currentSession.status === SESSION_STATUS.ACTIVE) {
        this.currentSession.status = SESSION_STATUS.INACTIVE;
        this.notifySubscribers('status_changed', SESSION_STATUS.INACTIVE);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Reset idle detection
   */
  resetIdleDetection() {
    this.lastActivityTime = Date.now();
    
    if (this.currentSession && 
        (this.currentSession.status === SESSION_STATUS.IDLE || 
         this.currentSession.status === SESSION_STATUS.INACTIVE)) {
      this.currentSession.status = SESSION_STATUS.ACTIVE;
      this.notifySubscribers('status_changed', SESSION_STATUS.ACTIVE);
    }
  }

  /**
   * Subscribe to session updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in session tracker subscriber:', error);
      }
    });
  }

  /**
   * Get current session
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
const sessionTracker = new SessionTracker();

// Export singleton
export default sessionTracker;