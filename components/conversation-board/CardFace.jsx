/**
 * CardFace Component
 * The front face of a conversation card - essentially the current ConversationCard view
 * This will be extracted from ConversationCard to allow for flip functionality
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  X as CloseIcon,
  ThumbsUp,
  ThumbsDown,
  Timer,
  Calendar,
  RotateCw, // Flip icon
  MessageCirclePlus,
  MessageCircleQuestion,
  Puzzle,
  Speech,
  Shield,
  Sword,
} from 'lucide-react';
import { 
  BREAKPOINTS,
  getResponsiveCardHeights,
  getControlRailDimensions,
} from '@/lib/utils/ui-constants';
import { getTypeLabel, getCardTextStyle, CARD_TEXT_STYLES } from '@/lib/utils/card-type-constants';
import { cn } from '@/lib/utils';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';


/**
 * Helper function to get the appropriate icon for each card type
 */
function getCardTypeIcon(cardType) {
  const type = cardType?.toLowerCase() || 'topic';
  
  switch (type) {
    case 'topic':
      return MessageCirclePlus;
    case 'question':
      return MessageCircleQuestion;
    case 'guess':
      return Puzzle;
    case 'opinion':
      return Speech;
    case 'fact':
      return Shield;
    case 'accusation':
      return Sword;
    default:
      return MessageCirclePlus; // Default to topic icon
  }
}

export function CardFace({
  card,
  isEditing,
  content,
  setContent,
  handleEdit,
  handleSave,
  handleKeyDown,
  handleDelete,
  moveToZone,
  onFlip, // New prop for flip functionality
  dragHandleProps,
  users = [],
  screenWidth,
  controlRailWidth,
  contentMinHeight,
  dateText,
  createdByUser,
  inputRef,
}) {
  const typeKey = card?.type?.toLowerCase() || 'topic';
  const headerMinHeight = getResponsiveCardHeights(screenWidth).header;
  const footerMinHeight = getResponsiveCardHeights(screenWidth).footer;
  const railBtnSize = getControlRailDimensions(screenWidth).buttonSize;
  
  // Get dynamic theme
  const dynamicTheme = useDynamicAppTheme();
  
  return (
    <div className="relative w-full h-full flex flex-col overflow-visible">
      {/* Control rail (right side) */}
      <div
        className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2 px-1 overflow-hidden z-50"
        style={{ width: controlRailWidth }}
      >
        <div className="flex flex-col gap-2">
          {/* Close/Delete button */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-red-500/10 dark:hover:bg-red-500/20"
            onClick={handleDelete}
            style={{ width: railBtnSize, height: railBtnSize }}
          >
            <CloseIcon className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
          
          {/* Flip button - NEW */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-purple-500/10 dark:hover:bg-purple-500/20"
            onClick={onFlip}
            title="Flip card"
            style={{ width: railBtnSize, height: railBtnSize }}
          >
            <RotateCw className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-green-500/10 dark:hover:bg-green-500/20"
            onClick={() => moveToZone?.('resolved')}
            title="Move to Resolved"
            style={{ width: railBtnSize, height: railBtnSize }}
          >
            <ThumbsUp className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-red-500/10 dark:hover:bg-red-500/20"
            onClick={() => moveToZone?.('unresolved')}
            title="Move to Unresolved"
            style={{ width: railBtnSize, height: railBtnSize }}
          >
            <ThumbsDown className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-yellow-500/10 dark:hover:bg-yellow-500/20"
            onClick={() => moveToZone?.('parking')}
            title="Move to Parking Lot"
            style={{ width: railBtnSize, height: railBtnSize }}
          >
            <Timer className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
          </Button>
        </div>
        
      </div>
      
      {/* Header (drag handle) */}
      <div
        className="flex items-center justify-between pl-2 pr-2 pt-2"
        style={{ paddingRight: controlRailWidth + (screenWidth < BREAKPOINTS.mobile ? 6 : 8), minHeight: headerMinHeight }}
        {...dragHandleProps}
      >
        <div className="flex items-center gap-2">
          {(() => {
            const IconComponent = getCardTypeIcon(card?.type);
            return <IconComponent className={`w-[24px] h-[24px] ${dynamicTheme.colors.text.primary}`} />;
          })()}
          <span className={`font-extrabold tracking-wide ${dynamicTheme.colors.text.primary} text-sm sm:text-base lg:text-lg`}>
            {getTypeLabel(card?.type)}
          </span>
        </div>
        <div className="w-4 h-4" />
      </div>
      
      {/* Content */}
      <div
        className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 flex-1"
        style={{
          paddingRight: controlRailWidth + (screenWidth < BREAKPOINTS.mobile ? 6 : 12),
          minHeight: contentMinHeight,
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
                dynamicTheme.colors.background.secondary,
                dynamicTheme.colors.border.primary,
                dynamicTheme.colors.text.primary,
                'whitespace-pre-wrap break-words'
              )}
              rows={4}
              style={{ maxHeight: '60vh' }}
              placeholder="Enter card content..."
            />
          ) : (
            <div className={`w-full max-w-[46ch] ${CARD_TEXT_STYLES.content.text} text-center leading-relaxed whitespace-pre-wrap break-words px-1 sm:px-2 ${CARD_TEXT_STYLES.content.color}`}>
              {content && content.trim().length > 0 ? (
                content
              ) : (
                <span className={CARD_TEXT_STYLES.content.placeholder}>
                  Double-click to add content...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div
        className="px-2 sm:px-3 pb-2 sm:pb-3 pt-1 text-sm mt-auto"
        style={{ 
          paddingRight: controlRailWidth + (screenWidth < BREAKPOINTS.mobile ? 6 : 8), 
          minHeight: footerMinHeight
        }}
      >
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <Calendar className={`${screenWidth < BREAKPOINTS.mobile ? CARD_TEXT_STYLES.icons.calendar.mobile : CARD_TEXT_STYLES.icons.calendar.desktop} ${CARD_TEXT_STYLES.icons.calendar.color}`} />
            <span className={getCardTextStyle('footer.date', screenWidth)}>{dateText}</span>
          </div>
          
          {/* User info */}
          <div className="flex flex-col gap-1">
            {createdByUser && (
              <div className="flex items-center gap-2">
                <ProfilePicture
                  src={createdByUser.profilePicture}
                  name={createdByUser.name}
                  size="xs"
                  className="ring-1 ring-gray-200 dark:ring-gray-700"
                />
                <span className={getCardTextStyle('footer.createdBy', screenWidth)}>
                  Author: {createdByUser.name}
                </span>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}