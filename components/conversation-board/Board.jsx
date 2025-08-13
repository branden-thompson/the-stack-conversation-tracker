/**
 * Board Component
 * - Adds OPINION type + remaps ctrl+o → OPINION; ctrl+f → FACT
 * - Preserves dark mode, zones, DnD, stacking-by-type
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { DndContext, DragOverlay, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { Plus, RefreshCw, HelpCircle, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Zone } from './Zone';
import { ConversationCard } from './ConversationCard';
import { CardDialog } from './CardDialog';
import { HelpDialog } from './HelpDialog';
import { useCards } from '@/lib/hooks/useCards';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { ZONES, CARD_TYPES } from '@/lib/utils/constants';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

const DEFAULT_LAYOUT = {
  rows: { top: 70, bottom: 30 },
  topRowCols: { active: 70, parking: 30 },
  bottomRowCols: { resolved: 50, unresolved: 50 },
};

const TOOLBAR_H = 40; // keep in sync with ThemeToggle

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
  opinion: resolveCardType(['opinion'], 'opinion'), // NEW
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

  const boardRef = useRef(null);

  const resetLayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);

  useKeyboardShortcuts({
    onNewTopic: () => createCard(buildNewCardPayload(TYPE_KEYS.topic)),
    onNewQuestion: () => createCard(buildNewCardPayload(TYPE_KEYS.question)),
    onNewAccusation: () => createCard(buildNewCardPayload(TYPE_KEYS.accusation)),
    onNewFact: () => createCard(buildNewCardPayload(TYPE_KEYS.fact)),          // ctrl+f
    onNewOpinion: () => createCard(buildNewCardPayload(TYPE_KEYS.opinion)),    // ctrl+o
    onNewGuess: () => createCard(buildNewCardPayload(TYPE_KEYS.guess)),
    onDeleteSelected: selectedCard ? () => deleteCard(selectedCard) : null,
    onResetLayout: resetLayout,
    onDeselect: () => setSelectedCard(null),
    selectedCard,
  });

  const cardsByZone = getCardsByZone();

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
      // stack only with same type
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
        await updateCard(active.id, {
          zone: over.id,
          position: stackTarget.position,
          stackOrder: (stackTarget.stackOrder || 0) + 1,
        });
      } else {
        await updateCard(active.id, {
          zone: over.id,
          position: dropPosition,
          stackOrder: 0,
        });
      }
    } else if (over?.data?.current?.type === 'card') {
      const targetCard = cards.find((c) => c.id === over.id);
      if (targetCard && targetCard.id !== draggedCard.id && targetCard.type === draggedCard.type) {
        await updateCard(active.id, {
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
      await updateCard(active.id, { position: newPosition });
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
          <Button onClick={refreshCards} variant="outline" className={`h-[${TOOLBAR_H}px] leading-none`}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const actionBtnClass = `h-[${TOOLBAR_H}px] leading-none`;

  return (
    <DndContext collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/stack-icon.svg" alt="The Stack" width={50} height={50} className="block" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  The Stack | Conversation tracking and facilitation
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Organize and track discussion topics visually
                </p>
              </div>
            </div>

            {/* Right controls: ThemeToggle + 40px gap + other buttons */}
            <div className="flex gap-2 items-center">
              <div className="mr-10">
                <ThemeToggle />
              </div>
              <Button
                onClick={() => setHelpOpen(true)}
                variant="outline"
                title="Help and keyboard shortcuts"
                className={actionBtnClass}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button
                onClick={resetLayout}
                variant="outline"
                title="Reset layout to start sizes"
                className={actionBtnClass}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={refreshCards}
                variant="outline"
                className={actionBtnClass}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setDialogOpen(true)}
                className={actionBtnClass}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Card
              </Button>
            </div>
          </div>
        </header>

        {/* Board Canvas */}
        <main ref={boardRef} className="flex-1 relative overflow-hidden">
          <ResizablePanelGroup key={layoutKey} direction="vertical" className="h-full">
            {/* Top Row */}
            <ResizablePanel defaultSize={DEFAULT_LAYOUT.rows.top} minSize={20}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={DEFAULT_LAYOUT.topRowCols.active} minSize={20}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="active"
                      cards={cardsByZone.active || []}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                      isDraggingCard={isDraggingCard}
                      autoOrganize={true}
                      showOrganizeButton={false}
                      titleOverride="Active Conversation"
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={DEFAULT_LAYOUT.topRowCols.parking} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="parking"
                      cards={cardsByZone.parking || []}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                      isDraggingCard={isDraggingCard}
                      autoOrganize={false}
                      showOrganizeButton={true}
                      titleOverride="Parking Lot"
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Bottom Row */}
            <ResizablePanel defaultSize={DEFAULT_LAYOUT.rows.bottom} minSize={15}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={DEFAULT_LAYOUT.bottomRowCols.resolved} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="resolved"
                      cards={cardsByZone.resolved || []}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                      isDraggingCard={isDraggingCard}
                      autoOrganize={false}
                      showOrganizeButton={true}
                      titleOverride="Resolved"
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={DEFAULT_LAYOUT.bottomRowCols.unresolved} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="unresolved"
                      cards={cardsByZone.unresolved || []}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                      isDraggingCard={isDraggingCard}
                      autoOrganize={false}
                      showOrganizeButton={true}
                      titleOverride="Unresolved"
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <div style={{ cursor: 'grabbing' }}>
              <ConversationCard card={activeCard} onUpdate={() => {}} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>

        {/* Dialogs */}
        <CardDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreateCard={(data) => {
            const person = (data?.person && data.person.trim()) ? data.person.trim() : 'system';
            const type = data?.type || TYPE_KEYS.topic;
            return createCard({
              type,
              content: data?.content || '',
              zone: 'active',
              position: { x: 10, y: 60 },
              stackOrder: 0,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createdBy: 'system',
              person,
            });
          }}
        />

        <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      </div>
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