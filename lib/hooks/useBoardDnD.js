/**
 * useBoardDnD Hook
 * 
 * Centralized drag-and-drop logic for the conversation board.
 * Handles card dragging, zone drops, auto-stacking, and collision detection.
 * 
 * Features:
 * - Custom collision detection (card-to-card vs zone drops)
 * - Auto-stacking logic (30px threshold)
 * - Zone-based drops with position calculation
 * - Card-to-card stacking
 * - Drag state management
 */

import { useState, useCallback } from 'react';
import { pointerWithin, rectIntersection } from '@dnd-kit/core';
import { ZONES } from '@/lib/utils/constants';

export function useBoardDnD({ cards, onUpdateCard, getCardsByZone }) {
  const [activeCard, setActiveCard] = useState(null);
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  // Get cardsByZone for stacking logic
  const cardsByZone = getCardsByZone();

  // DnD handlers
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    setActiveCard(card || null);
    setIsDraggingCard(true);
  }, [cards]);

  const handleDragEnd = useCallback(async (event) => {
    const { active, over, delta } = event;
    setActiveCard(null);
    setIsDraggingCard(false);
    if (!active) return;

    const draggedCard = cards.find((c) => c.id === active.id);
    if (!draggedCard) return;

    if (over && ZONES[over.id]) {
      const dropPosition = {
        x: Math.max(10, (draggedCard.position?.x || 10) + delta.x),
        y: Math.max(60, (draggedCard.position?.y || 60) + delta.y),
      };
      const targetZoneCards = (cardsByZone[over.id] || []).filter((c) => c.type === draggedCard.type);
      const threshold = 30;
      let stackTarget = null;
      for (const card of targetZoneCards) {
        if (card.id === draggedCard.id) continue;
        const cardX = card.position?.x || 10;
        const cardY = card.position?.y || 60;
        if (Math.abs(dropPosition.x - cardX) < threshold && Math.abs(dropPosition.y - cardY) < threshold) {
          stackTarget = card;
          break;
        }
      }
      if (stackTarget) {
        await onUpdateCard(active.id, {
          zone: over.id,
          position: stackTarget.position,
          stackOrder: (stackTarget.stackOrder || 0) + 1,
        });
      } else {
        await onUpdateCard(active.id, {
          zone: over.id,
          position: dropPosition,
          stackOrder: 0,
        });
      }
    } else if (over?.data?.current?.type === 'card') {
      const targetCard = cards.find((c) => c.id === over.id);
      if (targetCard && targetCard.id !== draggedCard.id && targetCard.type === draggedCard.type) {
        await onUpdateCard(active.id, {
          zone: targetCard.zone,
          position: targetCard.position,
          stackOrder: (targetCard.stackOrder || 0) + 1,
        });
      }
    } else {
      const currentPosition = draggedCard.position || { x: 10, y: 60 };
      const newPosition = {
        x: Math.max(10, currentPosition.x + delta.x),
        y: Math.max(60, currentPosition.y + delta.y),
      };
      await onUpdateCard(active.id, { position: newPosition });
    }
  }, [cards, cardsByZone, onUpdateCard]);

  const collisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    const cardCollision = pointerCollisions.find(
      (collision) => collision.data?.droppableContainer?.data?.current?.type === 'card'
    );
    if (cardCollision) return [cardCollision];
    return rectIntersection(args);
  }, []);

  return {
    // State
    activeCard,
    isDraggingCard,
    
    // DnD Context props
    contextProps: {
      collisionDetection,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}