/**
 * ConversationCard
 * - Dark-mode placeholder text now uses high-contrast colors across all types
 * - MAX_CARD_WIDTH = 250
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
  UserPlus,
  MoreVertical,
} from 'lucide-react';
import { CARD_TYPES, CARD_DIMENSIONS } from '@/lib/utils/constants';
import { 
  CARD_RESPONSIVE_WIDTHS,
  CARD_HEIGHTS,
  CARD_LAYOUT,
  CARD_CONTROL_RAIL,
  UI_HEIGHTS,
  BREAKPOINTS,
  getResponsiveCardWidth,
  getResponsiveCardHeights,
  getControlRailDimensions,
  getMinRailHeight,
  getBaseMinCardHeight
} from '@/lib/utils/ui-constants';
import { cn } from '@/lib/utils';
import { ProfilePicture } from '@/components/ui/profile-picture';

// Use centralized UI constants - keeping legacy functions for compatibility
const getControlRailWidth = (screenWidth) => getControlRailDimensions(screenWidth).width;
const getRailBtnSize = (screenWidth) => getControlRailDimensions(screenWidth).buttonSize;
const getHeaderMinHeight = (screenWidth) => getResponsiveCardHeights(screenWidth).header;
const getFooterMinHeight = (screenWidth) => getResponsiveCardHeights(screenWidth).footer;

// Current breakpoint-based widths (will be dynamically set based on screen size)
const MIN_CARD_WIDTH = Math.max(CARD_DIMENSIONS?.width ?? 320, CARD_LAYOUT.minCoreWidth);

// Default max width (will be overridden by responsive logic)
const MAX_CARD_WIDTH = CARD_LAYOUT.maxWidth;

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

// Custom hook for responsive card sizing
function useResponsiveCardWidth() {
  const [screenSize, setScreenSize] = useState('desktop');
  const [screenWidth, setScreenWidth] = useState(BREAKPOINTS.desktop);
  
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      
      if (width < BREAKPOINTS.mobile) {
        setScreenSize('mobile');
      } else if (width < BREAKPOINTS.desktop) {
        setScreenSize('tablet');  
      } else if (width < BREAKPOINTS.large) {
        setScreenSize('desktop');
      } else {
        setScreenSize('large');
      }
    };

    // Set initial size
    updateScreenSize();
    
    // Listen for resize events
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return {
    ...CARD_RESPONSIVE_WIDTHS[screenSize],
    screenWidth,
    railWidth: getControlRailWidth(screenWidth)
  };
}

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
  const [showAssignmentMenu, setShowAssignmentMenu] = useState(false);
  const [showControlMenu, setShowControlMenu] = useState(false);
  const inputRef = useRef(null);
  const controlMenuRef = useRef(null);
  
  // Get responsive card dimensions
  const responsiveWidth = useResponsiveCardWidth();
  const CONTROL_RAIL_WIDTH = responsiveWidth.railWidth;
  const RAIL_BTN_SIZE = getRailBtnSize(responsiveWidth.screenWidth);

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
    minWidth: responsiveWidth.min,
    width: 'max-content',
    maxWidth: responsiveWidth.max,
    minHeight: getBaseMinCardHeight(responsiveWidth.screenWidth),
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

  // Close assignment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAssignmentMenu && !event.target.closest('.assignment-menu-container')) {
        setShowAssignmentMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAssignmentMenu]);

  // Close control menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controlMenuRef.current && !controlMenuRef.current.contains(event.target)) {
        setShowControlMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moveToZone = async (targetZone) => {
    if (!targetZone || targetZone === zoneId) return;
    await onUpdate?.(card.id, {
      zone: targetZone,
      stackOrder: 0,
      position: card.position ?? { x: 10, y: 60 },
      updatedAt: Date.now(),
    });
  };

  const handleAssignUser = async (userId) => {
    setShowAssignmentMenu(false);
    setShowControlMenu(false);
    await onUpdate?.(card.id, {
      assignedToUserId: userId === 'none' ? null : userId,
      updatedAt: Date.now(),
    });
  };

  const createdTs = card.createdAt ?? Date.now();
  const dateText = useMemo(() => {
    try {
      return new Date(createdTs).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
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
    getBaseMinCardHeight(responsiveWidth.screenWidth) - 
    getHeaderMinHeight(responsiveWidth.screenWidth) - 
    getFooterMinHeight(responsiveWidth.screenWidth) - 
    CARD_LAYOUT.contentPadding
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
      {/* Right rail controls - Responsive: Full rail on large screens, collapsed menu on small */}
      {responsiveWidth.screenWidth >= 640 ? (
        // Full control rail for larger screens
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
          <CloseIcon className={responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Move to Resolved"
          title="Resolve"
          className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-sm"
          onClick={() => moveToZone('resolved')}
        >
          <ThumbsUp className={responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Move to Unresolved"
          title="Mark Unresolved"
          className="rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sm"
          onClick={() => moveToZone('unresolved')}
        >
          <ThumbsDown className={responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Move to Parking Lot"
          title="Parking Lot"
          className="rounded-full bg-slate-700 hover:bg-slate-800 text-white shadow-sm"
          onClick={() => moveToZone('parking')}
        >
          <Timer className={responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
        </Button>

        {/* User Assignment Button */}
        <div className="relative assignment-menu-container">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Assign User"
            title={assignedToUser ? `Assigned to: ${assignedToUser.name}` : "Assign to user"}
            className={cn(
              "rounded-full shadow-sm",
              assignedToUser 
                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                : "bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
            )}
            onClick={() => setShowAssignmentMenu(!showAssignmentMenu)}
          >
            <UserPlus className={responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
          
          {/* Assignment Dropdown */}
          {showAssignmentMenu && (
            <div className="absolute top-0 right-10 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[160px]">
              <div className="p-1">
                {/* No assignment option */}
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                  onClick={() => handleAssignUser('none')}
                >
                  <span className="text-gray-500">No assignment</span>
                </button>
                
                {/* User options */}
                {users.map((user) => (
                  <button
                    key={user.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2"
                    onClick={() => handleAssignUser(user.id)}
                  >
                    <ProfilePicture
                      src={user.profilePicture}
                      name={user.name}
                      size="xs"
                    />
                    <span>{user.name}</span>
                    {user.isSystemUser && <span className="text-xs opacity-60">(System)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      ) : (
        // Collapsed control menu for small screens
        <div
          ref={controlMenuRef}
          className="absolute top-2 right-2"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="icon"
            variant="ghost"
            aria-label="Card actions"
            title="Card actions"
            className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
            onClick={() => setShowControlMenu(!showControlMenu)}
          >
            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </Button>

          {/* Collapsed Control Menu */}
          {showControlMenu && (
            <div className="absolute top-10 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[160px]">
              <div className="p-1">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2"
                  onClick={() => {
                    onDelete?.(card.id);
                    setShowControlMenu(false);
                  }}
                >
                  <CloseIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  Delete
                </button>

                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2"
                  onClick={() => {
                    moveToZone('resolved');
                    setShowControlMenu(false);
                  }}
                >
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  Mark Resolved
                </button>

                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2"
                  onClick={() => {
                    moveToZone('unresolved');
                    setShowControlMenu(false);
                  }}
                >
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  Mark Unresolved
                </button>

                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2"
                  onClick={() => {
                    moveToZone('parking');
                    setShowControlMenu(false);
                  }}
                >
                  <Timer className="w-4 h-4 text-slate-600" />
                  Move to Parking Lot
                </button>

                {/* Separator */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

                {/* User Assignment in Menu */}
                {assignedToUser ? (
                  <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2 mb-2">
                      <ProfilePicture
                        src={assignedToUser.profilePicture}
                        name={assignedToUser.name}
                        size="xs"
                      />
                      <span className="font-medium">
                        Assigned to: {assignedToUser.name}
                        {assignedToUser.isSystemUser && <span className="opacity-60"> (System)</span>}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No assignment
                  </div>
                )}

                {/* Assignment options */}
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                  onClick={() => handleAssignUser('none')}
                >
                  Clear assignment
                </button>

                {users.map((user) => (
                  <button
                    key={user.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm flex items-center gap-2"
                    onClick={() => handleAssignUser(user.id)}
                  >
                    <ProfilePicture
                      src={user.profilePicture}
                      name={user.name}
                      size="xs"
                    />
                    <span>Assign to: {user.name}</span>
                    {user.isSystemUser && <span className="text-xs opacity-60">(System)</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header (drag handle) */}
      <div
        className="flex items-center justify-between pl-2 pr-2 pt-2"
        style={{ paddingRight: CONTROL_RAIL_WIDTH + (responsiveWidth.screenWidth < BREAKPOINTS.mobile ? 6 : 8), minHeight: getHeaderMinHeight(responsiveWidth.screenWidth) }}
        {...dragHandleProps}
      >
        <div className="flex items-center gap-2">
          <GripVertical className={`${responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} text-gray-500 dark:text-gray-400`} />
          <span className="font-extrabold tracking-wide text-gray-900 dark:text-gray-100 text-sm sm:text-base lg:text-lg">
            {TYPE_LABEL[typeKey] || 'TOPIC'}
          </span>
        </div>
        <div className="w-4 h-4" />
      </div>

      {/* Content - Responsive padding */}
      <div
        className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 flex-1"
        style={{
          paddingRight: CONTROL_RAIL_WIDTH + (responsiveWidth.screenWidth < BREAKPOINTS.mobile ? 6 : 12),
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
                'w-full max-w-[46ch] p-1 sm:p-2 text-sm sm:text-base rounded-md border resize-none',
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
            <div className="w-full max-w-[46ch] text-sm sm:text-base lg:text-lg text-center leading-relaxed whitespace-pre-wrap break-words px-1 sm:px-2 text-gray-800 dark:text-gray-100">
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

      {/* Footer - Responsive padding */}
      <div
        className="px-2 sm:px-3 pb-2 sm:pb-3 pt-1 text-sm mt-auto"
        style={{ paddingRight: CONTROL_RAIL_WIDTH + (responsiveWidth.screenWidth < BREAKPOINTS.mobile ? 6 : 8), minHeight: getFooterMinHeight(responsiveWidth.screenWidth) }}
      >
        <div className="flex flex-col items-start gap-1 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className={`${responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} text-gray-500 dark:text-gray-400`} />
            <span className={responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "text-[10px]" : "text-[12px]"}>{dateText}</span>
          </div>
          
          {/* Created by user */}
          <div className="flex items-center gap-2">
            {createdByUser ? (
              <ProfilePicture
                src={createdByUser.profilePicture}
                name={createdByUser.name}
                size="xs"
              />
            ) : (
              <User className={`${responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} text-gray-500 dark:text-gray-400`} />
            )}
            <span className={responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "text-[10px]" : "text-[12px]"}>
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
              <ProfilePicture
                src={assignedToUser.profilePicture}
                name={assignedToUser.name}
                size="xs"
              />
              <span className={responsiveWidth.screenWidth < BREAKPOINTS.mobile ? "text-[10px]" : "text-[12px]"}>
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