/**
 * CardBack Component
 * The back face of a conversation card - simplified view showing just the card type
 * Clicking anywhere on the back flips the card to show the face
 */

'use client';

import { RotateCw } from 'lucide-react';
import { getTypeLabel, getTypeColors } from '@/lib/utils/card-type-constants';

export function CardBack({ 
  card, 
  onFlip,
  screenWidth,
  minWidth,
  maxWidth,
  minHeight,
}) {
  const typeLabel = getTypeLabel(card?.type);
  const colors = getTypeColors(card?.type);
  
  return (
    <div 
      className={`relative w-full h-full flex flex-col items-center justify-center cursor-pointer ${colors.bg} hover:opacity-90 transition-opacity`}
      onClick={onFlip}
      title="Click to flip card"
      style={{
        minWidth: minWidth || 'auto',
        maxWidth: maxWidth || '100%',
        minHeight: minHeight || '200px',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Pattern background for visual interest */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 20px
          )`,
        }}
      />
      
      {/* Main content - centered card type */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Large type label */}
        <div className={`font-bold ${colors.text}`} style={{ fontSize: screenWidth < 640 ? '1.5rem' : '2rem' }}>
          {typeLabel}
        </div>
        
        {/* Flip indicator */}
        <div className={`flex items-center gap-2 ${colors.text} opacity-60`}>
          <RotateCw className="w-4 h-4" />
          <span className="text-sm">Click to flip</span>
        </div>
      </div>
      
      {/* Corner decorations */}
      <div className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 ${colors.border}`} />
      <div className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 ${colors.border}`} />
      <div className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 ${colors.border}`} />
      <div className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 ${colors.border}`} />
      
      {/* Card type icon/shape (future enhancement placeholder) */}
      {/* This is where we can add custom icons or shapes per card type */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-32 h-32 rounded-full ${colors.border} border-4 opacity-10`} />
      </div>
    </div>
  );
}