import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the database
const mockCards = new Map();
const mockConversations = new Map();

vi.mock('@/lib/db/database', () => ({
  getCard: vi.fn((id) => mockCards.get(id)),
  updateCard: vi.fn((id, updates) => {
    const card = mockCards.get(id);
    if (!card) return null;
    const updated = { ...card, ...updates, updatedAt: new Date().toISOString() };
    mockCards.set(id, updated);
    return updated;
  }),
  getConversation: vi.fn((id) => mockConversations.get(id)),
  addConversationEvent: vi.fn((conversationId, event) => {
    const convo = mockConversations.get(conversationId);
    if (!convo) return null;
    convo.events = convo.events || [];
    convo.events.push(event);
    return convo;
  }),
}));

// Import mocked functions
import { getCard, updateCard, getConversation, addConversationEvent } from '@/lib/db/database';

// Import after mocking
const { PATCH } = await import('@/app/api/cards/flip/route');

describe('Card Flip API Integration Tests', () => {
  const mockCard = {
    id: 'card-1',
    type: 'question',
    content: 'Test question',
    faceUp: true,
    zone: 'active',
    createdAt: '2025-08-16T10:00:00Z',
    updatedAt: '2025-08-16T10:00:00Z',
  };

  const mockConversation = {
    id: 'convo-1',
    status: 'active',
    events: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCards.clear();
    mockConversations.clear();
    mockCards.set(mockCard.id, mockCard);
    mockConversations.set(mockConversation.id, mockConversation);
  });

  describe('Successful flip operations', () => {
    it('flips card from face up to face down', async () => {
      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'card-1',
          flipTo: 'faceDown',
          flippedBy: 'user',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.card.faceUp).toBe(false);
      expect(updateCard).toHaveBeenCalledWith('card-1', { faceUp: false });
    });

    it('flips card from face down to face up', async () => {
      // Set initial state to face down
      mockCards.set(mockCard.id, { ...mockCard, faceUp: false });

      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'card-1',
          flipTo: 'faceUp',
          flippedBy: 'user',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.card.faceUp).toBe(true);
    });

    it('logs flip event to conversation when conversationId provided', async () => {
      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'card-1',
          flipTo: 'faceDown',
          flippedBy: 'user',
          conversationId: 'convo-1',
        }),
      });

      const response = await PATCH(request);
      
      expect(response.status).toBe(200);
      expect(addConversationEvent).toHaveBeenCalledWith(
        'convo-1',
        expect.objectContaining({
          type: 'card.flipped',
          payload: expect.objectContaining({
            cardId: 'card-1',
            flipTo: 'faceDown',
            flippedBy: 'user',
          }),
        })
      );
    });

    it('handles system-initiated flips', async () => {
      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'card-1',
          flipTo: 'faceDown',
          flippedBy: 'system',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.card.faceUp).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('returns 400 for missing card ID', async () => {
      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flipTo: 'faceDown',
          flippedBy: 'user',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Card ID is required');
    });

    it('returns 400 for invalid flipTo value', async () => {
      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'card-1',
          flipTo: 'invalid',
          flippedBy: 'user',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid flipTo value. Must be "faceUp" or "faceDown"');
    });

    it('returns 404 for non-existent card', async () => {
      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'non-existent',
          flipTo: 'faceDown',
          flippedBy: 'user',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Card not found');
    });

    it('handles malformed JSON gracefully', async () => {
      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request');
    });

    it('continues without error when conversation not found', async () => {
      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'card-1',
          flipTo: 'faceDown',
          flippedBy: 'user',
          conversationId: 'non-existent-convo',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.card.faceUp).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('handles rapid consecutive flips', async () => {
      const flipRequests = [
        { flipTo: 'faceDown' },
        { flipTo: 'faceUp' },
        { flipTo: 'faceDown' },
      ];

      for (const flip of flipRequests) {
        const request = new Request('http://localhost:3000/api/cards/flip', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 'card-1',
            ...flip,
            flippedBy: 'user',
          }),
        });

        const response = await PATCH(request);
        expect(response.status).toBe(200);
      }

      expect(updateCard).toHaveBeenCalledTimes(3);
    });

    it('preserves other card properties during flip', async () => {
      const fullCard = {
        ...mockCard,
        assignedToUserId: 'user-1',
        position: { x: 100, y: 200 },
        stackOrder: 2,
      };
      mockCards.set(fullCard.id, fullCard);

      const request = new Request('http://localhost:3000/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'card-1',
          flipTo: 'faceDown',
          flippedBy: 'user',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.card.assignedToUserId).toBe('user-1');
      expect(data.card.position).toEqual({ x: 100, y: 200 });
      expect(data.card.stackOrder).toBe(2);
    });
  });
});