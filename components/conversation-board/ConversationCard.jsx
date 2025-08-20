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
  MoreVertical,
} from 'lucide-react';
import { CARD_TYPES, CARD_DIMENSIONS, getTypeColors } from '@/lib/utils/card-type-constants';
import { 
  CARD_RESPONSIVE_WIDTHS,
  CARD_LAYOUT,
  BREAKPOINTS,
  getResponsiveCardWidth,
  getResponsiveCardHeights,
  getControlRailDimensions,
  getBaseMinCardHeight
} from '@/lib/utils/ui-constants';
import { cn } from '@/lib/utils';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { FlippableCard } from './FlippableCard';

// Use centralized UI constants - keeping legacy functions for compatibility
const getControlRailWidth = (screenWidth) => getControlRailDimensions(screenWidth).width;
const getRailBtnSize = (screenWidth) => getControlRailDimensions(screenWidth).buttonSize;
const getHeaderMinHeight = (screenWidth) => getResponsiveCardHeights(screenWidth).header;
const getFooterMinHeight = (screenWidth) => getResponsiveCardHeights(screenWidth).footer;

// Current breakpoint-based widths (will be dynamically set based on screen size)
const MIN_CARD_WIDTH = Math.max(CARD_DIMENSIONS?.width ?? 320, CARD_LAYOUT.minCoreWidth);

// Default max width (will be overridden by responsive logic)
const MAX_CARD_WIDTH = CARD_LAYOUT.maxWidth;


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

    updateScreenSize();
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
  animationsEnabled = true,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(card.content ?? '');
  const [showControlMenu, setShowControlMenu] = useState(false);
  const inputRef = useRef(null);
  const controlMenuRef = useRef(null);
  
  // Get responsive card dimensions
  const responsiveWidth = useResponsiveCardWidth();
  const CONTROL_RAIL_WIDTH = responsiveWidth.railWidth;
  const RAIL_BTN_SIZE = getRailBtnSize(responsiveWidth.screenWidth);

  const cardType = getTypeColors(card.type);

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
    height: 'auto',
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
    setShowControlMenu(false);
    await onUpdate?.(card.id, {
      assignedToUserId: userId === 'none' ? null : userId,
      updatedAt: Date.now(),
    });
  };

  const createdTs = card.createdAt ?? Date.now();
  const dateText = useMemo(() => {
    try {
      const date = new Date(createdTs);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month}/${day}/${year}, ${hours}:${minutes}`;
    } catch {
      return '';
    }
  }, [createdTs]);

  // Helper functions to get user information
  const getUser = (userId) => {
    if (!userId) return null;
    
    // Check if it's a guest user ID (ensure userId is a string)
    // Handle both 'guest' and 'guest_xxxxx' formats
    if (typeof userId === 'string' && (userId === 'guest' || userId.startsWith('guest_'))) {
      // Return a standard guest user object
      return {
        id: userId,
        name: 'Guest User',
        isGuest: true,
        profilePicture: null, // Will use default icon
        isSystemUser: false
      };
    }
    
    // Try to find in users array
    const foundUser = users.find(user => user.id === userId);
    return foundUser || null;
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

  // Helper function for delete
  const handleDelete = () => onDelete?.(card.id);
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <FlippableCard
        card={card}
        animationsEnabled={animationsEnabled}
        screenWidth={responsiveWidth.screenWidth}
        // Stack props
        isStacked={isStacked}
        stackPosition={stackPosition}
        // Props for CardFace
        isEditing={isEditing}
        content={content}
        setContent={setContent}
        handleEdit={handleEdit}
        handleSave={handleSave}
        handleKeyDown={handleKeyDown}
        handleDelete={handleDelete}
        handleAssignUser={handleAssignUser}
        moveToZone={moveToZone}
        dragHandleProps={dragHandleProps}
        users={users}
        controlRailWidth={CONTROL_RAIL_WIDTH}
        contentMinHeight={CONTENT_MIN_HEIGHT}
        dateText={dateText}
        createdByUser={createdByUser}
        assignedToUser={assignedToUser}
        inputRef={inputRef}
        typeColors={cardType}
        style={{ 
          minWidth: responsiveWidth.min,
          maxWidth: responsiveWidth.max,
          minHeight: getBaseMinCardHeight(responsiveWidth.screenWidth)
        }}
      />
    </div>
  );
}