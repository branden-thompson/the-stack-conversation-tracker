/**
 * Zone Component
 * - Dark mode surfaces
 * - Organized stacks with 20px gaps & no overlap
 * - Restore outlined "Organize" button (secondary variant) in light & dark
 */

'use client';

import { useMemo, useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CARD_ZONES as ZONES, CARD_DIMENSIONS, TYPE_COLORS } from '@/lib/utils/card-type-constants';
import { CARD_LAYOUT, APP_THEME } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

/* ---------- Layout / stacking constants ---------- */
const STACK_GAP_PX = CARD_LAYOUT.stackGap;
const STACK_OFFSET_PX = CARD_LAYOUT.stackOffset;
const BASE_CARD_WIDTH  = Math.max(CARD_DIMENSIONS?.width  ?? 300, 300);
const BASE_CARD_HEIGHT = Math.max(CARD_DIMENSIONS?.height ?? 140, 140);

/* ---------- Helpers ---------- */
function byNewestFirst(a, b) {
  const at = a.updatedAt ?? a.createdAt ?? 0;
  const bt = b.updatedAt ?? b.createdAt ?? 0;
  return bt - at;
}

function groupCardsByType(cards) {
  const map = new Map();
  for (const c of cards) {
    const t = c.type || 'topic';
    if (!map.has(t)) map.set(t, []);
    map.get(t).push(c);
  }
  for (const [, arr] of map) arr.sort(byNewestFirst);
  return map;
}

