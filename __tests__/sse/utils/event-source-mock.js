/**
 * EventSource Mock Implementation
 * 
 * Provides comprehensive EventSource mocking for SSE testing.
 * Simulates real EventSource behavior including connection states,
 * message delivery, error handling, and performance characteristics.
 */

import { vi } from 'vitest';

/**
 * EventSource Ready States
 */
export const READY_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
};

/**
 * Mock EventSource Implementation
 */
export class MockEventSource {
  constructor(url, config = {}) {
    this.url = url;
    this.readyState = READY_STATES.CONNECTING;
    this.withCredentials = config.withCredentials || false;
    
    // Event listeners
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this._listeners = new Map();
    
    // Mock control properties
    this._shouldConnect = true;
    this._connectionDelay = 0;
    this._messageQueue = [];
    this._closed = false;
    
    // Simulate async connection
    setTimeout(() => {
      if (this._shouldConnect && !this._closed) {
        this._connect();
      } else if (!this._shouldConnect && !this._closed) {
        this._failConnection();
      }
    }, this._connectionDelay);
  }
  
  /**
   * Add event listener
   */
  addEventListener(type, listener, options) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }
    this._listeners.get(type).push({ listener, options });
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(type, listener) {
    if (this._listeners.has(type)) {
      const listeners = this._listeners.get(type);
      const index = listeners.findIndex(l => l.listener === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Dispatch event
   */
  dispatchEvent(event) {
    // Call specific handlers
    if (event.type === 'open' && this.onopen) {
      this.onopen(event);
    } else if (event.type === 'message' && this.onmessage) {
      this.onmessage(event);
    } else if (event.type === 'error' && this.onerror) {
      this.onerror(event);
    }
    
    // Call registered listeners
    if (this._listeners.has(event.type)) {
      this._listeners.get(event.type).forEach(({ listener }) => {
        listener(event);
      });
    }
    
    return true;
  }
  
  /**
   * Close connection
   */
  close() {
    if (this.readyState !== READY_STATES.CLOSED) {
      this.readyState = READY_STATES.CLOSED;
      this._closed = true;
      
      // Clear any pending messages
      this._messageQueue = [];
    }
  }
  
  /**
   * Mock Control Methods (for testing)
   */
  
  /**
   * Simulate successful connection
   */
  _connect() {
    this.readyState = READY_STATES.OPEN;
    this.dispatchEvent(new Event('open'));
    
    // Process any queued messages
    this._processMessageQueue();
  }
  
  /**
   * Simulate connection failure
   */
  _failConnection() {
    this.readyState = READY_STATES.CLOSED;
    this.dispatchEvent(new Event('error'));
  }
  
  /**
   * Simulate incoming SSE message
   */
  _sendMessage(data, eventType = 'message', id = null) {
    if (this.readyState === READY_STATES.OPEN) {
      const event = new MessageEvent('message', {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        type: eventType,
        lastEventId: id || '',
        origin: new URL(this.url).origin,
      });
      
      this.dispatchEvent(event);
    } else {
      // Queue message for when connection is established
      this._messageQueue.push({ data, eventType, id });
    }
  }
  
  /**
   * Process queued messages
   */
  _processMessageQueue() {
    while (this._messageQueue.length > 0 && this.readyState === READY_STATES.OPEN) {
      const { data, eventType, id } = this._messageQueue.shift();
      this._sendMessage(data, eventType, id);
    }
  }
  
  /**
   * Simulate network error
   */
  _simulateError() {
    this.readyState = READY_STATES.CLOSED;
    const error = new Event('error');
    this.dispatchEvent(error);
  }
  
  /**
   * Simulate reconnection
   */
  _simulateReconnect(delay = 1000) {
    this.readyState = READY_STATES.CONNECTING;
    
    setTimeout(() => {
      if (!this._closed) {
        this._connect();
      }
    }, delay);
  }
}

/**
 * Create EventSource mock factory
 */
export function createEventSourceMock(config = {}) {
  const mock = vi.fn().mockImplementation((url, options) => {
    const instance = new MockEventSource(url, options);
    
    // Apply mock configuration
    if (config.shouldConnect !== undefined) {
      instance._shouldConnect = config.shouldConnect;
    }
    if (config.connectionDelay !== undefined) {
      instance._connectionDelay = config.connectionDelay;
    }
    
    return instance;
  });
  
  // Add utility methods to the mock
  mock.CONNECTING = READY_STATES.CONNECTING;
  mock.OPEN = READY_STATES.OPEN;
  mock.CLOSED = READY_STATES.CLOSED;
  
  return mock;
}

/**
 * Setup EventSource mock globally
 */
export function setupEventSourceMock(config = {}) {
  const mock = createEventSourceMock(config);
  global.EventSource = mock;
  return mock;
}

/**
 * Restore original EventSource
 */
export function restoreEventSource() {
  if (global.EventSource?.mockRestore) {
    global.EventSource.mockRestore();
  }
  delete global.EventSource;
}

/**
 * SSE Message Builders
 */
export const SSEMessageBuilders = {
  /**
   * Create conversation update message
   */
  conversationUpdate: (conversationData) => ({
    type: 'conversation_update',
    data: conversationData,
    timestamp: Date.now(),
  }),
  
  /**
   * Create card update message
   */
  cardUpdate: (cardData) => ({
    type: 'card_update', 
    data: cardData,
    timestamp: Date.now(),
  }),
  
  /**
   * Create session event message
   */
  sessionEvent: (eventData) => ({
    type: 'session_event',
    data: eventData,
    timestamp: Date.now(),
  }),
  
  /**
   * Create user status message
   */
  userStatus: (userData) => ({
    type: 'user_status',
    data: userData,
    timestamp: Date.now(),
  }),
  
  /**
   * Create system message
   */
  systemMessage: (message, level = 'info') => ({
    type: 'system_message',
    data: { message, level },
    timestamp: Date.now(),
  }),
  
  /**
   * Create heartbeat message
   */
  heartbeat: () => ({
    type: 'heartbeat',
    data: { timestamp: Date.now() },
    timestamp: Date.now(),
  }),
};

export default MockEventSource;