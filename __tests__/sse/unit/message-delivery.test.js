/**
 * SSE Message Delivery Tests
 * 
 * Tests Server-Sent Events message parsing, delivery, and handling.
 * Ensures messages are properly formatted, parsed, and delivered to
 * the correct event handlers with proper error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  SSETestEnvironment,
  SSEAssertions,
  TestSuiteHelpers,
  TestDataGenerators
} from '../utils/test-helpers.js';
import { SSEMessageBuilders } from '../utils/event-source-mock.js';

TestSuiteHelpers.describeSSE('Message Delivery', (environment) => {
  describe('Basic Message Handling', () => {
    it('should receive and parse simple text messages', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const testMessage = 'Hello, SSE World!';
      environment.sendMessage(testMessage);
      
      const event = await SSEAssertions.assertMessageReceived(connection, testMessage);
      expect(event.type).toBe('message');
      expect(event.data).toBe(testMessage);
    });
    
    it('should receive and parse JSON messages', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const testData = TestDataGenerators.generateConversationUpdate();
      environment.sendMessage(testData);
      
      await SSEAssertions.assertMessageReceived(connection, testData);
    });
    
    it('should handle messages with event types', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const testData = TestDataGenerators.generateConversationUpdate();
      environment.sendMessage(testData, 'conversation_update');
      
      const event = await SSEAssertions.assertMessageReceived(
        connection, 
        testData, 
        'conversation_update'
      );
      
      expect(event.type).toBe('conversation_update');
    });
    
    it('should handle messages with event IDs', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const testData = TestDataGenerators.generateConversationUpdate();
      const eventId = `conv-${Date.now()}`;
      
      // Mock the SSE message with ID
      connection._sendMessage(testData, 'conversation_update', eventId);
      
      const event = await SSEAssertions.assertMessageReceived(
        connection,
        testData,
        'conversation_update'
      );
      
      expect(event.lastEventId).toBe(eventId);
    });
  });
  
  describe('Message Types and Formats', () => {
    it('should handle conversation update messages', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const conversationData = TestDataGenerators.generateConversationUpdate({
        id: 'conv-123',
        title: 'Test Conversation',
        lastActivity: Date.now(),
        participantCount: 3,
      });
      
      const message = SSEMessageBuilders.conversationUpdate(conversationData);
      environment.sendMessage(message, 'conversation_update');
      
      const event = await SSEAssertions.assertMessageReceived(
        connection,
        message,
        'conversation_update'
      );
      
      const parsedData = JSON.parse(event.data);
      expect(parsedData.type).toBe('conversation_update');
      expect(parsedData.data.id).toBe('conv-123');
    });
    
    it('should handle card update messages', async () => {
      const { connection } = environment.createConnection('/api/sse/cards');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const cardData = TestDataGenerators.generateCardUpdate({
        id: 'card-456',
        zone: 'active',
        title: 'Test Card',
      });
      
      const message = SSEMessageBuilders.cardUpdate(cardData);
      environment.sendMessage(message, 'card_update');
      
      const event = await SSEAssertions.assertMessageReceived(
        connection,
        message,
        'card_update'
      );
      
      const parsedData = JSON.parse(event.data);
      expect(parsedData.type).toBe('card_update');
      expect(parsedData.data.zone).toBe('active');
    });
    
    it('should handle session event messages', async () => {
      const { connection } = environment.createConnection('/api/sse/sessions');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const sessionData = TestDataGenerators.generateSessionEvent({
        type: 'user_join',
        userId: 'user-789',
      });
      
      const message = SSEMessageBuilders.sessionEvent(sessionData);
      environment.sendMessage(message, 'session_event');
      
      const event = await SSEAssertions.assertMessageReceived(
        connection,
        message,
        'session_event'
      );
      
      const parsedData = JSON.parse(event.data);
      expect(parsedData.type).toBe('session_event');
      expect(parsedData.data.userId).toBe('user-789');
    });
    
    it('should handle heartbeat messages', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const heartbeat = SSEMessageBuilders.heartbeat();
      environment.sendMessage(heartbeat, 'heartbeat');
      
      const event = await SSEAssertions.assertMessageReceived(
        connection,
        heartbeat,
        'heartbeat'
      );
      
      const parsedData = JSON.parse(event.data);
      expect(parsedData.type).toBe('heartbeat');
      expect(parsedData.data.timestamp).toBeDefined();
    });
    
    it('should handle system messages', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const systemMessage = SSEMessageBuilders.systemMessage('Server maintenance in 5 minutes', 'warning');
      environment.sendMessage(systemMessage, 'system_message');
      
      const event = await SSEAssertions.assertMessageReceived(
        connection,
        systemMessage,
        'system_message'
      );
      
      const parsedData = JSON.parse(event.data);
      expect(parsedData.type).toBe('system_message');
      expect(parsedData.data.level).toBe('warning');
    });
  });
  
  describe('Message Ordering and Delivery Guarantees', () => {
    it('should deliver messages in correct order', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const messages = [];
      const receivedMessages = [];
      
      // Setup message listener
      connection.addEventListener('message', (event) => {
        receivedMessages.push(JSON.parse(event.data));
      });
      
      // Send multiple messages in sequence
      for (let i = 0; i < 5; i++) {
        const message = TestDataGenerators.generateConversationUpdate({
          id: `conv-${i}`,
          sequence: i,
        });
        messages.push(message);
        environment.sendMessage(message);
      }
      
      // Wait for all messages to be delivered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify order
      expect(receivedMessages.length).toBeGreaterThanOrEqual(messages.length);
      
      // Check first few messages are in order (accounting for any additional messages)
      const relevantReceived = receivedMessages.slice(0, messages.length);
      relevantReceived.forEach((received, index) => {
        if (received.sequence !== undefined) {
          expect(received.sequence).toBe(index);
        }
      });
    });
    
    it('should handle rapid message delivery', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const messageCount = 50;
      const receivedMessages = [];
      
      connection.addEventListener('message', (event) => {
        receivedMessages.push(event.data);
      });
      
      // Send messages rapidly
      for (let i = 0; i < messageCount; i++) {
        environment.sendMessage(`Message ${i}`);
      }
      
      // Wait for delivery
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Should have received significant portion of messages
      expect(receivedMessages.length).toBeGreaterThan(messageCount * 0.5);
    });
    
    it('should handle duplicate message IDs appropriately', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const testData = TestDataGenerators.generateConversationUpdate();
      const duplicateId = 'duplicate-123';
      
      // Send same message with same ID twice
      connection._sendMessage(testData, 'message', duplicateId);
      connection._sendMessage(testData, 'message', duplicateId);
      
      const receivedMessages = [];
      connection.addEventListener('message', (event) => {
        receivedMessages.push(event);
      });
      
      // Wait for delivery
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Both messages should be delivered (EventSource doesn't automatically deduplicate)
      expect(receivedMessages.length).toBe(2);
      receivedMessages.forEach(msg => {
        expect(msg.lastEventId).toBe(duplicateId);
      });
    });
  });
  
  describe('Error Handling in Message Processing', () => {
    it('should handle malformed JSON messages gracefully', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      let errorThrown = false;
      let messageReceived = false;
      
      connection.addEventListener('message', (event) => {
        messageReceived = true;
        try {
          JSON.parse(event.data);
        } catch (error) {
          errorThrown = true;
        }
      });
      
      // Send malformed JSON
      environment.sendMessage('{ invalid json }');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(messageReceived).toBe(true);
      expect(errorThrown).toBe(true);
      
      // Connection should remain stable
      expect(connection.readyState).toBe(EventSource.OPEN);
    });
    
    it('should handle very large messages', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      // Create large message (10KB)
      const largeData = {
        id: 'large-message',
        payload: 'x'.repeat(10000),
        metadata: TestDataGenerators.generateConversationUpdate(),
      };
      
      let messageReceived = false;
      connection.addEventListener('message', (event) => {
        messageReceived = true;
        const parsed = JSON.parse(event.data);
        expect(parsed.payload.length).toBe(10000);
      });
      
      environment.sendMessage(largeData);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expect(messageReceived).toBe(true);
      expect(connection.readyState).toBe(EventSource.OPEN);
    });
    
    it('should handle messages with special characters', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const specialCharData = {
        id: 'special-chars',
        title: 'Test with "quotes", \\backslashes\\, and \n newlines',
        emoji: '🚀 💻 🎯',
        unicode: 'Unicode: ñáéíóú çñ 中文',
      };
      
      let messageReceived = false;
      connection.addEventListener('message', (event) => {
        messageReceived = true;
        const parsed = JSON.parse(event.data);
        expect(parsed.emoji).toBe('🚀 💻 🎯');
        expect(parsed.unicode).toContain('中文');
      });
      
      environment.sendMessage(specialCharData);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(messageReceived).toBe(true);
    });
    
    it('should handle empty messages', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      let messageReceived = false;
      connection.addEventListener('message', (event) => {
        messageReceived = true;
        expect(event.data).toBe('');
      });
      
      environment.sendMessage('');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(messageReceived).toBe(true);
    });
  });
  
  describe('Event Listener Management', () => {
    it('should handle multiple event listeners for same event type', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();
      
      connection.addEventListener('message', listener1);
      connection.addEventListener('message', listener2);  
      connection.addEventListener('message', listener3);
      
      const testData = TestDataGenerators.generateConversationUpdate();
      environment.sendMessage(testData);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });
    
    it('should handle event listener removal', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const listener = vi.fn();
      
      connection.addEventListener('message', listener);
      
      // Send first message
      environment.sendMessage({ test: 'message1' });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(listener).toHaveBeenCalledTimes(1);
      
      // Remove listener
      connection.removeEventListener('message', listener);
      
      // Send second message
      environment.sendMessage({ test: 'message2' });
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Listener should not be called again
      expect(listener).toHaveBeenCalledTimes(1);
    });
    
    it('should handle mixed event types', async () => {
      const { connection } = environment.createConnection('/api/sse/conversations');
      
      await SSEAssertions.assertConnectionEstablished(connection);
      
      const messageListener = vi.fn();
      const updateListener = vi.fn();
      const heartbeatListener = vi.fn();
      
      connection.addEventListener('message', messageListener);
      connection.addEventListener('conversation_update', updateListener);
      connection.addEventListener('heartbeat', heartbeatListener);
      
      // Send different types of messages
      environment.sendMessage('generic message', 'message');
      environment.sendMessage(TestDataGenerators.generateConversationUpdate(), 'conversation_update');
      environment.sendMessage(SSEMessageBuilders.heartbeat(), 'heartbeat');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      expect(messageListener).toHaveBeenCalledTimes(1);
      expect(updateListener).toHaveBeenCalledTimes(1);
      expect(heartbeatListener).toHaveBeenCalledTimes(1);
    });
  });
});