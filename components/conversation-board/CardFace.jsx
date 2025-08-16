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
  User,
  UserCheck,
  UserPlus,
  MoreVertical,
  RotateCw, // Flip icon
} from 'lucide-react';
import { 
  CARD_CONTROL_RAIL,
  BREAKPOINTS,
  getResponsiveCardHeights,
  getControlRailDimensions,
} from '@/lib/utils/ui-constants';
import { cn } from '@/lib/utils';
import { ProfilePicture } from '@/components/ui/profile-picture';

// Type labels
const TYPE_LABEL = {
  topic: 'TOPIC',
  question: 'QUESTION',
  accusation: 'ACCUSATION',
  fact: 'FACT',
  guess: 'GUESS',
  opinion: 'OPINION',
};

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
  showAssignMenu,
  setShowAssignMenu,
  users = [],
  screenWidth,
  controlRailWidth,
  contentMinHeight,
  dateText,
  createdByUser,
  assignedToUser,
  inputRef,
  typeColors,
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
        
        {/* Assignment menu button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-blue-500/10 dark:hover:bg-blue-500/20"
            onClick={() => setShowAssignMenu(!showAssignMenu)}
            style={{ width: railBtnSize, height: railBtnSize }}
          >
            {assignedToUser ? (
              <UserCheck className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
            ) : (
              <UserPlus className={screenWidth < BREAKPOINTS.mobile ? "w-3 h-3" : "w-4 h-4"} />
            )}
          </Button>
          
          {/* Assignment dropdown menu */}
          {showAssignMenu && (
            <div className="absolute bottom-full right-0 mb-2 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  Assign To
                </div>
                
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
            {TYPE_LABEL[typeKey] || 'TOPIC'}
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