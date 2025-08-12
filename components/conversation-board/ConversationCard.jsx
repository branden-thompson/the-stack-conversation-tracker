/**
 * ConversationCard Component
 * Draggable card with editable content and flexible vertical size.
 * Ensures header (type + controls) always fits inside the card and edge padding is symmetric.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  X,
  GripVertical,
  Layers,
  User as UserIcon,
  Calendar as CalendarIcon,
  Check,
  Timer,
} from 'lucide-react';
import { CARD_TYPES, CARD_DIMENSIONS } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';
import { useAutosizeTextArea } from '@/lib/hooks/useAutosizeTextArea';

function humanizeType(type) {
  if (!type) return 'Card';
  return String(type)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ConversationCard({
  card,
  onUpdate,
  onDelete,
  isStacked = false,
  stackPosition = 0,
  zoneId,
  isOverlay = false,
  isSourceDragging = false,
  draggableEnabled = true,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(card.content ?? '');
  const [computedMinWidth, setComputedMinWidth] = useState(CARD_DIMENSIONS.width);

  const inputRef = useRef(null);
  const headerRef = useRef(null); // measure header content width

  const cardTypeCfg = CARD_TYPES[card.type] || CARD_TYPES.topic;
  const typeLabel = cardTypeCfg?.label || humanizeType(card.type || 'topic');

  const createdBy = card.createdBy ?? card.meta?.createdBy ?? 'Created By User';
  const createdAtRaw = card.createdAt ?? card.meta?.createdAt ?? null;

  const createdAtFormatted = createdAtRaw
    ? new Date(createdAtRaw).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  useAutosizeTextArea(inputRef, content, { minRows: 3, maxRows: 12 });

  // dnd-kit
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { type: 'card', card, fromZone: zoneId },
  });

  // Measure header width (so card is never narrower than header content)
  useEffect(() => {
    if (!headerRef.current) return;

    const el = headerRef.current;
    const update = () => {
      // scrollWidth = full width header needs without clipping (includes padding)
      const headerNeeded = Math.ceil(el.scrollWidth);
      const minW = Math.max(CARD_DIMENSIONS.width, headerNeeded);
      setComputedMinWidth(minW);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [typeLabel, isStacked, stackPosition, content]);

  const translate = CSS.Translate.toString(transform);

  const style = {
    transform: translate,
    willChange: 'transform',
    position: isStacked ? 'absolute' : 'relative',
    top: isStacked ? stackPosition * CARD_DIMENSIONS.stackOffset : 0,
    left: isStacked ? stackPosition * CARD_DIMENSIONS.stackOffset : 0,
    zIndex: isDragging ? 1000 : isStacked ? stackPosition + 1 : 1,
    opacity: isOverlay ? 1 : isSourceDragging ? 0 : 1,
    // Fill the stack wrapper but never be narrower than header needs
    width: '100%',
    minWidth: computedMinWidth,
    maxWidth: '100%',
    minHeight: CARD_DIMENSIONS.height,
    boxSizing: 'border-box',
    userSelect: isDragging ? 'none' : 'auto',
    transition: isDragging ? 'none' : undefined,
    cursor: draggableEnabled ? 'default' : 'not-allowed',
    pointerEvents: isSourceDragging ? 'none' : 'auto',
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmed = content.trim();
    if (trimmed !== (card.content ?? '')) {
      await onUpdate?.(card.id, { content: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(card.content ?? '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleUnstack = async (e) => {
    e.stopPropagation();
    const newPosition = {
      x: (card.position?.x ?? 0) + 30,
      y: (card.position?.y ?? 0) + 30,
    };
    await onUpdate?.(card.id, { position: newPosition, stackOrder: 0 });
  };

  // Move helpers (header buttons)
  const moveToZone = async (e, targetZone) => {
    e.stopPropagation();
    await onUpdate?.(card.id, {
      zone: targetZone,
      position: { x: 10, y: 60 },
      stackOrder: 0,
    });
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const headerDnD = draggableEnabled ? { ...listeners, ...attributes } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex flex-col rounded-lg border-2 shadow-sm transition-[box-shadow] hover:shadow-md hover:z-20',
        'overflow-visible',
        cardTypeCfg.color,
        cardTypeCfg.borderColor,
        cardTypeCfg.textColor,
        isOverlay && 'hover:shadow-sm'
      )}
      role="group"
      data-card-type={card.type || 'topic'}
      data-card-id={card.id}
    >
      {/* HEADER — entire area is the drag handle (if enabled) */}
      <div
        ref={headerRef}
        className={cn(
          // Asymmetric header padding: left = pl-3, right = pr-0.
          // Controls group adds pr-3 so edge gaps (left icon vs right X) are identical.
          'cc-header flex items-center justify-between pl-3 pr-0 py-3 border-b border-gray-200 bg-white/70',
          'whitespace-nowrap',
          draggableEnabled ? 'cursor-grab active:cursor-grabbing select-none' : 'cursor-default'
        )}
        {...headerDnD}
      >
        {/* Type label (never truncated) */}
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-medium">{typeLabel}</span>
        </div>

        {/* Controls (uniform circular badges; min 20px gap from title; right pr-3 for symmetric edge padding) */}
        <div className="flex items-center gap-1 ml-5 pr-3">
          {/* Resolve → Resolved zone */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => moveToZone(e, 'resolved')}
            className="p-1 rounded transition-colors hover:bg-green-100"
            aria-label="Move to Resolved"
            title="Move to Resolved"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
              <Check className="w-3 h-3" />
            </span>
          </button>

          {/* Unresolved → Unresolved zone */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => moveToZone(e, 'unresolved')}
            className="p-1 rounded transition-colors hover:bg-red-100"
            aria-label="Move to Unresolved"
            title="Move to Unresolved"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white">
              <X className="w-3 h-3" />
            </span>
          </button>

          {/* Parking Lot → Parking zone */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => moveToZone(e, 'parking')}
            className="p-1 rounded transition-colors hover:bg-gray-100"
            aria-label="Move to Parking Lot"
            title="Move to Parking Lot"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-700 text-white">
              <Timer className="w-3 h-3" />
            </span>
          </button>

          {/* Unstack (only when stacked & not base) */}
          {isStacked && stackPosition > 0 && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleUnstack}
              className="p-1 rounded transition-colors hover:bg-gray-200/50"
              aria-label="Unstack card"
              title="Separate from stack"
            >
              <Layers className="w-3 h-3" />
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(card.id);
            }}
            className="p-1 rounded transition-colors hover:bg-red-200/50"
            aria-label="Delete card"
            title="Delete"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* CONTENT — grows as needed; preserved line breaks */}
      <div className="flex-1 px-3 py-4">
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              'w-full p-2 text-lg rounded border text-center',
              'focus:outline-none focus:ring-1 bg-white/80',
              'whitespace-pre-wrap break-words',
              'resize-none overflow-hidden',
              cardTypeCfg.borderColor
            )}
            rows={3}
            placeholder="Enter card content..."
          />
        ) : (
          <div
            className="text-lg leading-snug text-center whitespace-pre-wrap break-words cursor-text"
            onDoubleClick={handleEdit}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {content ? (
              content
            ) : (
              <span className="text-gray-400 italic">Double-click to add content...</span>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="h-10 px-3 border-t border-gray-200 bg-white/70 text-xs text-gray-500 leading-none">
        <div className="h-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 min-w-0 max-w-[60%]">
            {createdAtFormatted && (
              <>
                <CalendarIcon className="w-4 h-4 shrink-0" />
                <span className="truncate" title={createdAtFormatted}>
                  {createdAtFormatted}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 min-w-0 max-w-[38%]">
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="truncate" title={String(createdBy)}>
              {String(createdBy)}
            </span>
          </div>
        </div>
      </div>

      {/* STACK BADGE */}
      {isStacked && stackPosition > 0 && (
        <div
          className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm font-medium z-50 pointer-events-none"
          title={`Stack position ${stackPosition + 1}`}
        >
          {stackPosition + 1}
        </div>
      )}
    </div>
  );
}