/**
 * Integration Tests for Events API
 * Tests event streaming, creation, and conversation event management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/conversations/[id]/events/route';

// Mock the store functions
vi.mock('@/app/api/conversations/store', () => ({
  listEvents: vi.fn(),
  addEvent: vi.fn(),
  clearEvents: vi.fn()
}));

import { listEvents, addEvent, clearEvents } from '@/app/api/conversations/store';

// Test data
const mockEvents = [
  {
    id: 'event-1',
    conversationId: 'conv-1',
    type: 'card.created',
    payload: { id: 'card-1', type: 'topic', zone: 'active' },
    at: 1640995200000
  },
  {
    id: 'event-2',
    conversationId: 'conv-1',
    type: 'card.moved',
    payload: { id: 'card-1', from: 'active', to: 'resolved' },
    at: 1640995260000
  },
  {
    id: 'event-3',
    conversationId: 'conv-1',
    type: 'card.updated',
    payload: { id: 'card-1', content: 'Updated content' },
    at: 1640995320000
  }
];

const mockNewEvent = {
  id: 'event-4',
  conversationId: 'conv-1',
  type: 'card.deleted',
  payload: { id: 'card-1' },
  at: 1640995380000
};

// Helper to create mock requests
function createMockRequest(url, options = {}) {
  return new NextRequest(url, {
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.headers || { 'Content-Type': 'application/json' }
  });
}

describe('Events API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/conversations/[id]/events', () => {
    it('should return all events for a conversation', async () => {
      listEvents.mockReturnValue(mockEvents);
      
      const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events');
      const response = await GET(request, { params: { id: 'conv-1' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockEvents);
      expect(listEvents).toHaveBeenCalledWith('conv-1');
    });

    it('should return empty array for conversation with no events', async () => {
      listEvents.mockReturnValue([]);
      
      const request = createMockRequest('http://localhost:3000/api/conversations/conv-empty/events');
      const response = await GET(request, { params: { id: 'conv-empty' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual([]);
      expect(listEvents).toHaveBeenCalledWith('conv-empty');
    });

    it('should handle special characters in conversation ID', async () => {
      const specialId = 'conv-with-special-chars-123_@#$';
      listEvents.mockReturnValue([]);
      
      const request = createMockRequest(`http://localhost:3000/api/conversations/${encodeURIComponent(specialId)}/events`);
      const response = await GET(request, { params: { id: specialId } });
      
      expect(response.status).toBe(200);
      expect(listEvents).toHaveBeenCalledWith(specialId);
    });
  });

  describe('POST /api/conversations/[id]/events', () => {
    it('should create a new event with valid data', async () => {
      addEvent.mockReturnValue(mockNewEvent);
      
      const eventData = {
        type: 'card.created',
        payload: { id: 'card-2', type: 'question', zone: 'active' }
      };
      
      const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
        method: 'POST',
        body: eventData
      });
      
      const response = await POST(request, { params: { id: 'conv-1' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockNewEvent);
      expect(addEvent).toHaveBeenCalledWith('conv-1', 'card.created', eventData.payload);
    });

    it('should handle different event types', async () => {
      const eventTypes = [
        {
          type: 'card.created',
          payload: { id: 'card-1', type: 'topic' }
        },
        {
          type: 'card.moved',
          payload: { id: 'card-1', from: 'active', to: 'resolved' }
        },
        {
          type: 'card.updated',
          payload: { id: 'card-1', content: 'New content' }
        },
        {
          type: 'card.deleted',
          payload: { id: 'card-1' }
        }
      ];

      for (const eventData of eventTypes) {
        addEvent.mockReturnValue({ ...mockNewEvent, ...eventData });
        
        const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
          method: 'POST',
          body: eventData
        });
        
        const response = await POST(request, { params: { id: 'conv-1' } });
        expect(response.status).toBe(200);
        expect(addEvent).toHaveBeenCalledWith('conv-1', eventData.type, eventData.payload);
      }
    });

    it('should return 400 when type is missing', async () => {
      const invalidData = {
        payload: { id: 'card-1' }
      };
      
      const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
        method: 'POST',
        body: invalidData
      });
      
      const response = await POST(request, { params: { id: 'conv-1' } });
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.message).toBe('type required');
    });

    it('should return 404 when conversation not found', async () => {
      addEvent.mockReturnValue(null);
      
      const eventData = {
        type: 'card.created',
        payload: { id: 'card-1' }
      };
      
      const request = createMockRequest('http://localhost:3000/api/conversations/nonexistent/events', {
        method: 'POST',
        body: eventData
      });
      
      const response = await POST(request, { params: { id: 'nonexistent' } });
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.message).toBe('conversation not found');
    });

    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/conversations/conv-1/events', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request, { params: { id: 'conv-1' } });
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.message).toBe('type required');
    });

    it('should handle events with no payload', async () => {
      addEvent.mockReturnValue(mockNewEvent);
      
      const eventData = {
        type: 'conversation.paused'
      };
      
      const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
        method: 'POST',
        body: eventData
      });
      
      const response = await POST(request, { params: { id: 'conv-1' } });
      
      expect(response.status).toBe(200);
      expect(addEvent).toHaveBeenCalledWith('conv-1', 'conversation.paused', undefined);
    });

    it('should handle complex payloads', async () => {
      addEvent.mockReturnValue(mockNewEvent);
      
      const complexPayload = {
        id: 'card-1',
        type: 'topic',
        content: 'Complex content with\nnewlines and "quotes"',
        metadata: {
          author: 'user-123',
          tags: ['important', 'discussion'],
          attachments: [
            { type: 'image', url: 'http://example.com/image.jpg' },
            { type: 'document', url: 'http://example.com/doc.pdf' }
          ]
        },
        position: { x: 150.5, y: 200.75 },
        timestamps: {
          created: '2025-01-01T00:00:00.000Z',
          lastModified: '2025-01-01T01:30:45.123Z'
        }
      };
      
      const eventData = {
        type: 'card.created',
        payload: complexPayload
      };
      
      const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
        method: 'POST',
        body: eventData
      });
      
      const response = await POST(request, { params: { id: 'conv-1' } });
      
      expect(response.status).toBe(200);
      expect(addEvent).toHaveBeenCalledWith('conv-1', 'card.created', complexPayload);
    });
  });

  describe('DELETE /api/conversations/[id]/events', () => {
    it('should clear all events for a conversation', async () => {
      clearEvents.mockReturnValue(undefined);
      
      const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request, { params: { id: 'conv-1' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(clearEvents).toHaveBeenCalledWith('conv-1');
    });

    it('should handle clearing events for nonexistent conversation', async () => {
      clearEvents.mockReturnValue(undefined);
      
      const request = createMockRequest('http://localhost:3000/api/conversations/nonexistent/events', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(clearEvents).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('Event Stream Performance and Edge Cases', () => {
    it('should handle high-frequency event creation', async () => {
      const rapidEvents = Array.from({ length: 100 }, (_, i) => ({
        type: 'card.updated',
        payload: { id: 'card-1', content: `Update ${i}` }
      }));

      addEvent.mockReturnValue(mockNewEvent);

      // Simulate rapid event creation
      const promises = rapidEvents.map(eventData => {
        const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
          method: 'POST',
          body: eventData
        });
        return POST(request, { params: { id: 'conv-1' } });
      });

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      expect(addEvent).toHaveBeenCalledTimes(100);
    });

    it('should handle events with large payloads', async () => {
      addEvent.mockReturnValue(mockNewEvent);
      
      const largePayload = {
        id: 'card-1',
        content: 'x'.repeat(50000), // 50KB content
        largeData: Array.from({ length: 1000 }, (_, i) => ({
          index: i,
          data: `Large data item ${i}`,
          timestamp: Date.now() + i
        }))
      };
      
      const eventData = {
        type: 'card.created',
        payload: largePayload
      };
      
      const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
        method: 'POST',
        body: eventData
      });
      
      const response = await POST(request, { params: { id: 'conv-1' } });
      expect(response.status).toBe(200);
    });

    it('should maintain event ordering', async () => {
      const orderedEvents = [
        { type: 'card.created', payload: { id: 'card-1', order: 1 } },
        { type: 'card.updated', payload: { id: 'card-1', order: 2 } },
        { type: 'card.moved', payload: { id: 'card-1', order: 3 } },
        { type: 'card.deleted', payload: { id: 'card-1', order: 4 } }
      ];

      addEvent.mockImplementation((conversationId, type, payload) => ({
        id: `event-${payload.order}`,
        conversationId,
        type,
        payload,
        at: Date.now() + payload.order
      }));

      const responses = [];
      for (const eventData of orderedEvents) {
        const request = createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
          method: 'POST',
          body: eventData
        });
        const response = await POST(request, { params: { id: 'conv-1' } });
        responses.push(await response.json());
      }

      responses.forEach((event, index) => {
        expect(event.payload.order).toBe(index + 1);
      });
    });

    it('should handle concurrent event operations', async () => {
      listEvents.mockReturnValue(mockEvents);
      addEvent.mockReturnValue(mockNewEvent);
      clearEvents.mockReturnValue(undefined);

      // Simulate concurrent operations
      const operations = [
        GET(createMockRequest('http://localhost:3000/api/conversations/conv-1/events'), { params: { id: 'conv-1' } }),
        POST(createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
          method: 'POST',
          body: { type: 'card.created', payload: { id: 'card-1' } }
        }), { params: { id: 'conv-1' } }),
        DELETE(createMockRequest('http://localhost:3000/api/conversations/conv-1/events', {
          method: 'DELETE'
        }), { params: { id: 'conv-1' } })
      ];

      const results = await Promise.all(operations);
      
      results.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});