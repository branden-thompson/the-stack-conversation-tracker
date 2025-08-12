/**
 * Zone Component
 * Auto-organizes by type/date with variable-width packing and equal gutters.
 * Measures per-type card width/height; uses max(header scrollWidth, card offsetWidth)
 * so stack wrappers are always wide enough to contain card headers/controls.
 */

'use client';

import { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ConversationCard } from './ConversationCard';
import { ZONES, CARD_DIMENSIONS } from '@/lib/utils/constants';
import { Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_ORDER_BASE = ['topic', 'question', 'accusation', 'fact'];
const GUTTER = 20;
const PADDING_X = 20;
const PADDING_Y = 20;
const STACK_TOP = 60;

function getOrderedTypes(cards) {
  const base = [...TYPE_ORDER_BASE];
  const seen = new Set(base);
  for (const c of cards) {
    const t = c.type || 'topic';
    if (!seen.has(t)) {
      seen.add(t);
      base.push(t);
    }
  }
  return base;
}

export function Zone({
  zoneId,
  cards = [],
  onUpdateCard,
  onDeleteCard,
  isDraggingCard,
  activeCardId,
  organizeLabel = 'Organize',
  draggableEnabled = true,
  titleOverride,
  autoOrganize = false,
  showOrganizeButton = false,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: zoneId,
    data: { type: 'zone', accepts: 'card' }
  });

  const zoneConfig = ZONES[zoneId];

  const canvasRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [typeHeights, setTypeHeights] = useState({});
  const [typeWidths, setTypeWidths] = useState({});

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      setContainerWidth(rect.width);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure tallest & widest card per type (include header scrollWidth)
  const measureTypeMetrics = useCallback(() => {
    const root = canvasRef.current;
    if (!root) return;

    const presentTypes = Array.from(new Set(cards.map(c => c.type || 'topic')));
    const nextHeights = {};
    const nextWidths = {};

    presentTypes.forEach((t) => {
      const nodes = root.querySelectorAll(`[data-card-type="${t}"]`);
      let maxH = 0;
      let maxW = 0;
      nodes.forEach((node) => {
        const nodeH = node.offsetHeight || 0;
        const nodeW = node.offsetWidth || 0;

        // Also capture the header's scrollWidth if present
        const header = node.querySelector('.cc-header');
        const headerW = header ? Math.ceil(header.scrollWidth) : 0;

        maxH = Math.max(maxH, nodeH);
        maxW = Math.max(maxW, nodeW, headerW);
      });
      if (maxH > 0) nextHeights[t] = maxH;
      if (maxW > 0) nextWidths[t] = maxW;
    });

    const sameH =
      Object.keys(nextHeights).length === Object.keys(typeHeights).length &&
      Object.keys(nextHeights).every((k) => nextHeights[k] === typeHeights[k]);
    const sameW =
      Object.keys(nextWidths).length === Object.keys(typeWidths).length &&
      Object.keys(nextWidths).every((k) => nextWidths[k] === typeWidths[k]);

    if (!sameH) setTypeHeights(nextHeights);
    if (!sameW) setTypeWidths(nextWidths);
  }, [cards, typeHeights, typeWidths]);

  useEffect(() => {
    const id = requestAnimationFrame(() => measureTypeMetrics());
    return () => cancelAnimationFrame(id);
  }, [cards, containerWidth, measureTypeMetrics]);

  const computeTypeAnchors = useCallback(() => {
    const orderedTypes = getOrderedTypes(cards);
    const presentTypes = orderedTypes.filter(t =>
      cards.some(c => (c.type || 'topic') === t)
    );

    const usableW = Math.max(containerWidth - PADDING_X * 2, CARD_DIMENSIONS.width);
    if (!presentTypes.length) return { anchors: {}, rows: [], rowHeights: [] };

    const rows = [];
    const rowX = [];

    let currentRow = [];
    let currentRowX = [];
    let cursorX = PADDING_X;

    presentTypes.forEach((type) => {
      const w = Math.max(typeWidths[type] ?? CARD_DIMENSIONS.width, CARD_DIMENSIONS.width);
      const projectedEnd = cursorX + w;
      const fitsInCurrentRow = (projectedEnd - PADDING_X) <= usableW;

      if (!currentRow.length) {
        // first item in row
      } else if (!fitsInCurrentRow) {
        rows.push(currentRow);
        rowX.push(currentRowX);
        currentRow = [];
        currentRowX = [];
        cursorX = PADDING_X;
      }

      currentRow.push(type);
      currentRowX.push(cursorX);
      cursorX += w + GUTTER; // constant horizontal spacing
    });

    if (currentRow.length) {
      rows.push(currentRow);
      rowX.push(currentRowX);
    }

    const rowHeights = rows.map((row) => {
      const maxH = row.reduce((acc, t) => {
        const h = typeHeights[t] ?? CARD_DIMENSIONS.height;
        return Math.max(acc, h);
      }, 0);
      return maxH + GUTTER; // constant vertical spacing
    });

    const anchors = {};
    rows.forEach((rowTypes, rowIndex) => {
      const yBase =
        STACK_TOP +
        PADDING_Y +
        rowHeights.slice(0, rowIndex).reduce((sum, v) => sum + v, 0);

      rowTypes.forEach((type, i) => {
        const x = rowX[rowIndex][i];
        anchors[type] = { x, y: yBase };
      });
    });

    return { anchors, rows, rowHeights };
  }, [cards, containerWidth, typeWidths, typeHeights]);

  const organize = useCallback(async () => {
    if (!cards.length) return;

    const { anchors } = computeTypeAnchors();
    if (!anchors || Object.keys(anchors).length === 0) return;

    const groups = {};
    for (const c of cards) {
      const t = c.type || 'topic';
      if (!groups[t]) groups[t] = [];
      groups[t].push(c);
    }

    const updates = [];

    for (const type of Object.keys(groups)) {
      const stack = groups[type];
      if (!stack.length || !anchors[type]) continue;

      stack.sort((a, b) => {
        const ta = a.createdAt ?? a.meta?.createdAt ?? 0;
        const tb = b.createdAt ?? b.meta?.createdAt ?? 0;
        return ta - tb;
      });

      const { x, y } = anchors[type];

      stack.forEach((card, idx) => {
        const desired = { zone: zoneId, position: { x, y }, stackOrder: idx };
        const pos = card.position || {};
        const changed =
          card.zone !== zoneId ||
          pos.x !== desired.position.x ||
          pos.y !== desired.position.y ||
          (card.stackOrder || 0) !== desired.stackOrder;
        if (changed) updates.push(onUpdateCard(card.id, desired));
      });
    }

    if (updates.length) {
      await Promise.all(updates);
    }
  }, [cards, zoneId, onUpdateCard, computeTypeAnchors]);

  useEffect(() => {
    if (!autoOrganize) return;
    if (!cards.length) return;
    const id = requestAnimationFrame(() => organize());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOrganize, containerWidth, typeHeights, typeWidths, cards]);

  const content = useMemo(() => {
    const stacks = {};
    const threshold = 20;

    cards.forEach((card) => {
      const type = card.type || 'topic';
      const x = card.position?.x ?? 0;
      const y = card.position?.y ?? 0;

      let foundKey = null;
      for (const key in stacks) {
        const [t, sx, sy] = key.split('|');
        if (t !== type) continue;
        const nx = Number(sx);
        const ny = Number(sy);
        if (Math.abs(nx - x) < threshold && Math.abs(ny - y) < threshold) {
          foundKey = key;
          break;
        }
      }

      const key = foundKey || `${type}|${x}|${y}`;
      if (!stacks[key]) stacks[key] = [];
      stacks[key].push(card);
    });

    Object.values(stacks).forEach((stack) => {
      stack.sort((a, b) => (a.stackOrder || 0) - (b.stackOrder || 0));
    });

    return Object.entries(stacks).map(([key, stack]) => {
      const [, sx, sy] = key.split('|');
      const x = Number(sx);
      const y = Number(sy);
      const stackType = stack[0]?.type || 'topic';

      const stackWidth = Math.max(typeWidths[stackType] ?? CARD_DIMENSIONS.width, CARD_DIMENSIONS.width);

      return (
        <div
          key={key}
          className="absolute"
          style={{ left: `${x}px`, top: `${y}px`, width: `${stackWidth}px` }}
          data-stack-type={stackType}
        >
          {stack.map((card, index) => (
            <ConversationCard
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              isStacked={stack.length > 1}
              stackPosition={index}
              zoneId={zoneId}
              isOverlay={false}
              isSourceDragging={isDraggingCard && activeCardId === card.id}
              draggableEnabled={draggableEnabled}
            />
          ))}
        </div>
      );
    });
  }, [cards, isDraggingCard, activeCardId, zoneId, onUpdateCard, onDeleteCard, draggableEnabled, typeWidths]);

  return (
    <div
      className={cn(
        'relative h-full rounded-lg border-2 transition-all overflow-hidden',
        zoneConfig?.className,
        isOver && 'ring-2 ring-blue-400 ring-offset-2'
      )}
    >
      {/* Zone Header */}
      <div className="flex items-center justify-between p-3 bg-white/60 border-b">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-gray-500" />
          <div className="text-left">
            <h3 className="font-semibold text-sm">
              {titleOverride || zoneConfig?.title}
            </h3>
            <p className="text-xs text-gray-600">
              {zoneConfig?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{cards.length} cards</span>
          {showOrganizeButton && (
            <Button
              variant="outline"
              onClick={organize}
              title="Stack by type and date (newest on top)"
            >
              {organizeLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Card Canvas */}
      <div ref={setNodeRef} className="absolute inset-0 top-[56px] p-2 overflow-auto">
        <div ref={canvasRef} className="relative w-full h-full">
          {content}
          {cards.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <p className="text-sm">Drop cards here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}