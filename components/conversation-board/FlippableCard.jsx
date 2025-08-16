/**
 * FlippableCard Component
 * Wrapper that handles the flip animation between CardFace and CardBack
 * Uses CSS transforms for smooth 3D flip effect
 */

'use client';

import { useState, useEffect } from 'react';
import { CardFace } from './CardFace';
import { CardBack } from './CardBack';
import { ANIMATION } from '@/lib/utils/ui-constants';
import { useConversations } from '@/lib/hooks/useConversations';
import { cn } from '@/lib/utils';

export function FlippableCard({
  card,
  animationsEnabled = true,
  onFlip: onFlipCallback,
  screenWidth,
  // Stack props
  isStacked = false,
  stackPosition = 0,
  // All props needed by CardFace
  isEditing,
  content,
  setContent,
  handleEdit,
  handleSave,
  handleKeyDown,
  handleDelete,
  handleAssignUser,
  moveToZone,
  dragHandleProps,
  showAssignMenu,
  setShowAssignMenu,
  users,
  controlRailWidth,
  contentMinHeight,
  dateText,
  createdByUser,
  assignedToUser,
  inputRef,
  typeColors,
  style,
  className,
}) {
  const [isFlipped, setIsFlipped] = useState(!card.faceUp);
  const [isAnimating, setIsAnimating] = useState(false);
  const { activeId: conversationId } = useConversations();
  
  // Sync with card's faceUp state
  useEffect(() => {
    setIsFlipped(!card.faceUp);
  }, [card.faceUp]);
  
  const handleFlip = async (source = 'user') => {
    // If animations are disabled, don't flip
    if (!animationsEnabled) return;
    
    // Prevent flipping while already animating
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Start the visual flip
    setIsFlipped(!isFlipped);
    
    // Call the API to update the database
    try {
      const response = await fetch('/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: card.id,
          flipTo: isFlipped ? 'faceUp' : 'faceDown',
          flippedBy: source,
          conversationId: conversationId || undefined,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to flip card:', await response.text());
        // Revert the flip on error
        setIsFlipped(isFlipped);
      } else {
        // Call the callback if provided
        if (onFlipCallback) {
          const result = await response.json();
          onFlipCallback(result);
        }
      }
    } catch (error) {
      console.error('Error flipping card:', error);
      // Revert the flip on error
      setIsFlipped(isFlipped);
    }
    
    // Animation complete
    setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION.card.flip.duration);
  };
  
  // If animations are disabled, always show face up
  const shouldShowFace = !animationsEnabled || !isFlipped;
  
  // When animations are disabled, just render CardFace directly with the container styling
  if (!animationsEnabled) {
    return (
      <div className={cn(
        'rounded-xl border-2 shadow-sm overflow-hidden relative',
        typeColors?.container // per-type colors (light + dark)
      )}>
        {/* Stack index badge for non-animated cards */}
        {isStacked && stackPosition > 0 && (
          <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm font-medium pointer-events-none z-10">
            {stackPosition + 1}
          </div>
        )}
        <CardFace
          card={card}
          isEditing={isEditing}
          content={content}
          setContent={setContent}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleKeyDown={handleKeyDown}
          handleDelete={handleDelete}
          handleAssignUser={handleAssignUser}
          moveToZone={moveToZone}
          onFlip={() => handleFlip('user')}
          dragHandleProps={dragHandleProps}
          showAssignMenu={showAssignMenu}
          setShowAssignMenu={setShowAssignMenu}
          users={users}
          screenWidth={screenWidth}
          controlRailWidth={controlRailWidth}
          contentMinHeight={contentMinHeight}
          dateText={dateText}
          createdByUser={createdByUser}
          assignedToUser={assignedToUser}
          inputRef={inputRef}
          typeColors={typeColors}
        />
      </div>
    );
  }
  
  // With animations enabled, use the flip container
  return (
    <div 
      className={`flip-card relative ${className || ''}`}
      style={{
        ...style,
        width: style?.width || 'auto',
        height: style?.height || 'auto',
        perspective: ANIMATION.card.flip.perspective,
      }}
    >
      {/* Stack index badge - positioned relative to the flip container */}
      {isStacked && stackPosition > 0 && (
        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm font-medium pointer-events-none z-10">
          {stackPosition + 1}
        </div>
      )}
      
      <div 
        className="flip-card-inner"
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          transformStyle: 'preserve-3d',
          transition: `transform ${ANIMATION.card.flip.duration}ms ${ANIMATION.card.flip.easing}`,
          transform: shouldShowFace ? 'rotateY(0deg)' : 'rotateY(180deg)',
        }}
      >
        {/* Face (front) - with card container styling */}
        <div
          className="flip-card-face"
          style={{
            position: shouldShowFace ? 'relative' : 'absolute',
            width: '100%',
            minHeight: style?.minHeight || 'auto',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <div className={cn(
            'rounded-xl border-2 shadow-sm overflow-hidden w-full h-full',
            typeColors?.container // per-type colors (light + dark)
          )}>
            <CardFace
              card={card}
              isEditing={isEditing}
              content={content}
              setContent={setContent}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleKeyDown={handleKeyDown}
              handleDelete={handleDelete}
              handleAssignUser={handleAssignUser}
              moveToZone={moveToZone}
              onFlip={() => handleFlip('user')}
              dragHandleProps={dragHandleProps}
              showAssignMenu={showAssignMenu}
              setShowAssignMenu={setShowAssignMenu}
              users={users}
              screenWidth={screenWidth}
              controlRailWidth={controlRailWidth}
              contentMinHeight={contentMinHeight}
              dateText={dateText}
              createdByUser={createdByUser}
              assignedToUser={assignedToUser}
              inputRef={inputRef}
              typeColors={typeColors}
            />
          </div>
        </div>
        
        {/* Back - with its own container styling */}
        <div
          className="flip-card-back"
          style={{
            position: shouldShowFace ? 'absolute' : 'relative',
            width: '100%',
            minHeight: style?.minHeight || 'auto',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="rounded-xl border-2 shadow-sm overflow-hidden w-full h-full bg-white dark:bg-gray-900">
            <CardBack
              card={card}
              onFlip={() => handleFlip('user')}
              screenWidth={screenWidth}
              minWidth={style?.minWidth}
              maxWidth={style?.maxWidth}
              minHeight={style?.minHeight}
            />
          </div>
        </div>
      </div>
    </div>
  );
}