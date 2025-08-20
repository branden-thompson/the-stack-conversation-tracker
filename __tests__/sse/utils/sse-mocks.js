/**
 * MSW SSE Server Mocking Utilities
 * 
 * Provides Mock Service Worker (MSW) handlers for Server-Sent Events testing.
 * Enables realistic SSE server simulation with proper SSE formatting,
 * error scenarios, and performance testing capabilities.
 */

import { http, HttpResponse } from 'msw';
import { SSEMessageBuilders } from './event-source-mock.js';

/**
 * SSE Response Builder
 * Creates properly formatted SSE responses with correct headers
 */
export class SSEResponseBuilder {
  constructor() {
    this.messages = [];
  }
  
  /**
   * Add SSE message with proper formatting
   */
  addMessage(data, eventType = 'message', id = null, retry = null) {
    let message = '';
    
    if (id !== null) {
      message += `id: ${id}\n`;
    }
    
    if (eventType !== 'message') {
      message += `event: ${eventType}\n`;
    }
    
    if (retry !== null) {
      message += `retry: ${retry}\n`;
    }
    
    // Handle multi-line data
    const dataLines = (typeof data === 'string' ? data : JSON.stringify(data))
      .split('\n');
    dataLines.forEach(line => {
      message += `data: ${line}\n`;
    });
    
    message += '\n'; // Empty line to separate messages
    
    this.messages.push(message);
    return this;
  }
  
  /**
   * Add heartbeat message
   */
  addHeartbeat() {
    return this.addMessage(
      SSEMessageBuilders.heartbeat(),
      'heartbeat',
      `heartbeat-${Date.now()}`
    );
  }
  
  /**
   * Add conversation update
   */
  addConversationUpdate(conversationData) {
    return this.addMessage(
      SSEMessageBuilders.conversationUpdate(conversationData),
      'conversation_update',
      `conv-${conversationData.id}-${Date.now()}`
    );
  }
  
  /**
   * Add card update
   */
  addCardUpdate(cardData) {
    return this.addMessage(
      SSEMessageBuilders.cardUpdate(cardData),
      'card_update',
      `card-${cardData.id}-${Date.now()}`
    );
  }
  
  /**
   * Build SSE response
   */
  build() {
    return new HttpResponse(
      this.messages.join(''),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
        },
      }
    );
  }
  
  /**
   * Build error response
   */
  buildError(status = 500, message = 'Internal Server Error') {
    return new HttpResponse(
      `data: {"error": "${message}"}\n\n`,
      {
        status,
        headers: {
          'Content-Type': 'text/event-stream',
        },
      }
    );
  }
}

/**
 * SSE Mock Handlers Factory
 */
export class SSEMockHandlers {
  constructor() {
    this.handlers = [];
    this.messageQueue = [];
    this.isConnected = false;
    this.connectionDelay = 0;
    this.shouldFailConnection = false;
    this.messageInterval = null;
    this.heartbeatInterval = null;
  }
  
  /**
   * Create basic SSE endpoint handler
   */
  createSSEHandler(path, config = {}) {
    const handler = http.get(path, async ({ request }) => {
      // Simulate connection delay
      if (this.connectionDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.connectionDelay));
      }
      
      // Simulate connection failure
      if (this.shouldFailConnection) {
        return new SSEResponseBuilder().buildError(503, 'Service Unavailable');
      }
      
      const builder = new SSEResponseBuilder();
      
      // Add initial connection message
      builder.addMessage(
        { type: 'connection_established', timestamp: Date.now() },
        'connection'
      );
      
      // Add heartbeat if configured
      if (config.heartbeat) {
        builder.addHeartbeat();
      }
      
      // Add any queued messages
      this.messageQueue.forEach(msg => {
        builder.addMessage(msg.data, msg.eventType, msg.id);
      });
      
      this.isConnected = true;
      
      return builder.build();
    });
    
    this.handlers.push(handler);
    return handler;
  }
  
  /**
   * Create conversations SSE handler
   */
  createConversationsSSEHandler(path = '/api/sse/conversations') {
    return this.createSSEHandler(path, {
      heartbeat: true,
      messageTypes: ['conversation_update', 'conversation_created', 'conversation_deleted']
    });
  }
  
  /**
   * Create cards SSE handler
   */
  createCardsSSEHandler(path = '/api/sse/cards') {
    return this.createSSEHandler(path, {
      heartbeat: true,
      messageTypes: ['card_update', 'card_moved', 'card_flipped']
    });
  }
  
  /**
   * Create sessions SSE handler
   */
  createSessionsSSEHandler(path = '/api/sse/sessions') {
    return this.createSSEHandler(path, {
      heartbeat: true,
      messageTypes: ['session_event', 'user_activity', 'performance_metric']
    });
  }
  
  /**
   * Send message to connected clients
   */
  sendMessage(data, eventType = 'message', id = null) {
    if (this.isConnected) {
      // In a real implementation, this would push to actual connections
      // For testing, we add to a queue that will be sent on next connection
      this.messageQueue.push({ data, eventType, id, timestamp: Date.now() });
    }
  }
  
  /**
   * Simulate network error
   */
  simulateError() {
    this.shouldFailConnection = true;
    this.isConnected = false;
  }
  
  /**
   * Restore normal operation
   */
  restore() {
    this.shouldFailConnection = false;
    this.connectionDelay = 0;
  }
  
  /**
   * Set connection delay for testing
   */
  setConnectionDelay(delay) {
    this.connectionDelay = delay;
  }
  
  /**
   * Clear message queue
   */
  clearMessages() {
    this.messageQueue = [];
  }
  
  /**
   * Get all handlers
   */
  getAllHandlers() {
    return this.handlers;
  }
}

