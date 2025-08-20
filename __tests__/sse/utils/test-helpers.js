/**
 * SSE Test Helpers
 * 
 * Common utilities and helpers for SSE testing across unit, integration,
 * and performance tests. Provides standardized testing patterns and
 * assertion helpers for Server-Sent Events functionality.
 */

import { vi, expect } from 'vitest';
import { setupEventSourceMock, SSEMessageBuilders } from './event-source-mock.js';
import { SSEMockHandlers, SSETestUtils } from './sse-mocks.js';
import { setupServer } from 'msw/node';

/**
 * SSE Test Environment Setup
 */
export class SSETestEnvironment {
  constructor() {
    this.mockServer = null;
    this.eventSourceMock = null;
    this.mockHandlers = null;
    this.connections = new Map();
    this.messageHistory = [];
  }
  
  /**
   * Setup complete SSE test environment
   */
  setup(config = {}) {
    // Setup EventSource mock
    this.eventSourceMock = setupEventSourceMock(config.eventSource || {});
    
    // Setup MSW server with SSE handlers
    this.mockHandlers = new SSEMockHandlers();
    
    // Create default handlers unless disabled
    if (!config.skipDefaultHandlers) {
      this.mockHandlers.createConversationsSSEHandler();
      this.mockHandlers.createCardsSSEHandler();
      this.mockHandlers.createSessionsSSEHandler();
    }
    
    this.mockServer = setupServer(...this.mockHandlers.getAllHandlers());
    this.mockServer.listen({ onUnhandledRequest: 'warn' });
    
    return this;
  }
  
  /**
   * Teardown test environment
   */
  teardown() {
    if (this.mockServer) {
      this.mockServer.close();
    }
    
    // Close all active connections
    this.connections.forEach(connection => {
      if (connection.close) {
        connection.close();
      }
    });
    
    this.connections.clear();
    this.messageHistory = [];
    
    // Restore EventSource
    if (global.EventSource?.mockRestore) {
      global.EventSource.mockRestore();
    }
  }
  
  /**
   * Create tracked SSE connection
   */
  createConnection(url, options = {}) {
    const connection = new EventSource(url, options);
    const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Track connection
    this.connections.set(connectionId, connection);
    
    // Track messages for debugging
    connection.addEventListener('message', (event) => {
      this.messageHistory.push({
        connectionId,
        timestamp: Date.now(),
        type: event.type,
        data: event.data,
        lastEventId: event.lastEventId,
      });
    });
    
    return { connection, connectionId };
  }
  
  /**
   * Send message through mock handlers
   */
  sendMessage(data, eventType = 'message', id = null) {
    if (this.mockHandlers) {
      this.mockHandlers.sendMessage(data, eventType, id);
    }
  }
  
  /**
   * Simulate network error
   */
  simulateError() {
    if (this.mockHandlers) {
      this.mockHandlers.simulateError();
    }
  }
  
  /**
   * Get message history for debugging
   */
  getMessageHistory(connectionId = null) {
    if (connectionId) {
      return this.messageHistory.filter(msg => msg.connectionId === connectionId);
    }
    return [...this.messageHistory];
  }
  
  /**
   * Clear message history
   */
  clearMessageHistory() {
    this.messageHistory = [];
    if (this.mockHandlers) {
      this.mockHandlers.clearMessages();
    }
  }
}

/**
 * SSE Assertion Helpers
 */
