/**
 * Board Component
 * Main conversation tracking board with resizable zones
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

/** Resolve a canonical CARD_TYPES key from a list of aliases */
function resolveCardType(aliases, fallback = 'topic') {
  if (CARD_TYPES && typeof CARD_TYPES === 'object') {
    for (const key of aliases) {
      if (Object.prototype.hasOwnProperty.call(CARD_TYPES, key)) return key;
    }
  }
  return fallback;
}

/** Canonical type resolvers (tries common historical aliases) */
const TYPE_KEYS = {
  topic: resolveCardType(['topic', 'conversation', 'conversation_topic'], 'topic'),
  question: resolveCardType(['question', 'open_question', 'open-question'], 'question'),
  accusation: resolveCardType(['accusation', 'claim', 'allegation'], 'accusation'),
  fact: resolveCardType(
    ['fact', 'factual', 'factual_statement', 'objective_fact', 'objective', 'statement'],
    'fact'
  ),
};

// Helper to build a complete new-card payload the API will accept
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
    createdBy: 'system', // keep footer creator if you show it; can differ from "person"
    person: 'system',    // <-- default assignee for shortcut-created cards
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
  
  /** Apply START layout sizes without reloading */
  const resetLayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);
  
  // Keyboard shortcuts (per-type creation + other actions)
  useKeyboardShortcuts({
    onNewTopic: () => createCard(buildNewCardPayload(TYPE_KEYS.topic)),
    onNewQuestion: () => createCard(buildNewCardPayload(TYPE_KEYS.question)),
    onNewAccusation: () => createCard(buildNewCardPayload(TYPE_KEYS.accusation)),
    onNewFact: () => createCard(buildNewCardPayload(TYPE_KEYS.fact)),
    onDeleteSelected: selectedCard ? () => deleteCard(selectedCard) : null,
    onResetLayout: resetLayout,
    onDeselect: () => setSelectedCard(null),
    selectedCard
  });
  
  // Cards grouped by zone
  const cardsByZone = getCardsByZone();
  
  /** DnD handlers */
  const handleDragStart = (event) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card || null);
    setIsDraggingCard(true);
  };
  
  const handleDragEnd = async (event) => {
    const { active, over, delta } = event;
    setActiveCard(null);
    setIsDraggingCard(false);
    if (!active) return;
    
    const draggedCard = cards.find(c => c.id === active.id);
    if (!draggedCard) return;
    
    if (over && ZONES[over.id]) {
      const dropPosition = {
        x: Math.max(10, (draggedCard.position?.x || 10) + delta.x),
        y: Math.max(60, (draggedCard.position?.y || 60) + delta.y)
      };

      // Only stack with same type
      const targetZoneCards = (cardsByZone[over.id] || []).filter(c => c.type === draggedCard.type);
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
          stackOrder: (stackTarget.stackOrder || 0) + 1
        });
      } else {
        await updateCard(active.id, {
          zone: over.id,
          position: dropPosition,
          stackOrder: 0
        });
      }
    } else if (over?.data?.current?.type === 'card') {
      const targetCard = cards.find(c => c.id === over.id);
      if (targetCard && targetCard.id !== draggedCard.id && targetCard.type === draggedCard.type) {
        await updateCard(active.id, {
          zone: targetCard.zone,
          position: targetCard.position,
          stackOrder: (targetCard.stackOrder || 0) + 1
        });
      }
    } else {
      const currentPosition = draggedCard.position || { x: 10, y: 60 };
      const newPosition = {
        x: Math.max(10, currentPosition.x + delta.x),
        y: Math.max(60, currentPosition.y + delta.y)
      };
      await updateCard(active.id, { position: newPosition });
    }
  };
  
  const handleUpdateCardPosition = async (cardId, position) => {
    await updateCard(cardId, { position });
  };
  
  const collisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    const cardCollision = pointerCollisions.find(
      collision => collision.data?.droppableContainer?.data?.current?.type === 'card'
    );
    if (cardCollision) return [cardCollision];
    return rectIntersection(args);
  }, []);
  
  /** Loading */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-600" />
          <p className="text-gray-600">Loading conversation board...</p>
        </div>
      </div>
    );
  }
  
  /** Error */
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <p className="mb-4">Error loading board: {error}</p>
          <Button onClick={refreshCards} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <DndContext
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                The Stack | Conversation tracking and facilitation
              </h1>
              <p className="text-xs text-gray-600">
                Organize and track discussion topics visually
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setHelpOpen(true)} variant="outline" size="sm" title="Help and keyboard shortcuts">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button onClick={resetLayout} variant="outline" size="sm" title="Reset layout to start sizes">
                <Maximize2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={refreshCards} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Card
              </Button>
            </div>
          </div>
        </header>
        
        {/* Board Canvas with Resizable Panels */}
        <main ref={boardRef} className="flex-1 relative overflow-hidden">
          <ResizablePanelGroup key={layoutKey} direction="vertical" className="h-full">
            {/* Top Row */}
            <ResizablePanel defaultSize={DEFAULT_LAYOUT.rows.top} minSize={20}>
              <ResizablePanelGroup direction="horizontal">
                {/* Active Zone (largest START size) */}
                <ResizablePanel defaultSize={DEFAULT_LAYOUT.topRowCols.active} minSize={20}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="active"
                      cards={cardsByZone.active || []}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                      onUpdateCardPosition={handleUpdateCardPosition}
                      isDraggingCard={isDraggingCard}
                      autoOrganize={true}
                      showOrganizeButton={false}
                      titleOverride="Active Conversation"
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                {/* Parking Lot Zone */}
                <ResizablePanel defaultSize={DEFAULT_LAYOUT.topRowCols.parking} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="parking"
                      cards={cardsByZone.parking || []}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                      onUpdateCardPosition={handleUpdateCardPosition}
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
                {/* Resolved Zone */}
                <ResizablePanel defaultSize={DEFAULT_LAYOUT.bottomRowCols.resolved} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="resolved"
                      cards={cardsByZone.resolved || []}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                      onUpdateCardPosition={handleUpdateCardPosition}
                      isDraggingCard={isDraggingCard}
                      autoOrganize={false}
                      showOrganizeButton={true}
                      titleOverride="Resolved"
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                {/* Unresolved Zone */}
                <ResizablePanel defaultSize={DEFAULT_LAYOUT.bottomRowCols.unresolved} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="unresolved"
                      cards={cardsByZone.unresolved || []}
                      onUpdateCard={updateCard}
                      onDeleteCard={deleteCard}
                      onUpdateCardPosition={handleUpdateCardPosition}
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
            // Ensure safe default for person if dialog somehow passes empty/undefined
            const person = (data?.person && data.person.trim()) ? data.person.trim() : 'system';
            return createCard({
              type: data?.type || TYPE_KEYS.topic,
              content: data?.content || '',
              zone: 'active',
              position: { x: 10, y: 60 },
              stackOrder: 0,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createdBy: 'system',
              person, // <-- attach assignee
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
    refreshCards
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