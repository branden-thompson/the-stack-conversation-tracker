/**
 * Board Component (LK.G + Left Tray + Conversation Controls + 8px gutters)
 * - Hamburger icon-button + left slide-in tray
 * - Right-side conversation controls (status + Start/Pause/Stop)
 * - Consistent 8px gaps between buttons in all header groups (gap-2)
 */

'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { Plus, RefreshCw, HelpCircle, Maximize2, Menu, Play, Pause as PauseIcon, Square, Clock3 } from 'lucide-react';
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

// Header sizing/spacing
const TOOLBAR_H = 40;               // match ThemeToggle height
const DIVIDER_MX = 'mx-6';          // divider horizontal spacing
const HEADER_SIDE_GAP = 'gap-3';    // hamburger <-> title group spacing

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

// Local conversation state for UI; can later be swapped to API without UI changes.
function useLocalConversation() {
  const [status, setStatus] = useState/** @type {'idle'|'active'|'paused'} */('idle');
  const [name, setName] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (status !== 'active') return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const elapsed = useMemo(() => {
    if (status === 'active') return accumulatedMs + (Date.now() - startedAt);
    return accumulatedMs;
  }, [status, startedAt, accumulatedMs, tick]);

  const fmt = (ms) => {
    if (!ms || ms < 0) return '00:00:00';
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${ss}`;
  };

  const start = () => {
    let n = name;
    if (!n) {
      n = window.prompt('Name this conversation:', '') || '';
    }
    if (!n.trim()) return;
    setName(n.trim());
    setStartedAt(Date.now());
    setStatus('active');
  };

  const pause = () => {
    if (status !== 'active') return;
    setAccumulatedMs((prev) => prev + (Date.now() - startedAt));
    setStatus('paused');
  };

  const resume = () => {
    if (status !== 'paused') return;
    setStartedAt(Date.now());
    setStatus('active');
  };

  const stop = () => {
    const ok = window.confirm('End this conversation? This will stop the timer.');
    if (!ok) return;
    setStatus('idle');
    setStartedAt(0);
    setAccumulatedMs(0);
    setName('');
  };

  return { status, name, elapsed, fmt, start, pause, resume, stop };
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

  // Left tray
  const [trayOpen, setTrayOpen] = useState(false);

  // Conversation controls (local)
  const convo = useLocalConversation();

  const boardRef = useRef(null);

  const resetLayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);

  useKeyboardShortcuts({
    onNewTopic: () => createCard(buildNewCardPayload(TYPE_KEYS.topic)),        // ctrl+n
    onNewQuestion: () => createCard(buildNewCardPayload(TYPE_KEYS.question)),  // ctrl+q
    onNewAccusation: () => createCard(buildNewCardPayload(TYPE_KEYS.accusation)), // ctrl+a
    onNewFact: () => createCard(buildNewCardPayload(TYPE_KEYS.fact)),          // ctrl+f
    onNewOpinion: () => createCard(buildNewCardPayload(TYPE_KEYS.opinion)),    // ctrl+o
    onNewGuess: () => createCard(buildNewCardPayload(TYPE_KEYS.guess)),        // ctrl+g
    onDeleteSelected: selectedCard ? () => deleteCard(selectedCard) : null,
    onResetLayout: resetLayout,
    onDeselect: () => setSelectedCard(null),
    selectedCard,
  });

  // ESC closes tray
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && trayOpen) setTrayOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [trayOpen]);

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
            {/* Left: Hamburger + Title */}
            <div className={`flex items-center ${HEADER_SIDE_GAP}`}>
              <Button
                variant="outline"
                size="icon"
                className={`h-[${TOOLBAR_H}px] w-[${TOOLBAR_H}px]`}
                title="Open menu"
                onClick={() => setTrayOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The Stack</h1>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Conversation tracking and facilitation
                </p>
              </div>
            </div>

            {/* Right: Theme | divider | App controls | divider | Conversation controls */}
            <div className="flex items-center">
              {/* Group 1: Theme (gap-2) */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>

              {/* Divider */}
              <span className={`h-6 w-px bg-gray-200 dark:bg-gray-700 ${DIVIDER_MX}`} />

              {/* Group 2: App controls (gap-2) */}
              <div className="flex items-center gap-2">
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

              {/* Divider */}
              <span className={`h-6 w-px bg-gray-200 dark:bg-gray-700 ${DIVIDER_MX}`} />

              {/* Group 3: Conversation status + controls (gap-2) */}
              <div className="flex items-center gap-2">
                {/* Status (adds 12px gap via mr-3 and prevents shrink via min-w-[270px]) */}
                <div className="flex items-center text-sm text-gray-800 dark:text-gray-100 mr-3 min-w-[270px]">
                  <Clock3 className="w-4 h-4 mr-2 opacity-80" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold">
                      {convo.status === 'idle'
                        ? 'No active conversation'
                        : convo.name || 'Unnamed conversation'}
                    </span>
                    <span className="font-mono text-xs opacity-80">{convo.fmt(convo.elapsed)}</span>
                  </div>
                </div>

                {/* Start / Pause / Stop */}
                <Button
                  variant="outline"
                  className={actionBtnClass}
                  disabled={convo.status === 'active'}
                  onClick={() => {
                    if (convo.status === 'paused') convo.resume();
                    else convo.start();
                  }}
                  title={convo.status === 'paused' ? 'Resume' : 'Start'}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {convo.status === 'paused' ? 'Resume' : 'Start'}
                </Button>

                <Button
                  variant="outline"
                  className={actionBtnClass}
                  disabled={convo.status !== 'active'}
                  onClick={convo.pause}
                  title="Pause"
                >
                  <PauseIcon className="w-4 h-4 mr-2" />
                  Pause
                </Button>

                <Button
                  variant="outline"
                  className={actionBtnClass}
                  disabled={convo.status === 'idle'}
                  onClick={convo.stop}
                  title="Stop"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
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

        {/* Drag Overlay (no snap-back) */}
        <DragOverlay dropAnimation={null}>
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

      {/* LEFT TRAY + OVERLAY */}
      {trayOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setTrayOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={[
          'fixed z-50 inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-800',
          'border-r border-gray-200 dark:border-gray-700',
          'shadow-lg transform transition-transform duration-200',
          trayOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-label="Main menu"
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Menu</div>
            <Button variant="outline" size="sm" onClick={() => setTrayOpen(false)}>
              Close
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
            <div className="text-gray-600 dark:text-gray-300">Quick actions</div>
            <Button variant="outline" className="w-full justify-start" onClick={() => setDialogOpen(true)}>
              + New Card
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={resetLayout}>
              Reset Layout
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={refreshCards}>
              Refresh Cards
            </Button>

            <div className="pt-2 text-gray-600 dark:text-gray-300">Zones</div>
            <ul className="space-y-1">
              <li className="text-gray-700 dark:text-gray-200">Active Conversation</li>
              <li className="text-gray-700 dark:text-gray-200">Parking Lot</li>
              <li className="text-gray-700 dark:text-gray-200">Resolved</li>
              <li className="text-gray-700 dark:text-gray-200">Unresolved</li>
            </ul>
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <ThemeToggle />
          </div>
        </div>
      </aside>
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