export const SSEAssertions = {
  /**
   * Assert SSE connection establishes successfully
   */
  async assertConnectionEstablished(eventSource, timeout = 5000) {
    await expect(
      SSETestUtils.waitForConnection(eventSource, timeout)
    ).resolves.not.toThrow();
    
    expect(eventSource.readyState).toBe(EventSource.OPEN);
  },
  
  /**
   * Assert specific message received
   */
  async assertMessageReceived(eventSource, expectedData, eventType = 'message', timeout = 5000) {
    const event = await SSETestUtils.waitForMessage(eventSource, eventType, timeout);
    
    if (typeof expectedData === 'object') {
      expect(JSON.parse(event.data)).toEqual(expectedData);
    } else {
      expect(event.data).toBe(expectedData);
    }
    
    return event;
  },
  
  /**
   * Assert message count in time window
   */
  async assertMessageCount(eventSource, expectedCount, duration = 1000, eventType = 'message') {
    const actualCount = await SSETestUtils.countMessages(eventSource, eventType, duration);
    expect(actualCount).toBe(expectedCount);
  },
  
  /**
   * Assert connection closes gracefully
   */
  assertConnectionClosed(eventSource) {
    expect(eventSource.readyState).toBe(EventSource.CLOSED);
  },
  
  /**
   * Assert connection error handling
   */
  async assertConnectionError(eventSource, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Expected connection error within ${timeout}ms`));
      }, timeout);
      
      const onError = (error) => {
        clearTimeout(timer);
        eventSource.removeEventListener('error', onError);
        resolve(error);
      };
      
      eventSource.addEventListener('error', onError);
    });
  },
};

/**
 * Cross-Tab Synchronization Test Helpers
 */
export const CrossTabTestHelpers = {
  /**
   * Simulate multiple browser tabs
   */
  createMultipleTabs(environment, count = 3, url = '/api/sse/cards') {
    const tabs = [];
    
    for (let i = 0; i < count; i++) {
      const { connection, connectionId } = environment.createConnection(url);
      tabs.push({ connection, connectionId, tabId: `tab-${i + 1}` });
    }
    
    return tabs;
  },
  
  /**
   * Assert all tabs receive same message
   */
  async assertAllTabsReceiveMessage(tabs, messageData, eventType = 'message', timeout = 5000) {
    const promises = tabs.map(tab => 
      SSETestUtils.waitForMessage(tab.connection, eventType, timeout)
    );
    
    const events = await Promise.all(promises);
    
    // Verify all tabs received the same message
    events.forEach((event, index) => {
      if (typeof messageData === 'object') {
        expect(JSON.parse(event.data)).toEqual(messageData);
      } else {
        expect(event.data).toBe(messageData);
      }
    });
    
    return events;
  },
  
  /**
   * Simulate tab closing
   */
  closeTab(tab) {
    if (tab.connection && tab.connection.close) {
      tab.connection.close();
    }
  },
  
  /**
   * Simulate tab becoming inactive
   */
  simulateTabInactive(tab) {
    // In a real scenario, this might affect polling or connection behavior
    // For testing, we can simulate by reducing message frequency
    if (tab.connection._simulateInactive) {
      tab.connection._simulateInactive();
    }
  },
};

/**
 * Performance Test Helpers
 */
export const PerformanceTestHelpers = {
  /**
   * Measure connection establishment time
   */
  async measureConnectionTime(eventSource) {
    const startTime = performance.now();
    
    await SSETestUtils.waitForConnection(eventSource);
    
    const endTime = performance.now();
    return endTime - startTime;
  },
  
  /**
   * Measure message throughput
   */
  async measureMessageThroughput(eventSource, duration = 5000) {
    const startTime = performance.now();
    let messageCount = 0;
    
    const onMessage = () => messageCount++;
    eventSource.addEventListener('message', onMessage);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    eventSource.removeEventListener('message', onMessage);
    
    const endTime = performance.now();
    const actualDuration = endTime - startTime;
    
    return {
      messageCount,
      duration: actualDuration,
      messagesPerSecond: (messageCount / actualDuration) * 1000,
    };
  },
  
  /**
   * Monitor memory usage during SSE operations
   */
  createMemoryMonitor(sampleInterval = 1000) {
    const samples = [];
    let monitoring = false;
    let intervalId = null;
    
    return {
      start() {
        monitoring = true;
        intervalId = setInterval(() => {
          if (monitoring && performance.memory) {
            samples.push({
              timestamp: Date.now(),
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            });
          }
        }, sampleInterval);
      },
      
      stop() {
        monitoring = false;
        if (intervalId) {
          clearInterval(intervalId);
        }
      },
      
      getSamples() {
        return [...samples];
      },
      
      getMemoryGrowth() {
        if (samples.length < 2) return 0;
        const first = samples[0].usedJSHeapSize;
        const last = samples[samples.length - 1].usedJSHeapSize;
        return last - first;
      },
      
      detectMemoryLeak(threshold = 1024 * 1024) { // 1MB threshold
        const growth = this.getMemoryGrowth();
        return growth > threshold;
      },
    };
  },
};

/**
 * Common Test Data Generators
 */
export const TestDataGenerators = {
  /**
   * Generate conversation update data
   */
  generateConversationUpdate(overrides = {}) {
    return {
      id: `conv-${Date.now()}`,
      title: `Test Conversation ${Math.random().toString(36).substr(2, 9)}`,
      lastActivity: Date.now(),
      participantCount: Math.floor(Math.random() * 5) + 1,
      status: 'active',
      ...overrides,
    };
  },
  
  /**
   * Generate card update data
   */
  generateCardUpdate(overrides = {}) {
    const zones = ['backlog', 'active', 'review', 'done'];
    return {
      id: `card-${Date.now()}`,
      title: `Test Card ${Math.random().toString(36).substr(2, 9)}`,
      zone: zones[Math.floor(Math.random() * zones.length)],
      assignee: `user-${Math.floor(Math.random() * 3) + 1}`,
      timestamp: Date.now(),
      ...overrides,
    };
  },
  
  /**
   * Generate session event data
   */
  generateSessionEvent(overrides = {}) {
    const eventTypes = ['user_join', 'user_leave', 'activity', 'performance'];
    return {
      id: `event-${Date.now()}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      userId: `user-${Math.floor(Math.random() * 5) + 1}`,
      timestamp: Date.now(),
      metadata: {
        source: 'test',
        sessionId: `session-${Date.now()}`,
      },
      ...overrides,
    };
  },
};

/**
 * Test Suite Helpers
 */
export const TestSuiteHelpers = {
  /**
   * Create standardized describe block for SSE tests
   */
  describeSSE(name, testFn) {
    return describe(`SSE: ${name}`, () => {
      let environment;
      
      beforeEach(() => {
        environment = new SSETestEnvironment();
        environment.setup();
      });
      
      afterEach(() => {
        if (environment) {
          environment.teardown();
        }
      });
      
      testFn(environment);
    });
  },
  
  /**
   * Common test timeout for SSE operations
   */
  SSE_TIMEOUT: 10000, // 10 seconds for SSE operations
  
  /**
   * Common test patterns
   */
  patterns: {
    connectionTest: async (environment, url) => {
      const { connection } = environment.createConnection(url);
      await SSEAssertions.assertConnectionEstablished(connection);
      return connection;
    },
    
    messageTest: async (environment, url, testMessage) => {
      const { connection } = environment.createConnection(url);
      await SSEAssertions.assertConnectionEstablished(connection);
      
      environment.sendMessage(testMessage.data, testMessage.type);
      await SSEAssertions.assertMessageReceived(connection, testMessage.data, testMessage.type);
      
      return connection;
    },
  },
};

export default {
  SSETestEnvironment,
  SSEAssertions,
  CrossTabTestHelpers,
  PerformanceTestHelpers,
  TestDataGenerators,
  TestSuiteHelpers,
};