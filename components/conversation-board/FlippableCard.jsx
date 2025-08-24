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
import { useGlobalSession } from '@/lib/contexts/GlobalSessionProvider';
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
  moveToZone,
  dragHandleProps,
  showAssignMenu,
  setShowAssignMenu,
  users,
  controlRailWidth,
  contentMinHeight,
  dateText,
  createdByUser,
  inputRef,
  typeColors,
  style,
  className,
}) {
  
  // Use showingFace to track what we're currently showing (true = face, false = back)
  const [showingFace, setShowingFace] = useState(card.faceUp);
  const [isAnimating, setIsAnimating] = useState(false);
  const { activeId: conversationId } = useConversations();
  const { emitCardEvent } = useGlobalSession();
  
  // Sync with card's faceUp state
  useEffect(() => {
    setShowingFace(card.faceUp);
  }, [card.faceUp]);
  
  const handleFlip = async (source = 'user') => {
    // Prevent flipping while already animating
    if (isAnimating) {
      return;
    }
    
    setIsAnimating(true);
    
    // Determine flip target
    const currentlyShowingFace = showingFace;
    const targetState = !currentlyShowingFace;
    const targetFlipTo = targetState ? 'faceUp' : 'faceDown';
    
    // Start the visual flip immediately
    setShowingFace(targetState);
    
    // Call the API to update the database
    try {
      const response = await fetch('/api/cards/flip', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: card.id,
          flipTo: targetFlipTo,
          flippedBy: source,
          conversationId: conversationId || undefined,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        // Failed to flip card - error handled by reverting state
        // Revert the flip on error
        setShowingFace(currentlyShowingFace);
      } else {
        const result = await response.json();
        // Emit session tracking event
        emitCardEvent('flipped', {
          cardId: card.id,
          flippedBy: source,
          zone: card.zone,
          from: currentlyShowingFace ? 'faceUp' : 'faceDown',
          to: targetState ? 'faceUp' : 'faceDown',
        });
        
        // Call the callback if provided
        if (onFlipCallback) {
          onFlipCallback(result);
        }
      }
    } catch (error) {
      // Error flipping card - handled by reverting state
      // Revert the flip on error
      setShowingFace(currentlyShowingFace);
    }
    
    // Animation complete
    setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION.card.flip.duration);
  };
  
  // Use direct state - much clearer logic
  const shouldShowFace = !animationsEnabled || showingFace;
  
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
          inputRef={inputRef}
          typeColors={typeColors}
        />
      </div>
    );
  }
  
  // With animations enabled, use proper 3D flip animation
  // First ensure we can see the cards, then optimize animation
  if (!animationsEnabled) {
    // Non-animated version - just show the appropriate side
    return (
      <div 
        className={cn(
          'relative rounded-xl border-2 shadow-sm overflow-hidden',
          typeColors?.container,
          className
        )}
        style={style}
      >
        {/* Stack index badge */}
        {isStacked && stackPosition > 0 && (
          <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm font-medium pointer-events-none z-10">
            {stackPosition + 1}
          </div>
        )}
        
        {showingFace ? (
          <CardFace
            card={card}
            isEditing={isEditing}
            content={content}
            setContent={setContent}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleKeyDown={handleKeyDown}
            handleDelete={handleDelete}
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
              inputRef={inputRef}
            typeColors={typeColors}
          />
        ) : (
          <CardBack
            card={card}
            onFlip={() => handleFlip('user')}
            screenWidth={screenWidth}
            minWidth={style?.minWidth}
            maxWidth={style?.maxWidth}
            minHeight={style?.minHeight}
          />
        )}
      </div>
    );
  }

  // Animated version with proper 3D flip
  return (
    <div 
      className={cn(
        'relative',
        className
      )}
      style={{
        ...style,
        perspective: '1000px',
      }}
    >
      {/* Stack index badge */}
      {isStacked && stackPosition > 0 && (
        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm font-medium pointer-events-none z-30">
          {stackPosition + 1}
        </div>
      )}
      
      {/* 3D Flip Container - this entire container rotates with border */}
      <div 
        className={cn(
          'relative rounded-xl border-2 shadow-sm overflow-hidden',
          typeColors?.container
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: showingFace ? 'rotateY(0deg)' : 'rotateY(180deg)',
          transition: isAnimating ? `transform ${ANIMATION.card.flip.duration}ms ${ANIMATION.card.flip.easing}` : 'none',
          width: style?.width || style?.minWidth || 'auto',
          minWidth: style?.minWidth,
          maxWidth: style?.maxWidth,
          height: style?.height || style?.minHeight || 'auto',
          minHeight: style?.minHeight,
        }}
      >
        {/* Card Face - Front Side */}
        <div 
          className={cn(
            'absolute inset-0 w-full h-full overflow-hidden backface-visibility-hidden',
            showingFace ? 'block' : 'hidden'
          )}
          style={{
            transform: 'rotateY(0deg)',
          }}
        >
          <CardFace
            card={card}
            isEditing={isEditing}
            content={content}
            setContent={setContent}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleKeyDown={handleKeyDown}
            handleDelete={handleDelete}
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
              inputRef={inputRef}
            typeColors={typeColors}
          />
        </div>

        {/* Card Back - Back Side */}
        <div 
          className={cn(
            'absolute inset-0 w-full h-full overflow-hidden backface-visibility-hidden',
            !showingFace ? 'block' : 'hidden'
          )}
          style={{
            transform: 'rotateY(180deg)',
          }}
        >
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
  );
}