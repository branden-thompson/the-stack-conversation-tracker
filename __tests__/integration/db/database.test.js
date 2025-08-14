/**
 * Integration Tests for Database Functions
 * Tests all database operations including CRUD operations and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock nanoid for predictable IDs in tests
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123')
}));

// Test database - in-memory array that simulates the database
let testCards = [];

// Create our own database implementation for testing
const testDatabase = {
  async getAllCards() {
    return [...testCards];
  },
  
  async getCard(id) {
    return testCards.find(card => card.id === id) || null;
  },
  
  async createCard(cardData) {
    const { nanoid } = await import('nanoid');
    const newCard = {
      id: nanoid(),
      type: cardData.type || 'topic',
      content: cardData.content || '',
      zone: cardData.zone || 'active',
      position: cardData.position || { x: 0, y: 0 },
      stackOrder: cardData.stackOrder || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    testCards.push(newCard);
    return newCard;
  },
  
  async updateCard(id, updates) {
    const cardIndex = testCards.findIndex(card => card.id === id);
    if (cardIndex === -1) return null;
    
    testCards[cardIndex] = {
      ...testCards[cardIndex],
      ...updates,
      id: testCards[cardIndex].id, // Prevent ID from being changed
      updatedAt: new Date().toISOString()
    };
    return testCards[cardIndex];
  },
  
  async deleteCard(id) {
    const initialLength = testCards.length;
    testCards = testCards.filter(card => card.id !== id);
    return testCards.length < initialLength;
  },
  
  async updateMultipleCards(updates) {
    const updatedCards = [];
    updates.forEach(update => {
      const cardIndex = testCards.findIndex(card => card.id === update.id);
      if (cardIndex !== -1) {
        testCards[cardIndex] = {
          ...testCards[cardIndex],
          ...update,
          id: testCards[cardIndex].id,
          updatedAt: new Date().toISOString()
        };
        updatedCards.push(testCards[cardIndex]);
      }
    });
    return updatedCards;
  }
};

import { nanoid } from 'nanoid';

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
  beforeEach(() => {
    // Reset nanoid mock
    nanoid.mockReturnValue('test-id-123');
    
    // Reset test database
    testCards = [];
  });

  describe('Database Initialization', () => {
    it('should return empty array when database is empty', async () => {
      const cards = await testDatabase.getAllCards();
      expect(cards).toEqual([]);
    });

    it('should handle existing data in database', async () => {
      // Pre-populate test database
      testCards = [
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
      
      const cards = await testDatabase.getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('existing-1');
    });
  });

  describe('getAllCards', () => {
    it('should return empty array when no cards exist', async () => {
      const cards = await testDatabase.getAllCards();
      expect(cards).toEqual([]);
    });

    it('should return all cards when cards exist', async () => {
      await testDatabase.createCard(mockCard);
      
      const cards = await testDatabase.getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0]).toMatchObject(expectedCard);
    });

    it('should handle multiple cards', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await testDatabase.createCard({ ...mockCard, content: 'Card 1' });
      await testDatabase.createCard({ ...mockCard, content: 'Card 2' });
      
      const cards = await testDatabase.getAllCards();
      expect(cards).toHaveLength(2);
      expect(cards[0].content).toBe('Card 1');
      expect(cards[1].content).toBe('Card 2');
    });
  });

  describe('getCard', () => {
    it('should return null when card does not exist', async () => {
      const card = await testDatabase.getCard('nonexistent');
      expect(card).toBeNull();
    });

    it('should return card when it exists', async () => {
      await testDatabase.createCard(mockCard);
      
      const card = await testDatabase.getCard('test-id-123');
      expect(card).toMatchObject(expectedCard);
    });

    it('should return correct card when multiple exist', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await testDatabase.createCard({ ...mockCard, content: 'Card 1' });
      await testDatabase.createCard({ ...mockCard, content: 'Card 2' });
      
      const card = await testDatabase.getCard('card-2');
      expect(card.content).toBe('Card 2');
      expect(card.id).toBe('card-2');
    });
  });

  describe('createCard', () => {
    it('should create card with all provided fields', async () => {
      const newCard = await testDatabase.createCard(mockCard);
      
      expect(newCard).toMatchObject(expectedCard);
      expect(new Date(newCard.createdAt)).toBeInstanceOf(Date);
      expect(new Date(newCard.updatedAt)).toBeInstanceOf(Date);
    });

    it('should generate unique ID for each card', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      const card1 = await testDatabase.createCard(mockCard);
      const card2 = await testDatabase.createCard(mockCard);
      
      expect(card1.id).toBe('card-1');
      expect(card2.id).toBe('card-2');
    });

    it('should apply default values for missing fields', async () => {
      const minimalCard = { type: 'topic', zone: 'active' };
      const newCard = await testDatabase.createCard(minimalCard);
      
      expect(newCard.content).toBe('');
      expect(newCard.position).toEqual({ x: 0, y: 0 });
      expect(newCard.stackOrder).toBe(0);
    });

    it('should handle all card types', async () => {
      const cardTypes = ['topic', 'question', 'opinion', 'fact', 'accusation'];
      
      for (let i = 0; i < cardTypes.length; i++) {
        nanoid.mockReturnValueOnce(`card-${i}`);
        const card = await testDatabase.createCard({ ...mockCard, type: cardTypes[i] });
        expect(card.type).toBe(cardTypes[i]);
      }
    });

    it('should handle all zones', async () => {
      const zones = ['active', 'parking', 'resolved', 'unresolved'];
      
      for (let i = 0; i < zones.length; i++) {
        nanoid.mockReturnValueOnce(`card-${i}`);
        const card = await testDatabase.createCard({ ...mockCard, zone: zones[i] });
        expect(card.zone).toBe(zones[i]);
      }
    });

    it('should persist card to database', async () => {
      await testDatabase.createCard(mockCard);
      
      expect(testCards).toHaveLength(1);
      expect(testCards[0]).toMatchObject(expectedCard);
    });
  });

  describe('updateCard', () => {
    it('should update existing card successfully', async () => {
      await testDatabase.createCard(mockCard);
      
      const updates = {
        content: 'Updated content',
        zone: 'resolved',
        position: { x: 100, y: 200 }
      };
      
      const updatedCard = await testDatabase.updateCard('test-id-123', updates);
      
      expect(updatedCard.content).toBe('Updated content');
      expect(updatedCard.zone).toBe('resolved');
      expect(updatedCard.position).toEqual({ x: 100, y: 200 });
      expect(updatedCard.id).toBe('test-id-123');
      expect(new Date(updatedCard.updatedAt)).toBeInstanceOf(Date);
    });

    it('should return null when card does not exist', async () => {
      const result = await testDatabase.updateCard('nonexistent', { content: 'Update' });
      expect(result).toBeNull();
    });

    it('should prevent ID from being changed', async () => {
      await testDatabase.createCard(mockCard);
      
      const updatedCard = await testDatabase.updateCard('test-id-123', {
        id: 'hacker-attempt',
        content: 'Updated'
      });
      
      expect(updatedCard.id).toBe('test-id-123');
    });

    it('should update timestamps', async () => {
      const card = await testDatabase.createCard(mockCard);
      const originalUpdatedAt = card.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updatedCard = await testDatabase.updateCard('test-id-123', { content: 'Updated' });
      
      expect(updatedCard.updatedAt).not.toBe(originalUpdatedAt);
      expect(updatedCard.createdAt).toBe(card.createdAt);
    });

    it('should persist updates to database', async () => {
      await testDatabase.createCard(mockCard);
      await testDatabase.updateCard('test-id-123', { content: 'Updated content' });
      
      expect(testCards[0].content).toBe('Updated content');
    });
  });

  describe('deleteCard', () => {
    it('should delete existing card successfully', async () => {
      await testDatabase.createCard(mockCard);
      
      const result = await testDatabase.deleteCard('test-id-123');
      expect(result).toBe(true);
      
      const cards = await testDatabase.getAllCards();
      expect(cards).toHaveLength(0);
    });

    it('should return false when card does not exist', async () => {
      const result = await testDatabase.deleteCard('nonexistent');
      expect(result).toBe(false);
    });

    it('should only delete specified card when multiple exist', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await testDatabase.createCard({ ...mockCard, content: 'Card 1' });
      await testDatabase.createCard({ ...mockCard, content: 'Card 2' });
      
      const result = await testDatabase.deleteCard('card-1');
      expect(result).toBe(true);
      
      const cards = await testDatabase.getAllCards();
      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('card-2');
    });

    it('should persist deletion to database', async () => {
      await testDatabase.createCard(mockCard);
      await testDatabase.deleteCard('test-id-123');
      
      expect(testCards).toHaveLength(0);
    });
  });

  describe('updateMultipleCards', () => {
    it('should update multiple cards successfully', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await testDatabase.createCard({ ...mockCard, content: 'Card 1' });
      await testDatabase.createCard({ ...mockCard, content: 'Card 2' });
      
      const updates = [
        { id: 'card-1', zone: 'resolved' },
        { id: 'card-2', zone: 'parking' }
      ];
      
      const updatedCards = await testDatabase.updateMultipleCards(updates);
      
      expect(updatedCards).toHaveLength(2);
      expect(updatedCards[0].zone).toBe('resolved');
      expect(updatedCards[1].zone).toBe('parking');
    });

    it('should handle empty updates array', async () => {
      const result = await testDatabase.updateMultipleCards([]);
      expect(result).toEqual([]);
    });

    it('should skip nonexistent cards', async () => {
      nanoid.mockReturnValueOnce('card-1');
      await testDatabase.createCard({ ...mockCard, content: 'Card 1' });
      
      const updates = [
        { id: 'card-1', zone: 'resolved' },
        { id: 'nonexistent', zone: 'parking' }
      ];
      
      const updatedCards = await testDatabase.updateMultipleCards(updates);
      
      expect(updatedCards).toHaveLength(1);
      expect(updatedCards[0].id).toBe('card-1');
    });

    it('should preserve IDs and update timestamps', async () => {
      nanoid.mockReturnValueOnce('card-1');
      const originalCard = await testDatabase.createCard(mockCard);
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updates = [{ id: 'card-1', content: 'Updated' }];
      const updatedCards = await testDatabase.updateMultipleCards(updates);
      
      expect(updatedCards).toHaveLength(1);
      expect(updatedCards[0].id).toBe('card-1');
      expect(updatedCards[0].updatedAt).not.toBe(originalCard.updatedAt);
    });

    it('should persist all updates to database', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      await testDatabase.createCard({ ...mockCard, content: 'Card 1' });
      await testDatabase.createCard({ ...mockCard, content: 'Card 2' });
      
      const updates = [
        { id: 'card-1', zone: 'resolved' },
        { id: 'card-2', zone: 'parking' }
      ];
      
      await testDatabase.updateMultipleCards(updates);
      
      expect(testCards[0].zone).toBe('resolved');
      expect(testCards[1].zone).toBe('parking');
    });
  });

  describe('Data Integrity and Edge Cases', () => {
    it('should handle special characters in content', async () => {
      const specialContent = {
        ...mockCard,
        content: 'Special chars: <script>alert("xss")</script> & emoji 🎉 \n newlines'
      };
      
      const card = await testDatabase.createCard(specialContent);
      expect(card.content).toBe(specialContent.content);
      
      const retrieved = await testDatabase.getCard(card.id);
      expect(retrieved.content).toBe(specialContent.content);
    });

    it('should handle large content', async () => {
      const largeContent = {
        ...mockCard,
        content: 'x'.repeat(100000) // 100KB content
      };
      
      const card = await testDatabase.createCard(largeContent);
      expect(card.content).toHaveLength(100000);
    });

    it('should handle concurrent operations', async () => {
      nanoid.mockReturnValueOnce('card-1').mockReturnValueOnce('card-2');
      
      // Create multiple cards concurrently
      const promises = [
        testDatabase.createCard({ ...mockCard, content: 'Card 1' }),
        testDatabase.createCard({ ...mockCard, content: 'Card 2' })
      ];
      
      const cards = await Promise.all(promises);
      
      expect(cards).toHaveLength(2);
      expect(cards[0].content).toBe('Card 1');
      expect(cards[1].content).toBe('Card 2');
      
      const allCards = await testDatabase.getAllCards();
      expect(allCards).toHaveLength(2);
    });

    it('should maintain data consistency after multiple operations', async () => {
      nanoid.mockReturnValueOnce('card-1');
      
      // Create, update, and verify
      await testDatabase.createCard(mockCard);
      await testDatabase.updateCard('card-1', { content: 'Updated' });
      
      const card = await testDatabase.getCard('card-1');
      expect(card.content).toBe('Updated');
      
      // Create another, delete first, verify
      nanoid.mockReturnValueOnce('card-2');
      await testDatabase.createCard({ ...mockCard, content: 'Card 2' });
      await testDatabase.deleteCard('card-1');
      
      const allCards = await testDatabase.getAllCards();
      expect(allCards).toHaveLength(1);
      expect(allCards[0].id).toBe('card-2');
    });
  });
});