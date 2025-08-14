/**
 * useCardOperations Hook
 * 
 * Centralized card operations with conversation event logging.
 * Handles card creation, updates, and deletion while emitting events to Dev Page.
 * 
 * Features:
 * - Card CRUD operations with event emissions
 * - Automatic conversation event logging
 * - Smart event detection (content changes vs moves)
 * - Consistent payload building
 * - All events flow to Dev Page for monitoring
 */

import { useCallback } from 'react';
import { useCards } from './useCards';
import { useConversationControls } from './useConversationControls';

// Build payload for new cards
function buildNewCardPayload(type) {
  const now = Date.now();
  return {
    type,
    content: '',
    zone: 'active',
    position: { x: 10, y: 60 },
    stackOrder: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
    person: 'system',
  };
}

export function useCardOperations() {
  // Get card CRUD operations
  const { cards, createCard, updateCard, deleteCard } = useCards();
  
  // Get conversation controls for event logging
  const { conversationApi } = useConversationControls();

  // Create card with event emission
  const handleCreate = useCallback(async (type) => {
    const payload = buildNewCardPayload(type);
    const newCard = await createCard(payload);
    
    try {
      if (conversationApi.activeId) {
        await conversationApi.logEvent(conversationApi.activeId, 'card.created', {
          id: newCard?.id,
          type: newCard?.type,
          zone: newCard?.zone,
        });
      }
    } catch {}
    
    return newCard;
  }, [createCard, conversationApi]);

  // Delete card with event emission
  const handleDelete = useCallback(async (id) => {
    await deleteCard(id);
    
    try {
      if (conversationApi.activeId) {
        await conversationApi.logEvent(conversationApi.activeId, 'card.deleted', { 
          id
        });
      }
    } catch {}
  }, [deleteCard, conversationApi]);

  // Update card with smart event emission
  const wrappedUpdateCard = useCallback(async (id, updates) => {
    const updated = await updateCard(id, updates);
    
    try {
      if (!conversationApi.activeId) return updated;

      // If content changed
      if (updates && Object.prototype.hasOwnProperty.call(updates, 'content')) {
        await conversationApi.logEvent(conversationApi.activeId, 'card.updated', { 
          id, 
          fields: ['content'] 
        });
      }
      
      // If zone changed (move)
      if (updates && updates.zone) {
        await conversationApi.logEvent(conversationApi.activeId, 'card.moved', {
          id,
          to: updates.zone,
        });
      }
    } catch {}
    
    return updated;
  }, [updateCard, conversationApi]);

  // Create card with custom data (for dialogs)
  const createCardWithData = useCallback(async (data) => {
    const person = (data?.person && data.person.trim()) ? data.person.trim() : 'system';
    const type = data?.type || 'topic';
    const payload = {
      type,
      content: data?.content || '',
      zone: 'active',
      position: { x: 10, y: 60 },
      stackOrder: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'system',
      person,
    };
    
    const newCard = await createCard(payload);
    
    try {
      if (conversationApi.activeId) {
        await conversationApi.logEvent(conversationApi.activeId, 'card.created', {
          id: newCard?.id,
          type: newCard?.type,
          zone: newCard?.zone,
        });
      }
    } catch {}
    
    return newCard;
  }, [createCard, conversationApi]);

  return {
    // Core operations
    handleCreate,
    handleDelete,
    wrappedUpdateCard,
    createCardWithData,
    
    // Utility
    buildNewCardPayload,
  };
}