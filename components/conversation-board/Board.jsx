/**
 * Board Component (LK.G + Left Tray + Conversation Controls + Conversations API wiring)
 */

'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { DndContext, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoardCanvas } from './BoardCanvas';
import { CardDialog } from './CardDialog';
import { HelpDialog } from './HelpDialog';
import { useCards } from '@/lib/hooks/useCards';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useConversationControls } from '@/lib/hooks/useConversationControls';
import { ZONES, CARD_TYPES } from '@/lib/utils/constants';
import { LeftTray } from '@/components/ui/left-tray';
import { AppHeader } from '@/components/ui/app-header';

const DEFAULT_LAYOUT = {
  rows: { top: 70, bottom: 30 },
  topRowCols: { active: 70, parking: 30 },
  bottomRowCols: { resolved: 50, unresolved: 50 },
};


function resolveCardType(aliases, fallback) {
  if (CARD_TYPES && typeof CARD_TYPES === 'object') {
    for (const key of aliases) {
      if (Object.prototype.hasOwnProperty.call(CARD_TYPES, key)) return key;
    }
  }
  return fallback;
}

const TYPE_KEYS = {
  topic: resolveCardType(['topic', 'conversation', 'conversation_topic'], 'topic'),
  question: resolveCardType(['question', 'open_question', 'open-question'], 'question'),
  accusation: resolveCardType(['accusation', 'claim', 'allegation'], 'accusation'),
  fact: resolveCardType(['fact', 'factual', 'factual_statement', 'objective_fact'], 'fact'),
  guess: resolveCardType(['guess'], 'guess'),
  opinion: resolveCardType(['opinion'], 'opinion'),
};

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


function BoardInner({
  cards,
  loading,
  error,
  createCard,
  updateCard,
  deleteCard,
  getCardsByZone,
  refreshCards,
}) {
  const [activeCard, setActiveCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  // Conversation controls and state
  const conversationControls = useConversationControls();
  const { activeConversation, runtime, onStart, onPause, onResumeOrStart, onStop, conversationApi: conv } = conversationControls;

  // Left tray
  const [trayOpen, setTrayOpen] = useState(false);

  const resetLayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);

  useKeyboardShortcuts({
    onNewTopic: () => handleCreate(TYPE_KEYS.topic),        // ctrl+n
    onNewQuestion: () => handleCreate(TYPE_KEYS.question),  // ctrl+q
    onNewAccusation: () => handleCreate(TYPE_KEYS.accusation), // ctrl+a
    onNewFact: () => handleCreate(TYPE_KEYS.fact),          // ctrl+f
    onNewOpinion: () => handleCreate(TYPE_KEYS.opinion),    // ctrl+o
    onNewGuess: () => handleCreate(TYPE_KEYS.guess),        // ctrl+g
    onDeleteSelected: selectedCard ? () => handleDelete(selectedCard) : null,
    onResetLayout: resetLayout,
    onDeselect: () => setSelectedCard(null),
    selectedCard,
  });


  const cardsByZone = getCardsByZone();

  // ---- Card helpers that also emit conversation events ----
  async function handleCreate(type) {
    const payload = buildNewCardPayload(type);
    const newCard = await createCard(payload);
    try {
      if (conv.activeId) {
        await conv.logEvent(conv.activeId, 'card.created', {
          id: newCard?.id,
          type: newCard?.type,
          zone: newCard?.zone,
        });
      }
    } catch {}
  }

  async function handleDelete(id) {
    const card = cards.find(c => c.id === id);
    await deleteCard(id);
    try {
      if (conv.activeId) {
        await conv.logEvent(conv.activeId, 'card.deleted', { id, zone: card?.zone });
      }
    } catch {}
  }

  const wrappedUpdateCard = async (id, updates) => {
    const before = cards.find(c => c.id === id);
    const updated = await updateCard(id, updates);
    try {
      if (!conv.activeId) return updated;

      // If content changed
      if (updates && Object.prototype.hasOwnProperty.call(updates, 'content')) {
        await conv.logEvent(conv.activeId, 'card.updated', { id, fields: ['content'] });
      }
      // If zone changed (move)
      if (before && updates && updates.zone && updates.zone !== before.zone) {
        await conv.logEvent(conv.activeId, 'card.moved', {
          id,
          from: before.zone,
          to: updates.zone,
        });
      }
    } catch {}
    return updated;
  };

  // DnD handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    setActiveCard(card || null);
    setIsDraggingCard(true);
  };

  const handleDragEnd = async (event) => {
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
        await wrappedUpdateCard(active.id, {
          zone: over.id,
          position: stackTarget.position,
          stackOrder: (stackTarget.stackOrder || 0) + 1,
        });
      } else {
        await wrappedUpdateCard(active.id, {
          zone: over.id,
          position: dropPosition,
          stackOrder: 0,
        });
      }
    } else if (over?.data?.current?.type === 'card') {
      const targetCard = cards.find((c) => c.id === over.id);
      if (targetCard && targetCard.id !== draggedCard.id && targetCard.type === draggedCard.type) {
        await wrappedUpdateCard(active.id, {
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
      await wrappedUpdateCard(active.id, { position: newPosition });
    }
  };

  const collisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    const cardCollision = pointerCollisions.find(
      (collision) => collision.data?.droppableContainer?.data?.current?.type === 'card'
    );
    if (cardCollision) return [cardCollision];
    return rectIntersection(args);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-600 dark:text-gray-300" />
          <p className="text-gray-600 dark:text-gray-300">Loading conversation board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600">
          <p className="mb-4">Error loading board: {error}</p>
          <Button onClick={refreshCards} variant="outline" className="h-10 leading-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }


  return (
    <DndContext collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <AppHeader
          onOpenTray={() => setTrayOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenNewCard={() => setDialogOpen(true)}
          onResetLayout={resetLayout}
          onRefreshCards={refreshCards}
          activeConversation={activeConversation}
          runtime={runtime}
          onConversationResumeOrStart={onResumeOrStart}
          onConversationPause={onPause}
          onConversationStop={onStop}
        />

        {/* Board Canvas */}
        <BoardCanvas
          layoutKey={layoutKey}
          activeCard={activeCard}
          isDraggingCard={isDraggingCard}
          getCardsByZone={getCardsByZone}
          onUpdateCard={wrappedUpdateCard}
          onDeleteCard={handleDelete}
        />

        {/* Dialogs */}
        <CardDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreateCard={async (data) => {
            const person = (data?.person && data.person.trim()) ? data.person.trim() : 'system';
            const type = data?.type || TYPE_KEYS.topic;
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
              if (conv.activeId) {
                await conv.logEvent(conv.activeId, 'card.created', {
                  id: newCard?.id,
                  type: newCard?.type,
                  zone: newCard?.zone,
                });
              }
            } catch {}
          }}
        />

        <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      </div>

      {/* LEFT TRAY */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
        onNewCard={() => setDialogOpen(true)}
        onResetLayout={resetLayout}
        onRefreshCards={refreshCards}
      />
    </DndContext>
  );
}

export default function Board() {
  const {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    getCardsByZone,
    refreshCards,
  } = useCards();

  return (
    <BoardInner
      cards={cards}
      loading={loading}
      error={error}
      createCard={createCard}
      updateCard={updateCard}
      deleteCard={deleteCard}
      getCardsByZone={getCardsByZone}
      refreshCards={refreshCards}
    />
  );
}

export { Board };