/**
 * Predefined SSE Mock Scenarios
 */
export const SSEMockScenarios = {
  /**
   * Normal operation scenario
   */
  normalOperation: () => {
    const handlers = new SSEMockHandlers();
    handlers.createConversationsSSEHandler();
    handlers.createCardsSSEHandler(); 
    handlers.createSessionsSSEHandler();
    return handlers;
  },
  
  /**
   * Connection failure scenario
   */
  connectionFailure: () => {
    const handlers = new SSEMockHandlers();
    handlers.simulateError();
    handlers.createConversationsSSEHandler();
    handlers.createCardsSSEHandler();
    handlers.createSessionsSSEHandler();
    return handlers;
  },
  
  /**
   * Slow connection scenario
   */
  slowConnection: (delay = 5000) => {
    const handlers = new SSEMockHandlers();
    handlers.setConnectionDelay(delay);
    handlers.createConversationsSSEHandler();
    handlers.createCardsSSEHandler();
    handlers.createSessionsSSEHandler();
    return handlers;
  },
  
  /**
   * High frequency messages scenario
   */
  highFrequencyMessages: () => {
    const handlers = new SSEMockHandlers();
    handlers.createConversationsSSEHandler();
    handlers.createCardsSSEHandler();
    handlers.createSessionsSSEHandler();
    
    // Simulate high frequency message sending
    setInterval(() => {
      handlers.sendMessage(
        SSEMessageBuilders.conversationUpdate({
          id: 'test-conversation',
          lastActivity: Date.now(),
        }),
        'conversation_update'
      );
    }, 100); // 10 messages per second
    
    return handlers;
  },
  
  /**
   * Cross-tab synchronization scenario
   */
  crossTabSync: () => {
    const handlers = new SSEMockHandlers();
    handlers.createConversationsSSEHandler('/api/sse/conversations');
    handlers.createCardsSSEHandler('/api/sse/cards');
    
    // Simulate cross-tab events
    handlers.sendMessage(
      SSEMessageBuilders.cardUpdate({
        id: 'card-1',
        zone: 'active',
        movedBy: 'user-2',
        timestamp: Date.now(),
      }),
      'card_moved'
    );
    
    return handlers;
  },
};

/**
 * SSE Test Utilities
 */
export const SSETestUtils = {
  /**
   * Wait for SSE connection to establish
   */
  waitForConnection: (eventSource, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`SSE connection timeout after ${timeout}ms`));
      }, timeout);
      
      const onOpen = () => {
        clearTimeout(timer);
        eventSource.removeEventListener('open', onOpen);
        resolve();
      };
      
      const onError = (error) => {
        clearTimeout(timer);
        eventSource.removeEventListener('error', onError);
        reject(error);
      };
      
      eventSource.addEventListener('open', onOpen);
      eventSource.addEventListener('error', onError);
    });
  },
  
  /**
   * Wait for specific SSE message
   */
  waitForMessage: (eventSource, eventType = 'message', timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`SSE message timeout after ${timeout}ms`));
      }, timeout);
      
      const onMessage = (event) => {
        clearTimeout(timer);
        eventSource.removeEventListener(eventType, onMessage);
        resolve(event);
      };
      
      eventSource.addEventListener(eventType, onMessage);
    });
  },
  
  /**
   * Count messages received in time window
   */
  countMessages: (eventSource, eventType = 'message', duration = 1000) => {
    return new Promise((resolve) => {
      let count = 0;
      
      const onMessage = () => {
        count++;
      };
      
      eventSource.addEventListener(eventType, onMessage);
      
      setTimeout(() => {
        eventSource.removeEventListener(eventType, onMessage);
        resolve(count);
      }, duration);
    });
  },
};

export { SSEResponseBuilder } from './sse-mocks.js';
export default SSEMockHandlers;