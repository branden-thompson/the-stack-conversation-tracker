/**
 * Custom hook for managing conversation cards
 * Provides all card operations and state management
 */

import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '@/lib/utils/constants';

export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all cards from the API
   */
  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.cards);
      if (!response.ok) throw new Error('Failed to fetch cards');
      const data = await response.json();
      setCards(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new card
   * @param {Object} cardData - Card data including type, content, zone
   * @returns {Promise<Object>} The created card
   */
  const createCard = useCallback(async (cardData) => {
    try {
      const response = await fetch(API_ENDPOINTS.cards, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
      
      if (!response.ok) throw new Error('Failed to create card');
      
      const newCard = await response.json();
      setCards(prev => [...prev, newCard]);
      return newCard;
    } catch (err) {
      console.error('Error creating card:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Update a single card
   * @param {string} id - Card ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} The updated card
   */
  const updateCard = useCallback(async (id, updates) => {
    try {
      const response = await fetch(API_ENDPOINTS.cards, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      
      if (!response.ok) throw new Error('Failed to update card');
      
      const updatedCard = await response.json();
      setCards(prev => prev.map(card => 
        card.id === id ? updatedCard : card
      ));
      return updatedCard;
    } catch (err) {
      console.error('Error updating card:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Update multiple cards at once
   * @param {Array} updates - Array of card updates
   * @returns {Promise<Array>} The updated cards
   */
  const updateMultipleCards = useCallback(async (updates) => {
    try {
      const response = await fetch(API_ENDPOINTS.cards, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update cards');
      
      const updatedCards = await response.json();
      
      // Update local state with all updated cards
      setCards(prev => {
        const updatedMap = new Map(updatedCards.map(card => [card.id, card]));
        return prev.map(card => updatedMap.get(card.id) || card);
      });
      
      return updatedCards;
    } catch (err) {
      console.error('Error updating multiple cards:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Delete a card
   * @param {string} id - Card ID to delete
   */
  const deleteCard = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.cards}?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete card');
      
      setCards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      console.error('Error deleting card:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Move a card to a different zone
   * @param {string} cardId - Card ID
   * @param {string} newZone - Target zone ID
   * @param {Object} position - New position {x, y}
   */
  const moveCard = useCallback(async (cardId, newZone, position = null) => {
    const updates = { zone: newZone };
    if (position) {
      updates.position = position;
    } else {
      // Default position for new cards in zone
      updates.position = { x: 10, y: 50 };
    }
    updates.stackOrder = 0; // Reset stack order when moving
    return updateCard(cardId, updates);
  }, [updateCard]);

  /**
   * Get cards organized by zone
   * @returns {Object} Cards grouped by zone
   */
  const getCardsByZone = useCallback(() => {
    return cards.reduce((acc, card) => {
      if (!acc[card.zone]) {
        acc[card.zone] = [];
      }
      acc[card.zone].push(card);
      return acc;
    }, {});
  }, [cards]);

  /**
   * Stack cards (update their stack order)
   * @param {Array} cardIds - Array of card IDs in stack order
   */
  const stackCards = useCallback(async (cardIds) => {
    const updates = cardIds.map((id, index) => ({
      id,
      stackOrder: index
    }));
    return updateMultipleCards(updates);
  }, [updateMultipleCards]);

  // Load cards on mount
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    updateMultipleCards,
    deleteCard,
    moveCard,
    getCardsByZone,
    stackCards,
    refreshCards: fetchCards
  };
}