/* ---------- Component ---------- */
export function Zone({
  zoneId,
  cards = [],
  onUpdateCard,
  onDeleteCard,
  onUpdateCardPosition,
  isDraggingCard,
  autoOrganize = false,
  showOrganizeButton = true,
  titleOverride,
  users = [],
  animationsEnabled = true,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: zoneId,
    data: { type: 'zone', accepts: 'card' },
  });

  // Zone card tracking available in dev tools
  
  // Get dynamic theme
  const dynamicTheme = useDynamicAppTheme();

  const zoneConfig = ZONES?.[zoneId] ?? {
    title: titleOverride ?? 'Zone',
    description: '',
    className: '',
  };

  const [organizeOnce, setOrganizeOnce] = useState(false);
  const effectiveOrganize = autoOrganize || organizeOnce;

  const stacks = useMemo(() => {
    if (!effectiveOrganize) return null;
    const grouped = groupCardsByType(cards);
    return Array.from(grouped.entries()).map(([type, bucket]) => ({
      type,
      cards: bucket,
      label: TYPE_COLORS?.[type]?.label ?? type,
    }));
  }, [cards, effectiveOrganize]);

  /* Persist organized layout (optional convenience) */
  const handleOrganizePersist = useCallback(async () => {
    if (!cards.length) {
      setOrganizeOnce(true);
      return;
    }
    const grouped = groupCardsByType(cards);

    let cursorX = STACK_GAP_PX;
    let cursorY = STACK_GAP_PX;
    let rowMaxH = 0;

    const ordered = Array.from(grouped.entries()).map(([type, bucket]) => ({
      type,
      cards: bucket.sort(byNewestFirst),
    }));

    for (const stack of ordered) {
      const count = stack.cards.length;
      const estStackW = BASE_CARD_WIDTH  + STACK_OFFSET_PX * Math.max(0, count - 1);
      const estStackH = BASE_CARD_HEIGHT + STACK_OFFSET_PX * Math.max(0, count - 1);

      const SOFT_ROW_WIDTH = 1200; // heuristic; container scrolls if smaller
      if (cursorX + estStackW + STACK_GAP_PX > SOFT_ROW_WIDTH) {
        cursorX = STACK_GAP_PX;
        cursorY += rowMaxH + STACK_GAP_PX;
        rowMaxH = 0;
      }

      for (let i = 0; i < count; i++) {
        const c = stack.cards[i];
        await onUpdateCard?.(c.id, {
          zone: zoneId,
          position: { x: cursorX + i * STACK_OFFSET_PX, y: cursorY + i * STACK_OFFSET_PX },
          stackOrder: i,
        });
      }

      cursorX += estStackW + STACK_GAP_PX;
      rowMaxH = Math.max(rowMaxH, estStackH);
    }

    setOrganizeOnce(true);
  }, [cards, onUpdateCard, zoneId]);

  /* ---------- Renderers ---------- */

  // Free-form (manual layout)
  const renderFreeForm = () => {
    const threshold = 20;
    const grouped = {};
    cards.forEach((card) => {
      const x = card.position?.x ?? 0;
      const y = card.position?.y ?? 0;
      let key = `${x}-${y}`;
      for (const k in grouped) {
        const [sx, sy] = k.split('-').map(Number);
        if (Math.abs(sx - x) < threshold && Math.abs(sy - y) < threshold) {
          key = k; break;
        }
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(card);
    });

    Object.values(grouped).forEach((stack) =>
      stack.sort((a, b) => (a.stackOrder ?? 0) - (b.stackOrder ?? 0))
    );

    return (
      <div className="relative h-full w-full min-h-0 overflow-auto">
        <div ref={setNodeRef} className="absolute inset-0" />
        {/* Enhanced drop feedback overlay when dragging */}
        {isDraggingCard && (
          <div className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg z-10 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${dynamicTheme.colors.background.dropdown} px-3 py-2 rounded-md`}>
                <p className={`text-sm font-medium ${dynamicTheme.colors.text.secondary}`}>Drop here</p>
              </div>
            </div>
          </div>
        )}
        {Object.entries(grouped).map(([key, stack]) => {
          const [x, y] = key.split('-').map(Number);
          return (
            <div key={key} className="absolute" style={{ left: x, top: y }}>
              {stack.map((card, i) => (
                <div
                  key={card.id}
                  className="absolute"
                  style={{ left: i * STACK_OFFSET_PX, top: i * STACK_OFFSET_PX }}
                >
                  <CardWrapper
                    card={card}
                    stackIndex={i}
                    zoneId={zoneId}
                    onUpdateCard={onUpdateCard}
                    onDeleteCard={onDeleteCard}
                    draggableEnabled={true}
                    users={users}
                    animationsEnabled={animationsEnabled}
                  />
                </div>
              ))}
            </div>
          );
        })}
        {cards.length === 0 && (
          <div className={`absolute inset-2 flex items-center justify-center ${dynamicTheme.colors.text.light} border-2 border-dashed ${dynamicTheme.colors.border.secondary} rounded-lg`}>
            <div className="text-center">
              <p className="text-sm font-medium">Drop cards here</p>
              <p className="text-xs mt-1 opacity-75">Drag cards from other zones</p>
            </div>
          </div>
        )}
        
        {/* Always show drop area when dragging, even if zone has cards */}
        {isDraggingCard && cards.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 bg-blue-100/80 dark:bg-blue-900/40 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg p-4 z-20">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Drop here to add card</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Organized (auto stacks by type, newest on top)
  const renderOrganized = () => {
    const hasStacks = stacks && stacks.length > 0;

    return (
      <div className="relative h-full w-full min-h-0 overflow-auto">
        <div ref={setNodeRef} className="absolute inset-0" />
        {/* Enhanced drop feedback overlay when dragging */}
        {isDraggingCard && (
          <div className="absolute inset-0 bg-blue-100/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg z-10 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${dynamicTheme.colors.background.dropdown} px-3 py-2 rounded-md`}>
                <p className={`text-sm font-medium ${dynamicTheme.colors.text.secondary}`}>Drop here</p>
              </div>
            </div>
          </div>
        )}
        <div
          className="flex flex-wrap items-start content-start"
          style={{ gap: `${STACK_GAP_PX}px`, padding: `${STACK_GAP_PX}px` }}
        >
          {hasStacks ? (
            stacks.map((stack) => {
              const count = stack.cards.length;
              const pad = STACK_OFFSET_PX * Math.max(0, count - 1);
              return (
                <div
                  key={stack.type}
                  className="relative inline-block"
                  style={{ paddingRight: pad, paddingBottom: pad }}
                  title={stack.label}
                >
                  <div className="relative inline-block">
                    {stack.cards.map((card, i) => {
                      const isFirst = i === 0;
                      return (
                        <div
                          key={card.id}
                          className={cn(!isFirst && 'absolute')}
                          style={!isFirst ? { left: i * STACK_OFFSET_PX, top: i * STACK_OFFSET_PX } : undefined}
                        >
                          <CardWrapper
                            card={card}
                            stackIndex={i}
                            zoneId={zoneId}
                            onUpdateCard={onUpdateCard}
                            onDeleteCard={onDeleteCard}
                            draggableEnabled={true}
                            users={users}
                            animationsEnabled={animationsEnabled}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`absolute inset-2 flex items-center justify-center ${dynamicTheme.colors.text.light} border-2 border-dashed ${dynamicTheme.colors.border.secondary} rounded-lg`}>
              <div className="text-center">
                <p className="text-sm font-medium">Drop cards here</p>
                <p className="text-xs mt-1 opacity-75">Drag cards from other zones</p>
              </div>
            </div>
          )}
          
          {/* Always show drop area when dragging, even if zone has cards */}
          {isDraggingCard && hasStacks && (
            <div className="absolute bottom-2 left-2 right-2 bg-blue-100/80 dark:bg-blue-900/40 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg p-4 z-20">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Drop here to add card</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative h-full w-full flex flex-col rounded-lg border-2 overflow-hidden transition-all duration-200',
        // zone surface w/ dynamic theme support
        dynamicTheme.colors.background.zone,
        dynamicTheme.colors.border.primary,
        zoneConfig.className,
        // Enhanced drop feedback
        isOver && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        // Improved mobile drop target visibility - make more prominent
        isDraggingCard && !isOver && 'border-dashed border-blue-300 dark:border-blue-400 border-4 bg-blue-50/30 dark:bg-blue-900/10'
      )}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-3 ${dynamicTheme.colors.background.zoneHeader} ${dynamicTheme.colors.border.primary} border-b`}>
        <div className="flex flex-col text-left">
          <h3 className={`font-semibold text-sm ${dynamicTheme.colors.text.primary}`}>
            {titleOverride ?? zoneConfig.title}
          </h3>
          {zoneConfig.description ? (
            <p className={`text-xs ${dynamicTheme.colors.text.tertiary}`}>{zoneConfig.description}</p>
          ) : null}
        </div>

        {showOrganizeButton && (
          <Button
            size="sm"
            variant="secondary"
            /* Restore visible outline in both themes while keeping secondary look */
            className={`shrink-0 border ${dynamicTheme.colors.border.secondary} bg-transparent ${dynamicTheme.colors.background.hover}`}
            onClick={handleOrganizePersist}
          >
            Organize
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="relative flex-1 min-h-0">
        {effectiveOrganize ? renderOrganized() : renderFreeForm()}
        
        {/* Global drop indicator overlay - always visible when dragging */}
        {isDraggingCard && (
          <div className="absolute inset-0 bg-blue-500/40 border-4 border-dashed border-blue-600 rounded-lg z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl font-bold text-lg animate-pulse">
              🎯 DROP HERE - {titleOverride ?? zoneConfig.title}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

/* Lazy import to avoid SSR dnd mismatch */
const ConversationCard = dynamic(
  () => import('./ConversationCard').then((m) => m.ConversationCard),
  { ssr: false }
);

function CardWrapper({
  card,
  stackIndex,
  zoneId,
  onUpdateCard,
  onDeleteCard,
  draggableEnabled,
  users = [],
  animationsEnabled = true,
}) {
  return (
    <ConversationCard
      card={card}
      onUpdate={onUpdateCard}
      onDelete={onDeleteCard}
      isStacked={true}
      stackPosition={stackIndex}
      zoneId={zoneId}
      draggableEnabled={draggableEnabled}
      users={users}
      animationsEnabled={animationsEnabled}
    />
  );
}