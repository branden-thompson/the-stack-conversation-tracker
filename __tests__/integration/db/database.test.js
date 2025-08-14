/**
 * Integration Tests for Database Functions
 * Tests all database operations including file I/O, data persistence, and edge cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock nanoid for predictable IDs in tests
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123')
}));

// Mock LowDB to use in-memory database for tests
let mockDb = { 
  data: { cards: [] },
  read: vi.fn().mockResolvedValue(),
  write: vi.fn().mockResolvedValue()
};

vi.mock('lowdb', () => ({
  Low: vi.fn().mockImplementation(() => mockDb)
}));

vi.mock('lowdb/node', () => ({
  JSONFile: vi.fn()
}));

import { nanoid } from 'nanoid';
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
  type: 'topic',
  content: 'Test card content',
  zone: 'active',
  position: { x: 10, y: 20 },
  stackOrder: 0
};

const expectedCard = {
  id: 'test-id-123',
  type: 'topic',
  content: 'Test card content',
  zone: 'active',
  position: { x: 10, y: 20 },
  stackOrder: 0,
  createdAt: expect.any(String),
  updatedAt: expect.any(String)
};

describe('Database Integration Tests', () => {
  beforeEach(async () => {
    // Reset nanoid mock
    nanoid.mockReturnValue('test-id-123');
    
    // Reset mock database to clean state
    mockDb = { 
      data: { cards: [] },
      read: vi.fn().mockResolvedValue(),
      write: vi.fn().mockResolvedValue()
    };
  });

  describe('Database Initialization', () => {
    it('should return empty array when database is empty', async () => {
      const cards = await getAllCards();
      expect(cards).toEqual([]);
    });

    it('should handle existing data in database', async () => {
      // Pre-populate mock database
      mockDb.data.cards = [
        {
          id: 'existing-1',
          type: 'topic',
          content: 'Existing card',
          zone: 'active',
          position: { x: 0, y: 0 },
          stackOrder: 0,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z'
        }
      ];
      
      const cards = await getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('existing-1');
    });
  });

  describe('getAllCards', () => {
    it('should return empty array when no cards exist', async () => {
      const cards = await getAllCards();
      expect(cards).toEqual([]);
    });

    it('should return all cards when cards exist', async () => {
      // Create a card first
      await createCard(mockCard);
      
      const cards = await getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0]).toMatchObject(expectedCard);
    });

    it('should handle multiple cards', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await createCard({ ...mockCard, content: 'Card 1' });
      await createCard({ ...mockCard, content: 'Card 2' });
      
      const cards = await getAllCards();
      expect(cards).toHaveLength(2);
      expect(cards[0].content).toBe('Card 1');
      expect(cards[1].content).toBe('Card 2');
    });
  });

  describe('getCard', () => {
    it('should return null when card does not exist', async () => {
      const card = await getCard('nonexistent');
      expect(card).toBeNull();
    });

    it('should return card when it exists', async () => {
      await createCard(mockCard);
      
      const card = await getCard('test-id-123');
      expect(card).toMatchObject(expectedCard);
    });

    it('should return correct card when multiple exist', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await createCard({ ...mockCard, content: 'Card 1' });
      await createCard({ ...mockCard, content: 'Card 2' });
      
      const card = await getCard('card-2');
      expect(card.content).toBe('Card 2');
      expect(card.id).toBe('card-2');
    });
  });

  describe('createCard', () => {
    it('should create card with all provided fields', async () => {
      const newCard = await createCard(mockCard);
      
      expect(newCard).toMatchObject(expectedCard);
      expect(new Date(newCard.createdAt)).toBeInstanceOf(Date);
      expect(new Date(newCard.updatedAt)).toBeInstanceOf(Date);
    });

    it('should generate unique ID for each card', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      const card1 = await createCard(mockCard);
      const card2 = await createCard(mockCard);
      
      expect(card1.id).toBe('card-1');
      expect(card2.id).toBe('card-2');
    });

    it('should apply default values for missing fields', async () => {
      const minimalCard = { type: 'topic', zone: 'active' };
      const newCard = await createCard(minimalCard);
      
      expect(newCard.content).toBe('');
      expect(newCard.position).toEqual({ x: 0, y: 0 });
      expect(newCard.stackOrder).toBe(0);
    });

    it('should handle all card types', async () => {
      const cardTypes = ['topic', 'question', 'opinion', 'fact', 'accusation'];
      
      for (let i = 0; i < cardTypes.length; i++) {
        nanoid.mockReturnValueOnce(`card-${i}`);
        const card = await createCard({ ...mockCard, type: cardTypes[i] });
        expect(card.type).toBe(cardTypes[i]);
      }
    });

    it('should handle all zones', async () => {
      const zones = ['active', 'parking', 'resolved', 'unresolved'];
      
      for (let i = 0; i < zones.length; i++) {
        nanoid.mockReturnValueOnce(`card-${i}`);
        const card = await createCard({ ...mockCard, zone: zones[i] });
        expect(card.zone).toBe(zones[i]);
      }
    });

    it('should persist card to database', async () => {
      await createCard(mockCard);
      
      expect(mockDb.data.cards).toHaveLength(1);
      expect(mockDb.data.cards[0]).toMatchObject(expectedCard);
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('updateCard', () => {
    it('should update existing card successfully', async () => {
      await createCard(mockCard);
      
      const updates = {
        content: 'Updated content',
        zone: 'resolved',
        position: { x: 100, y: 200 }
      };
      
      const updatedCard = await updateCard('test-id-123', updates);
      
      expect(updatedCard.content).toBe('Updated content');
      expect(updatedCard.zone).toBe('resolved');
      expect(updatedCard.position).toEqual({ x: 100, y: 200 });
      expect(updatedCard.id).toBe('test-id-123'); // ID should remain unchanged
      expect(new Date(updatedCard.updatedAt)).toBeInstanceOf(Date);
    });

    it('should return null when card does not exist', async () => {
      const result = await updateCard('nonexistent', { content: 'Update' });
      expect(result).toBeNull();
    });

    it('should prevent ID from being changed', async () => {
      await createCard(mockCard);
      
      const updatedCard = await updateCard('test-id-123', {
        id: 'hacker-attempt',
        content: 'Updated'
      });
      
      expect(updatedCard.id).toBe('test-id-123');
    });

    it('should update timestamps', async () => {
      const card = await createCard(mockCard);
      const originalUpdatedAt = card.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updatedCard = await updateCard('test-id-123', { content: 'Updated' });
      
      expect(updatedCard.updatedAt).not.toBe(originalUpdatedAt);
      expect(updatedCard.createdAt).toBe(card.createdAt); // createdAt should not change
    });

    it('should persist updates to database', async () => {
      await createCard(mockCard);
      await updateCard('test-id-123', { content: 'Updated content' });
      
      expect(mockDb.data.cards[0].content).toBe('Updated content');
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('deleteCard', () => {
    it('should delete existing card successfully', async () => {
      await createCard(mockCard);
      
      const result = await deleteCard('test-id-123');
      expect(result).toBe(true);
      
      const cards = await getAllCards();
      expect(cards).toHaveLength(0);
    });

    it('should return false when card does not exist', async () => {
      const result = await deleteCard('nonexistent');
      expect(result).toBe(false);
    });

    it('should only delete specified card when multiple exist', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await createCard({ ...mockCard, content: 'Card 1' });
      await createCard({ ...mockCard, content: 'Card 2' });
      
      const result = await deleteCard('card-1');
      expect(result).toBe(true);
      
      const cards = await getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('card-2');
    });

    it('should persist deletion to database', async () => {
      await createCard(mockCard);
      await deleteCard('test-id-123');
      
      expect(mockDb.data.cards).toHaveLength(0);
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('updateMultipleCards', () => {
    it('should update multiple cards successfully', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await createCard({ ...mockCard, content: 'Card 1' });
      await createCard({ ...mockCard, content: 'Card 2' });
      
      const updates = [
        { id: 'card-1', zone: 'resolved' },
        { id: 'card-2', zone: 'parking' }
      ];
      
      const updatedCards = await updateMultipleCards(updates);
      
      expect(updatedCards).toHaveLength(2);
      expect(updatedCards[0].zone).toBe('resolved');
      expect(updatedCards[1].zone).toBe('parking');
    });

    it('should handle empty updates array', async () => {
      const result = await updateMultipleCards([]);
      expect(result).toEqual([]);
    });

    it('should skip nonexistent cards', async () => {
      nanoid.mockReturnValueOnce('card-1');
      await createCard({ ...mockCard, content: 'Card 1' });
      
      const updates = [
        { id: 'card-1', zone: 'resolved' },
        { id: 'nonexistent', zone: 'parking' }
      ];
      
      const updatedCards = await updateMultipleCards(updates);
      
      expect(updatedCards).toHaveLength(1);
      expect(updatedCards[0].id).toBe('card-1');
    });

    it('should preserve IDs and update timestamps', async () => {
      nanoid.mockReturnValueOnce('card-1');
      const originalCard = await createCard(mockCard);
      
      const updates = [{ id: 'card-1', id: 'hacker-attempt', content: 'Updated' }];
      const updatedCards = await updateMultipleCards(updates);
      
      expect(updatedCards[0].id).toBe('card-1');
      expect(updatedCards[0].updatedAt).not.toBe(originalCard.updatedAt);
    });

    it('should persist all updates to database', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await createCard({ ...mockCard, content: 'Card 1' });
      await createCard({ ...mockCard, content: 'Card 2' });
      
      const updates = [
        { id: 'card-1', zone: 'resolved' },
        { id: 'card-2', zone: 'parking' }
      ];
      
      await updateMultipleCards(updates);
      
      expect(mockDb.data.cards[0].zone).toBe('resolved');
      expect(mockDb.data.cards[1].zone).toBe('parking');
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('Data Integrity and Edge Cases', () => {
    it('should handle special characters in content', async () => {
      const specialContent = {
        ...mockCard,
        content: 'Special chars: <script>alert("xss")</script> & emoji 🎉 \n newlines'
      };
      
      const card = await createCard(specialContent);
      expect(card.content).toBe(specialContent.content);
      
      const retrieved = await getCard(card.id);
      expect(retrieved.content).toBe(specialContent.content);
    });

    it('should handle large content', async () => {
      const largeContent = {
        ...mockCard,
        content: 'x'.repeat(100000) // 100KB content
      };
      
      const card = await createCard(largeContent);
      expect(card.content).toHaveLength(100000);
    });

    it('should handle concurrent operations', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      // Create multiple cards concurrently
      const promises = [
        createCard({ ...mockCard, content: 'Card 1' }),
        createCard({ ...mockCard, content: 'Card 2' })
      ];
      
      const cards = await Promise.all(promises);
      
      expect(cards).toHaveLength(2);
      expect(cards[0].content).toBe('Card 1');
      expect(cards[1].content).toBe('Card 2');
      
      const allCards = await getAllCards();
      expect(allCards).toHaveLength(2);
    });

    it('should maintain data consistency after multiple operations', async () => {
      nanoid.mockReturnValueOnce('card-1');
      
      // Create, update, and verify
      await createCard(mockCard);
      await updateCard('card-1', { content: 'Updated' });
      
      const card = await getCard('card-1');
      expect(card.content).toBe('Updated');
      
      // Create another, delete first, verify
      nanoid.mockReturnValueOnce('card-2');
      await createCard({ ...mockCard, content: 'Card 2' });
      await deleteCard('card-1');
      
      const allCards = await getAllCards();
      expect(allCards).toHaveLength(1);
      expect(allCards[0].id).toBe('card-2');
    });
  });
});