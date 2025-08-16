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
  UserCheck,
  UserPlus,
  RotateCw, // Flip icon
} from 'lucide-react';
import { 
  BREAKPOINTS,
  getResponsiveCardHeights,
  getControlRailDimensions,
} from '@/lib/utils/ui-constants';
import { getTypeLabel } from '@/lib/utils/card-type-constants';
import { cn } from '@/lib/utils';
import { ProfilePicture } from '@/components/ui/profile-picture';

/**
 * Helper function to get the next user in the assignment cycle
 * Cycles through: none -> user1 -> user2 -> ... -> none
 */
function getNextAssignedUser(currentUser, users) {
  if (!currentUser) {
    // If no one assigned, assign to first user
    if (users.length > 0) {
      return users[0].id;
    }
    return null;
  }
  
  // Find current user index
  const currentIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (currentIndex === users.length - 1) {
    // If last user, clear assignment
    return 'none';
  } else if (currentIndex >= 0) {
    // Assign to next user
    return users[currentIndex + 1].id;
  }
  
  // Fallback: clear assignment
  return 'none';
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
  handleAssignUser,
  moveToZone,
  onFlip, // New prop for flip functionality
  dragHandleProps,
  users = [],
  screenWidth,
  controlRailWidth,
  contentMinHeight,
  dateText,
  createdByUser,
  assignedToUser,
  inputRef,
}) {
  const typeKey = card?.type?.toLowerCase() || 'topic';
  const headerMinHeight = getResponsiveCardHeights(screenWidth).header;
  const footerMinHeight = getResponsiveCardHeights(screenWidth).footer;
  const railBtnSize = getControlRailDimensions(screenWidth).buttonSize;
  
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
        
        {/* Assignment button - cycles through users */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-blue-500/10 dark:hover:bg-blue-500/20"
            onClick={() => {
              const nextUserId = getNextAssignedUser(assignedToUser, users);
              if (nextUserId !== null) {
                handleAssignUser(nextUserId);
              }
            }}
            style={{ width: railBtnSize, height: railBtnSize }}
            title={assignedToUser ? `Assigned to: ${assignedToUser.name}\nClick to change` : 'Click to assign user'}
          >
            {assignedToUser ? (
              <UserCheck className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
            ) : (
              <UserPlus className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
            )}
          </Button>
          
          {/* Tooltip showing current assignment - positioned to the left to avoid clipping */}
          {assignedToUser && (
            <div className="absolute bottom-full right-full mr-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {assignedToUser.name}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Header (drag handle) */}
      <div
        className="flex items-center justify-between pl-2 pr-2 pt-2"
        style={{ paddingRight: controlRailWidth + (screenWidth < BREAKPOINTS.mobile ? 6 : 8), minHeight: headerMinHeight }}
        {...dragHandleProps}
      >
        <div className="flex items-center gap-2">
          <GripVertical className={`${screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} text-gray-500 dark:text-gray-400`} />
          <span className="font-extrabold tracking-wide text-gray-900 dark:text-gray-100 text-sm sm:text-base lg:text-lg">
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
                'bg-white/90 border-gray-300 text-gray-800',
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
        className="px-2 sm:px-3 pb-2 sm:pb-3 pt-1 text-sm mt-auto"
        style={{ paddingRight: controlRailWidth + (screenWidth < BREAKPOINTS.mobile ? 6 : 8), minHeight: footerMinHeight }}
      >
        <div className="flex flex-col items-start gap-1 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className={`${screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} text-gray-500 dark:text-gray-400`} />
            <span className={screenWidth < BREAKPOINTS.mobile ? "text-[10px]" : "text-[12px]"}>{dateText}</span>
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
                <span className={`${screenWidth < BREAKPOINTS.mobile ? "text-[10px]" : "text-[11px]"} text-gray-600 dark:text-gray-400`}>
                  Created by: {createdByUser.name}
                </span>
              </div>
            )}
            
            {assignedToUser && (
              <div className="flex items-center gap-2">
                <ProfilePicture
                  src={assignedToUser.profilePicture}
                  name={assignedToUser.name}
                  size="xs"
                  className="ring-1 ring-blue-200 dark:ring-blue-700"
                />
                <span className={`${screenWidth < BREAKPOINTS.mobile ? "text-[10px]" : "text-[11px]"} text-blue-600 dark:text-blue-400`}>
                  Assigned to: {assignedToUser.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}