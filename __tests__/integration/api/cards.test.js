/**
 * Integration Tests for Cards API
 * Tests all CRUD operations and edge cases for the cards endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/cards/route';

// Mock the database functions
vi.mock('@/lib/db/database', () => ({
  getAllCards: vi.fn(),
  getCard: vi.fn(),
  createCard: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
  updateMultipleCards: vi.fn()
}));

// Import mocked functions
import {
  getAllCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  updateMultipleCards
} from '@/lib/db/database';

// Test data
const mockCard = {
  id: 'test-card-1',
  type: 'topic',
  content: 'Test card content',
  zone: 'active',
  position: { x: 10, y: 20 },
  stackOrder: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

const mockCards = [
  mockCard,
  {
    id: 'test-card-2',
    type: 'question',
    content: 'Another test card',
    zone: 'parking',
    position: { x: 50, y: 100 },
    stackOrder: 1,
    createdAt: '2025-01-01T01:00:00.000Z',
    updatedAt: '2025-01-01T01:00:00.000Z'
  }
];

// Helper to create mock requests
function createMockRequest(url, options = {}) {
  return new NextRequest(url, {
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.headers || { 'Content-Type': 'application/json' }
  });
}

describe('Cards API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/cards', () => {
    it('should return all cards when no ID specified', async () => {
      getAllCards.mockResolvedValue(mockCards);
      
      const request = createMockRequest('http://localhost:3000/api/cards');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCards);
      expect(getAllCards).toHaveBeenCalledOnce();
    });

    it('should return specific card when ID provided', async () => {
      getCard.mockResolvedValue(mockCard);
      
      const request = createMockRequest('http://localhost:3000/api/cards?id=test-card-1');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCard);
      expect(getCard).toHaveBeenCalledWith('test-card-1');
    });

    it('should return 404 when card not found', async () => {
      getCard.mockResolvedValue(null);
      
      const request = createMockRequest('http://localhost:3000/api/cards?id=nonexistent');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Card not found');
    });

    it('should handle database errors gracefully', async () => {
      getAllCards.mockRejectedValue(new Error('Database connection failed'));
      
      const request = createMockRequest('http://localhost:3000/api/cards');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch cards');
    });
  });

  describe('POST /api/cards', () => {
    it('should create a new card with valid data', async () => {
      const newCardData = {
        type: 'topic',
        content: 'New card',
        zone: 'active',
        position: { x: 0, y: 0 }
      };
      
      createCard.mockResolvedValue({ ...mockCard, ...newCardData });
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: newCardData
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.type).toBe('topic');
      expect(data.zone).toBe('active');
      expect(createCard).toHaveBeenCalledWith(newCardData);
    });

    it('should validate required fields - missing type', async () => {
      const invalidData = {
        content: 'Missing type',
        zone: 'active'
      };
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: invalidData
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: type and zone');
    });

    it('should validate required fields - missing zone', async () => {
      const invalidData = {
        type: 'topic',
        content: 'Missing zone'
      };
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: invalidData
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: type and zone');
    });

    it('should handle creation errors', async () => {
      createCard.mockRejectedValue(new Error('Creation failed'));
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: { type: 'topic', zone: 'active' }
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create card');
    });

    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create card');
    });
  });

  describe('PUT /api/cards', () => {
    it('should update a single card', async () => {
      const updateData = {
        id: 'test-card-1',
        content: 'Updated content',
        zone: 'resolved'
      };
      
      const updatedCard = { ...mockCard, ...updateData };
      updateCard.mockResolvedValue(updatedCard);
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'PUT',
        body: updateData
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.content).toBe('Updated content');
      expect(data.zone).toBe('resolved');
      expect(updateCard).toHaveBeenCalledWith('test-card-1', {
        content: 'Updated content',
        zone: 'resolved'
      });
    });

    it('should handle batch updates for multiple cards', async () => {
      const batchUpdate = [
        { id: 'card-1', zone: 'resolved' },
        { id: 'card-2', zone: 'parking' }
      ];
      
      updateMultipleCards.mockResolvedValue(batchUpdate);
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'PUT',
        body: batchUpdate
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(batchUpdate);
      expect(updateMultipleCards).toHaveBeenCalledWith(batchUpdate);
    });

    it('should return 400 when ID is missing for single update', async () => {
      const invalidUpdate = {
        content: 'Missing ID'
      };
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'PUT',
        body: invalidUpdate
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Card ID is required');
    });

    it('should return 404 when card not found for update', async () => {
      updateCard.mockResolvedValue(null);
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'PUT',
        body: { id: 'nonexistent', content: 'Update' }
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Card not found');
    });

    it('should handle update errors', async () => {
      updateCard.mockRejectedValue(new Error('Update failed'));
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'PUT',
        body: { id: 'test-card-1', content: 'Update' }
      });
      
      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update card');
    });
  });

  describe('DELETE /api/cards', () => {
    it('should delete a card successfully', async () => {
      deleteCard.mockResolvedValue(true);
      
      const request = createMockRequest('http://localhost:3000/api/cards?id=test-card-1', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.message).toBe('Card deleted successfully');
      expect(deleteCard).toHaveBeenCalledWith('test-card-1');
    });

    it('should return 400 when ID is missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Card ID is required');
    });

    it('should return 404 when card not found for deletion', async () => {
      deleteCard.mockResolvedValue(false);
      
      const request = createMockRequest('http://localhost:3000/api/cards?id=nonexistent', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Card not found');
    });

    it('should handle deletion errors', async () => {
      deleteCard.mockRejectedValue(new Error('Deletion failed'));
      
      const request = createMockRequest('http://localhost:3000/api/cards?id=test-card-1', {
        method: 'DELETE'
      });
      
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete card');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large payloads efficiently', async () => {
      const largeCardData = {
        type: 'topic',
        zone: 'active',
        content: 'x'.repeat(10000) // 10KB content
      };
      
      createCard.mockResolvedValue({ ...mockCard, ...largeCardData });
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: largeCardData
      });
      
      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it('should handle concurrent batch updates', async () => {
      const largeBatch = Array.from({ length: 100 }, (_, i) => ({
        id: `card-${i}`,
        zone: 'resolved'
      }));
      
      updateMultipleCards.mockResolvedValue(largeBatch);
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'PUT',
        body: largeBatch
      });
      
      const response = await PUT(request);
      expect(response.status).toBe(200);
      expect(updateMultipleCards).toHaveBeenCalledWith(largeBatch);
    });

    it('should sanitize special characters in card content', async () => {
      const specialContent = {
        type: 'topic',
        zone: 'active',
        content: '<script>alert("xss")</script>',
        htmlContent: '&lt;b&gt;Safe HTML&lt;/b&gt;'
      };
      
      createCard.mockResolvedValue({ ...mockCard, ...specialContent });
      
      const request = createMockRequest('http://localhost:3000/api/cards', {
        method: 'POST',
        body: specialContent
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.content).toBe('<script>alert("xss")</script>');
    });
  });
});