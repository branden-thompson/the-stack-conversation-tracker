/**
 * CardBack Component
 * The back face of a conversation card - simplified view showing just the card type
 * Clicking anywhere on the back flips the card to show the face
 */

'use client';

import { RotateCw } from 'lucide-react';
import { CARD_TYPES } from '@/lib/utils/constants';

// Type labels - comprehensive mapping for all variations
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

// Type colors for the back - matching CardFace colors from constants
const TYPE_COLORS = {
  topic: {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-800 dark:text-gray-100',
  },
  question: {
    bg: 'bg-blue-50 dark:bg-blue-900',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-900 dark:text-blue-100',
  },
  accusation: {
    bg: 'bg-red-50 dark:bg-red-900',
    border: 'border-red-300 dark:border-red-600',
    text: 'text-red-900 dark:text-red-100',
  },
  fact: {
    bg: 'bg-yellow-50 dark:bg-yellow-900',
    border: 'border-yellow-300 dark:border-yellow-600',
    text: 'text-yellow-900 dark:text-yellow-100',
  },
  guess: {
    bg: 'bg-purple-50 dark:bg-purple-900',
    border: 'border-purple-300 dark:border-purple-600',
    text: 'text-purple-900 dark:text-purple-100',
  },
  opinion: {
    bg: 'bg-pink-50 dark:bg-pink-900',
    border: 'border-pink-300 dark:border-pink-600',
    text: 'text-pink-900 dark:text-pink-100',
  },
};

export function CardBack({ 
  card, 
  onFlip,
  screenWidth,
  minWidth,
  maxWidth,
  minHeight,
}) {
  const typeKey = card?.type?.toLowerCase() || 'topic';
  const typeLabel = TYPE_LABEL[typeKey] || TYPE_LABEL.topic;
  
  // Map the type to its base category for colors
  const getBaseType = (key) => {
    if (TYPE_LABEL[key]) {
      const label = TYPE_LABEL[key];
      // Map label back to base type for colors
      switch(label) {
        case 'TOPIC': return 'topic';
        case 'QUESTION': return 'question';
        case 'ACCUSATION': return 'accusation';
        case 'FACT': return 'fact';
        case 'GUESS': return 'guess';
        case 'OPINION': return 'opinion';
        default: return 'topic';
      }
    }
    return 'topic';
  };
  
  const baseType = getBaseType(typeKey);
  const colors = TYPE_COLORS[baseType] || TYPE_COLORS.topic;
  
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