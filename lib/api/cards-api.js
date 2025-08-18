/**
 * Cards API Functions
 * 
 * Centralized API functions for card operations.
 * Used by both React Query hooks and legacy hooks.
 */

import { API_ENDPOINTS } from '@/lib/utils/constants';

/**
 * Fetch all cards from the API
 */
export async function fetchCards() {
  const response = await fetch(API_ENDPOINTS.cards);
  if (!response.ok) throw new Error('Failed to fetch cards');
  return response.json();
}

/**
 * Create a new card
 */
export async function createCard(cardData) {
  const response = await fetch(API_ENDPOINTS.cards, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData)
  });
  
  if (!response.ok) throw new Error('Failed to create card');
  return response.json();
}

/**
 * Update a single card
 */
export async function updateCard({ id, ...updates }) {
  const response = await fetch(API_ENDPOINTS.cards, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates })
  });
  
  if (!response.ok) throw new Error('Failed to update card');
  return response.json();
}

/**
 * Update multiple cards at once
 */
export async function updateMultipleCards(updates) {
  const response = await fetch(API_ENDPOINTS.cards, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) throw new Error('Failed to update cards');
  return response.json();
}

/**
 * Delete a card
 */
export async function deleteCard(id) {
  const response = await fetch(`${API_ENDPOINTS.cards}?id=${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete card');
  return response.json();
}

/**
 * Move a card to a different zone
 */
export async function moveCard(cardId, newZone, position = null) {
  const updates = { 
    id: cardId,
    zone: newZone,
    stackOrder: 0 // Reset stack order when moving
  };
  
  if (position) {
    updates.position = position;
  } else {
    // Default position for new cards in zone
    updates.position = { x: 10, y: 50 };
  }
  
  return updateCard(updates);
}

/**
 * Stack cards (update their stack order)
 */
export async function stackCards(cardIds) {
  const updates = cardIds.map((id, index) => ({
    id,
    stackOrder: index
  }));
  return updateMultipleCards(updates);
}