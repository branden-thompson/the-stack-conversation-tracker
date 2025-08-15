/**
 * ConversationCard
 * - Dark-mode placeholder text now uses high-contrast colors across all types
 * - MAX_CARD_WIDTH = 340
 * - Preserves drag, stacking visuals, centered content, footer anchoring
 * - Displays user relationships (created by, assigned to) in footer
 * - Supports both new user system and legacy person field for backward compatibility
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
  User,
  UserCheck,
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

const HEADER_MIN = 48;
const FOOTER_MIN = 50;
const CONTENT_VERTICAL_PADDING = 24;

const BASE_MIN_CARD_HEIGHT = Math.max(
  CARD_DIMENSIONS?.height ?? 160,
  RAIL_MIN_HEIGHT + HEADER_MIN + FOOTER_MIN
);

const MIN_CARD_CORE_WIDTH = 340;
const MIN_CARD_WIDTH = Math.max(CARD_DIMENSIONS?.width ?? 320, MIN_CARD_CORE_WIDTH);

// fixed per your preference
const MAX_CARD_WIDTH = 340;

/** Labels */
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
  guess: 'GUESS',
  opinion: 'OPINION',
};

export function ConversationCard({
  card,
  onUpdate,
  onDelete,
  isStacked = false,
  stackPosition = 0,
  zoneId,
  draggableEnabled = true,
  // User context for display
  users = [],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(card.content ?? '');
  const inputRef = useRef(null);

  const typeKey = card.type || 'topic';
  const cardType = CARD_TYPES[typeKey] || CARD_TYPES.topic;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !draggableEnabled,
    data: { type: 'card', card, fromZone: zoneId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    position: isStacked ? 'relative' : 'relative',
    zIndex: isDragging ? 1000 : isStacked ? stackPosition + 1 : 1,
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
        hour12: true,
      });
    } catch {
      return '';
    }
  }, [createdTs]);

  // Helper functions to get user information
  const getUser = (userId) => {
    if (!userId) return null;
    return users.find(user => user.id === userId) || null;
  };

  const createdByUser = getUser(card.createdByUserId);
  const assignedToUser = getUser(card.assignedToUserId);
  
  // Fallback to old person field for cards created before user system
  const legacyPerson = (card.person && String(card.person).trim()) || null;
  
  const CONTENT_MIN_HEIGHT = Math.max(
    0,
    BASE_MIN_CARD_HEIGHT - HEADER_MIN - FOOTER_MIN - CONTENT_VERTICAL_PADDING
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-xl border-2 shadow-sm',
        'flex flex-col',
        cardType?.container // per-type colors (light + dark)
      )}
      {...attributes}
    >
      {/* Right rail controls */}
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
          className="rounded-md border bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
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

      {/* Header (drag handle) */}
      <div
        className="flex items-center justify-between pl-2 pr-2 pt-2"
        style={{ paddingRight: CONTROL_RAIL_WIDTH + 8, minHeight: HEADER_MIN }}
        {...dragHandleProps}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="font-extrabold tracking-wide text-gray-900 dark:text-gray-100 text-lg">
            {TYPE_LABEL[typeKey] || 'TOPIC'}
          </span>
        </div>
        <div className="w-4 h-4" />
      </div>

      {/* Content */}
      <div
        className="px-4 py-3 flex-1"
        style={{
          paddingRight: CONTROL_RAIL_WIDTH + 12,
          minHeight: CONTENT_MIN_HEIGHT,
        }}
        onDoubleClick={handleEdit}
      >
        <div className="w-full h-full flex items-center justify-center">
          {isEditing ? (
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'w-full max-w-[46ch] p-2 text-base rounded-md border resize-none',
                'focus:outline-none focus:ring-1',
                // Light mode input
                'bg-white/90 border-gray-300 text-gray-800',
                // Dark mode input with readable placeholder
                'dark:bg-gray-900/90 dark:border-gray-700 dark:text-gray-100',
                'whitespace-pre-wrap break-words'
              )}
              rows={4}
              style={{ maxHeight: '60vh' }}
              placeholder="Enter card content..."
            />
          ) : (
            <div className="w-full max-w-[46ch] text-lg text-center leading-relaxed whitespace-pre-wrap break-words px-2 text-gray-800 dark:text-gray-100">
              {content && content.trim().length > 0 ? (
                content
              ) : (
                // HIGH-CONTRAST placeholder in dark mode
                <span className="italic text-gray-400 dark:text-gray-200/90">
                  Double-click to add content...
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-3 pb-3 pt-1 text-sm mt-auto"
        style={{ paddingRight: CONTROL_RAIL_WIDTH + 8, minHeight: FOOTER_MIN }}
      >
        <div className="flex flex-col items-start gap-1 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-[12px]">{dateText}</span>
          </div>
          
          {/* Created by user */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-[12px]">
              Created by: {createdByUser ? (
                <span className="font-medium">
                  {createdByUser.name}
                  {createdByUser.isSystemUser && <span className="opacity-60"> (System)</span>}
                </span>
              ) : legacyPerson ? (
                <span className="capitalize font-medium">{legacyPerson}</span>
              ) : (
                <span className="opacity-60">Unknown</span>
              )}
            </span>
          </div>

          {/* Assigned to user (if exists) */}
          {assignedToUser && (
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-[12px]">
                Assigned to: <span className="font-medium">
                  {assignedToUser.name}
                  {assignedToUser.isSystemUser && <span className="opacity-60"> (System)</span>}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stack index */}
      {isStacked && stackPosition > 0 && (
        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm font-medium pointer-events-none z-10">
          {stackPosition + 1}
        </div>
      )}
    </div>
  );
}