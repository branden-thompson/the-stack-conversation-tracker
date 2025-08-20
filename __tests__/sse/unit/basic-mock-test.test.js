/**
 * Basic SSE Mock Test
 * 
 * Simple validation test for SSE mock infrastructure without complex environment setup.
 * This test validates that our EventSource mock and basic message handling works correctly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupEventSourceMock, SSEMessageBuilders } from '../utils/event-source-mock.js';

describe('Basic SSE Mock Infrastructure', () => {
  let mockEventSource;
  
  beforeEach(() => {
    mockEventSource = setupEventSourceMock();
  });
  
  afterEach(() => {
    if (mockEventSource?.mockRestore) {
      mockEventSource.mockRestore();
    }
  });
  
  describe('EventSource Mock Basic Functionality', () => {
    it('should create EventSource instance', () => {
      const eventSource = new EventSource('/test');
      
      expect(eventSource).toBeDefined();
      expect(eventSource.url).toBe('/test');
      expect(eventSource.readyState).toBe(EventSource.CONNECTING);
    });
    
    it('should handle connection establishment', async () => {
      const eventSource = new EventSource('/test');
      
      // Wait for connection to establish
      await new Promise(resolve => {
        eventSource.addEventListener('open', () => {
          resolve();
        });
      });
      
      expect(eventSource.readyState).toBe(EventSource.OPEN);
    });
    
    it('should receive messages', async () => {
      const eventSource = new EventSource('/test');
      
      // Wait for connection
      await new Promise(resolve => {
        eventSource.addEventListener('open', resolve);
      });
      
      // Setup message listener
      const messagePromise = new Promise(resolve => {
        eventSource.addEventListener('message', (event) => {
          resolve(event);
        });
      });
      
      // Send message directly via mock
      const testData = { test: 'message', timestamp: Date.now() };
      eventSource._sendMessage(testData);
      
      const event = await messagePromise;
      expect(JSON.parse(event.data)).toEqual(testData);
    });
    
    it('should handle different event types', async () => {
      const eventSource = new EventSource('/test');
      
      await new Promise(resolve => {
        eventSource.addEventListener('open', resolve);
      });
      
      // Setup event listener for custom event type
      const eventPromise = new Promise(resolve => {
        eventSource.addEventListener('test_event', (event) => {
          resolve(event);
        });
      });
      
      // Send custom event type
      const testData = { message: 'custom event' };
      eventSource._sendMessage(testData, 'test_event', 'event-123');
      
      const event = await eventPromise;
      expect(JSON.parse(event.data)).toEqual(testData);
      expect(event.lastEventId).toBe('event-123');
    });
    
    it('should handle connection close', async () => {
      const eventSource = new EventSource('/test');
      
      await new Promise(resolve => {
        eventSource.addEventListener('open', resolve);
      });
      
      expect(eventSource.readyState).toBe(EventSource.OPEN);
      
      eventSource.close();
      expect(eventSource.readyState).toBe(EventSource.CLOSED);
    });
  });
  
  describe('SSE Message Builders', () => {
    it('should create conversation update messages', () => {
      const conversationData = {
        id: 'conv-123',
        title: 'Test Conversation',
        lastActivity: Date.now(),
      };
      
      const message = SSEMessageBuilders.conversationUpdate(conversationData);
      
      expect(message.type).toBe('conversation_update');
      expect(message.data).toEqual(conversationData);
      expect(message.timestamp).toBeDefined();
    });
    
    it('should create card update messages', () => {
      const cardData = {
        id: 'card-456',
        zone: 'active',
        title: 'Test Card',
      };
      
      const message = SSEMessageBuilders.cardUpdate(cardData);
      
      expect(message.type).toBe('card_update');
      expect(message.data).toEqual(cardData);
      expect(message.timestamp).toBeDefined();
    });
    
    it('should create heartbeat messages', () => {
      const heartbeat = SSEMessageBuilders.heartbeat();
      
      expect(heartbeat.type).toBe('heartbeat');
      expect(heartbeat.data.timestamp).toBeDefined();
      expect(heartbeat.timestamp).toBeDefined();
    });
    
    it('should create system messages', () => {
      const systemMessage = SSEMessageBuilders.systemMessage('Test message', 'info');
      
      expect(systemMessage.type).toBe('system_message');
      expect(systemMessage.data.message).toBe('Test message');
      expect(systemMessage.data.level).toBe('info');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      const eventSource = new EventSource('/test');
      
      // Setup error listener
      const errorPromise = new Promise(resolve => {
        eventSource.addEventListener('error', (event) => {
          resolve(event);
        });
      });
      
      // Simulate error
      eventSource._simulateError();
      
      await errorPromise;
      expect(eventSource.readyState).toBe(EventSource.CLOSED);
    });
    
    it('should handle malformed messages gracefully', async () => {
      const eventSource = new EventSource('/test');
      
      await new Promise(resolve => {
        eventSource.addEventListener('open', resolve);
      });
      
      // Send malformed JSON
      const messagePromise = new Promise(resolve => {
        eventSource.addEventListener('message', (event) => {
          resolve(event);
        });
      });
      
      eventSource._sendMessage('{ invalid json }');
      
      const event = await messagePromise;
      expect(event.data).toBe('{ invalid json }');
      
      // Connection should remain stable
      expect(eventSource.readyState).toBe(EventSource.OPEN);
    });
  });
});

describe('EventSource Standards Compliance', () => {
  let mockEventSource;
  
  beforeEach(() => {
    mockEventSource = setupEventSourceMock();
  });
  
  afterEach(() => {
    if (mockEventSource?.mockRestore) {
      mockEventSource.mockRestore();
    }
  });
  
  it('should expose correct constants', () => {
    expect(EventSource.CONNECTING).toBe(0);
    expect(EventSource.OPEN).toBe(1);
    expect(EventSource.CLOSED).toBe(2);
  });
  
  it('should handle event listener management', async () => {
    const eventSource = new EventSource('/test');
    
    await new Promise(resolve => {
      eventSource.addEventListener('open', resolve);
    });
    
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    
    // Add multiple listeners
    eventSource.addEventListener('message', listener1);
    eventSource.addEventListener('message', listener2);
    
    // Send message
    eventSource._sendMessage('test message');
    
    // Wait for message delivery
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    
    // Remove one listener
    eventSource.removeEventListener('message', listener1);
    
    // Send another message
    eventSource._sendMessage('test message 2');
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(listener1).toHaveBeenCalledTimes(1); // Still 1
    expect(listener2).toHaveBeenCalledTimes(2); // Now 2
  });
});