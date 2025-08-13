/**
 * ConversationCard
 * Fixes:
 * - Stack number badge moved to top-right and kept inside the card (no clipping)
 */

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  X as CloseIcon,
  ThumbsUp,
  ThumbsDown,
  Timer,
  Calendar,
  User
} from 'lucide-react';
import { CARD_TYPES, CARD_DIMENSIONS } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';

const CONTROL_RAIL_WIDTH = 44;
const RAIL_BTN_SIZE = 36;
const RAIL_GAP = 8;
const RAIL_TOP_BOTTOM = 8;
const RAIL_BUTTON_COUNT = 4;
const RAIL_MIN_HEIGHT =
  RAIL_TOP_BOTTOM * 2 +
  RAIL_BTN_SIZE * RAIL_BUTTON_COUNT +
  RAIL_GAP * (RAIL_BUTTON_COUNT - 1);

const HEADER_MIN = 44;
const FOOTER_MIN = 46;
const BASE_MIN_CARD_HEIGHT = Math.max(
  CARD_DIMENSIONS?.height ?? 140,
  RAIL_MIN_HEIGHT + HEADER_MIN + FOOTER_MIN
);
const MIN_CARD_WIDTH = Math.max(CARD_DIMENSIONS?.width ?? 280, 300);
const MAX_CARD_WIDTH = 480;

const TYPE_LABEL = {
  topic: 'TOPIC',
  conversation: 'TOPIC',
  conversation_topic: 'TOPIC',
  question: 'QUESTION',
  open_question: 'QUESTION',
  'open-question': 'QUESTION',
  accusation: 'ACCUSATION',
  claim: 'ACCUSATION',
  allegation: 'ACCUSATION',
  fact: 'FACT',
  factual: 'FACT',
  factual_statement: 'FACT',
  'factual-statement': 'FACT',
  objective_fact: 'FACT',
  'objective-fact': 'FACT',
  objective: 'FACT',
  statement: 'FACT',
};

export function ConversationCard({
  card,
  onUpdate,
  onDelete,
  isStacked = false,
  stackPosition = 0,
  zoneId,
  draggableEnabled = true,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(card.content ?? '');
  const inputRef = useRef(null);

  const typeKey = card.type || 'topic';
  const cardType = CARD_TYPES[typeKey] || CARD_TYPES.topic;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !draggableEnabled,
    data: { type: 'card', card, fromZone: zoneId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    position: isStacked ? 'relative' : 'relative',
    zIndex: isDragging ? 1000 : (isStacked ? stackPosition + 1 : 1),
    opacity: isDragging ? 0 : 1,
    minWidth: MIN_CARD_WIDTH,
    width: 'max-content',
    maxWidth: MAX_CARD_WIDTH,
    minHeight: BASE_MIN_CARD_HEIGHT,
    transition: isDragging ? 'none' : 'box-shadow 150ms ease, border-color 150ms ease',
    willChange: isDragging ? 'transform' : 'auto',
    contain: 'layout paint style',
  };

  const dragHandleProps = draggableEnabled ? listeners : {};

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    if ((card.content ?? '') !== content) {
      await onUpdate?.(card.id, { content });
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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const moveToZone = async (targetZone) => {
    if (!targetZone || targetZone === zoneId) return;
    await onUpdate?.(card.id, {
      zone: targetZone,
      stackOrder: 0,
      position: card.position ?? { x: 10, y: 60 },
      updatedAt: Date.now(),
    });
  };

  const createdTs = card.createdAt ?? Date.now();
  const dateText = useMemo(() => {
    try {
      return new Date(createdTs).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  }, [createdTs]);

  const person = (card.person && String(card.person).trim()) || 'system';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-xl border-2 shadow-sm bg-white flex flex-col',
        cardType?.borderColor,
        cardType?.color,
        cardType?.textColor
      )}
      {...attributes}
    >
      {/* Right-side rail */}
      <div
        className="absolute top-2 right-2 flex flex-col items-center gap-2"
        style={{ width: CONTROL_RAIL_WIDTH }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete card"
          title="Delete"
          className="rounded-md border bg-white hover:bg-gray-50 text-gray-700"
          onClick={() => onDelete?.(card.id)}
        >
          <CloseIcon className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Move to Resolved"
          title="Resolve"
          className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-sm"
          onClick={() => moveToZone('resolved')}
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Move to Unresolved"
          title="Mark Unresolved"
          className="rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm"
          onClick={() => moveToZone('unresolved')}
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Move to Parking Lot"
          title="Parking Lot"
          className="rounded-full bg-slate-700 hover:bg-slate-800 text-white shadow-sm"
          onClick={() => moveToZone('parking')}
        >
          <Timer className="w-4 h-4" />
        </Button>
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between pl-2 pr-2 pt-2"
        style={{ paddingRight: CONTROL_RAIL_WIDTH + 8 }}
        {...dragHandleProps}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-500" />
          <span className="font-extrabold tracking-wide text-gray-800 text-lg">
            {TYPE_LABEL[typeKey] || 'TOPIC'}
          </span>
        </div>
        <div className="w-4 h-4" />
      </div>

      {/* Content */}
      <div
        className="px-4 py-3 flex-1"
        style={{ paddingRight: CONTROL_RAIL_WIDTH + 12 }}
        onDoubleClick={handleEdit}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'w-full p-2 text-base rounded-md border resize-none',
              'focus:outline-none focus:ring-1 bg-white/90',
              cardType?.borderColor
            )}
            rows={4}
            placeholder="Enter card content..."
          />
        ) : (
          <div className="text-lg text-gray-700 text-center min-h-[56px] leading-relaxed break-words px-2">
            {card.content && card.content.trim().length > 0 ? (
              card.content
            ) : (
              <span className="text-gray-400 italic">Double-click to add content...</span>
            )}
          </div>
        )}
      </div>

      {/* Footer (stacked vertically; anchored bottom) */}
      <div
        className="px-3 pb-3 pt-1 text-sm text-gray-700 mt-auto"
        style={{ paddingRight: CONTROL_RAIL_WIDTH + 8 }}
      >
        <div className="flex flex-col items-start gap-1 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-[12px]">{dateText}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-[12px] capitalize">{person}</span>
          </div>
        </div>
      </div>

      {/* Stack index badge (top-right, inside card, never clipped) */}
      {isStacked && stackPosition > 0 && (
        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm font-medium pointer-events-none z-10">
          {stackPosition + 1}
        </div>
      )}
    </div>
  );
}