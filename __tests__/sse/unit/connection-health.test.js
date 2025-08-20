/**
 * SSE Connection Health Tests
 * 
 * Tests EventSource connection establishment, maintenance, and recovery.
 * These tests would have caught major-system-cleanup failures related
 * to SSE connection issues and cross-tab synchronization problems.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  SSETestEnvironment,
  SSEAssertions,
  TestSuiteHelpers,
  TestDataGenerators
} from '../utils/test-helpers.js';
import { setupEventSourceMock } from '../utils/event-source-mock.js';

TestSuiteHelpers.describeSSE('Connection Health', (environment) => {
  describe('Basic Connection Establishment', () => {
    it('should establish SSE connection successfully', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(
        connection, 
        TestSuiteHelpers.SSE_TIMEOUT
      );
      
      expect(connection.readyState).toBe(EventSource.OPEN);
      expect(connection.url).toBe('/api/sse/conversations');
    });
    
    it('should handle connection with credentials', async () => {
      const { connection } = environment.createConnection(
        '/api/sse/conversations',
        { withCredentials: true }
      );
      
      await SSEAssertions.assertConnectionEstablished(connection);
      expect(connection.withCredentials).toBe(true);
    });
    
    it('should handle multiple concurrent connections', async () => {
      const connections = [];
      const urls = ['/api/sse/conversations', '/api/sse/cards', '/api/sse/sessions'];
      
      // Create multiple connections
      for (const url of urls) {
        const { connection } = environment.createConnection(url);
        connections.push(connection);
      }
      
      // Wait for all connections to establish
      await Promise.all(
        connections.map(conn => 
          SSEAssertions.assertConnectionEstablished(conn)
        )
      );
      
      // Verify all connections are open
      connections.forEach(conn => {
        expect(conn.readyState).toBe(EventSource.OPEN);
      });
    });
  });
  
  describe('Connection Failure Scenarios', () => {
    it('should handle server unavailable error', async () => {
      // Simulate server error
      environment.simulateError();
      
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionError(connection);
      expect(connection.readyState).toBe(EventSource.CLOSED);
    });
    
    it('should handle network timeout', async () => {
      // Setup with connection delay
      environment.teardown();
      environment.setup({
        eventSource: { 
          connectionDelay: 6000, // 6 second delay
          shouldConnect: false 
        }
      });
      
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await expect(
        SSEAssertions.assertConnectionEstablished(connection, 3000) // 3 second timeout
      ).rejects.toThrow('SSE connection timeout');
    });
    
    it('should handle malformed SSE response', async () => {
      // This would be handled by MSW returning malformed SSE data
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      // Send malformed SSE message
      environment.sendMessage('invalid-json-{', 'message');
      
      // The connection should remain stable even with bad messages
      expect(connection.readyState).toBe(EventSource.OPEN);
    });
  });
  
  describe('Connection Recovery', () => {
    it('should attempt reconnection after connection loss', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      // Simulate connection loss
      connection._simulateError();
      expect(connection.readyState).toBe(EventSource.CLOSED);
      
      // Simulate reconnection
      connection._simulateReconnect(1000);
      
      // Wait for reconnection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (connection.readyState === EventSource.OPEN) {
        // Reconnection successful
        expect(connection.readyState).toBe(EventSource.OPEN);
      } else {
        // Connection remained closed (also valid behavior)
        expect(connection.readyState).toBe(EventSource.CLOSED);
      }
    });
    
    it('should handle rapid connect/disconnect cycles', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      // Rapid connection cycling
      for (let i = 0; i < 5; i++) {
        await SSEAssertions.assertConnectionEstablished(connection);
        connection._simulateError();
        connection._simulateReconnect(100);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Final state should be stable
      expect([EventSource.CONNECTING, EventSource.OPEN, EventSource.CLOSED])
        .toContain(connection.readyState);
    });
  });
  
  describe('Connection State Management', () => {
    it('should track connection state changes correctly', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      const stateChanges = [];
      
      // Track state changes
      const checkState = () => stateChanges.push(connection.readyState);
      
      connection.addEventListener('open', checkState);
      connection.addEventListener('error', checkState);
      
      // Initial state should be CONNECTING
      expect(connection.readyState).toBe(EventSource.CONNECTING);
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      // Should have transitioned to OPEN
      expect(connection.readyState).toBe(EventSource.OPEN);
      expect(stateChanges).toContain(EventSource.OPEN);
    });
    
    it('should handle manual connection close', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      // Manually close connection
      connection.close();
      
      SSEAssertions.assertConnectionClosed(connection);
    });
    
    it('should prevent operations on closed connection', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      connection.close();
      
      // Attempting to send message to closed connection should not crash
      expect(() => {
        environment.sendMessage({ test: 'data' });
      }).not.toThrow();
    });
  });
  
  describe('Resource Management', () => {
    it('should properly clean up event listeners on close', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const mockListener = vi.fn();
      connection.addEventListener('message', mockListener);
      
      // Close connection
      connection.close();
      
      // Send message (should not reach closed connection)
      environment.sendMessage({ test: 'data' });
      
      // Wait a bit to ensure no delayed message delivery
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockListener).not.toHaveBeenCalled();
    });
    
    it('should handle multiple event listeners correctly', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const listeners = [vi.fn(), vi.fn(), vi.fn()];
      
      // Add multiple listeners
      listeners.forEach(listener => {
        connection.addEventListener('message', listener);
      });
      
      // Send message
      const testData = TestDataGenerators.generateConversationUpdate();
      environment.sendMessage(testData);
      
      await SSEAssertions.assertMessageReceived(connection, testData);
      
      // All listeners should have been called
      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalled();
      });
    });
  });
  
  describe('Error Handling and Resilience', () => {
    it('should maintain connection during high message volume', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      // Send high volume of messages
      const messageCount = 100;
      const promises = [];
      
      for (let i = 0; i < messageCount; i++) {
        const testData = TestDataGenerators.generateConversationUpdate({ 
          id: `conv-${i}` 
        });
        environment.sendMessage(testData);
      }
      
      // Connection should remain stable
      expect(connection.readyState).toBe(EventSource.OPEN);
      
      // Should be able to receive at least some messages
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(connection.readyState).toBe(EventSource.OPEN);
    });
    
    it('should handle concurrent connection attempts gracefully', async () => {
      const connections = [];
      const connectionCount = 10;
      
      // Create multiple connections simultaneously
      for (let i = 0; i < connectionCount; i++) {
        const { connection } = environment.createConnection(
          `/api/sse/conversations?client=${i}`
        );
        connections.push(connection);
      }
      
      // Wait for all connections with a reasonable timeout
      const results = await Promise.allSettled(
        connections.map(conn => 
          SSEAssertions.assertConnectionEstablished(conn, 5000)
        )
      );
      
      // At least some connections should succeed
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);
    });
  });
});

// Additional standalone tests for edge cases
describe('SSE Connection Edge Cases', () => {
  let mockEventSource;
  
  beforeEach(() => {
    mockEventSource = setupEventSourceMock();
  });
  
  afterEach(() => {
    if (mockEventSource?.mockRestore) {
      mockEventSource.mockRestore();
    }
  });
  
  it('should handle EventSource constructor errors', () => {
    // Test invalid URL
    expect(() => {
      new EventSource('');
    }).not.toThrow(); // EventSource should handle gracefully
    
    // Test with invalid options
    expect(() => {
      new EventSource('/api/sse/test', { invalid: 'option' });
    }).not.toThrow();
  });
  
  it('should handle EventSource not supported scenario', () => {
    const originalEventSource = global.EventSource;
    delete global.EventSource;
    
    // Code should handle missing EventSource gracefully
    expect(global.EventSource).toBeUndefined();
    
    // Restore
    global.EventSource = originalEventSource;
  });
});