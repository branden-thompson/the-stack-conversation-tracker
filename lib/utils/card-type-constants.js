/**
 * Card Type Constants
 * Centralized definitions for card types, labels, colors, styling, and mappings
 * Used across ConversationCard, CardFace, and CardBack components
 */

/**
 * Type label mapping - maps all type variations to display labels
 * Handles legacy types and variations for backward compatibility
 */
export const TYPE_LABEL = {
  // Topic variations
  topic: 'TOPIC',
  conversation: 'TOPIC',
  conversation_topic: 'TOPIC',
  
  // Question variations
  question: 'QUESTION',
  open_question: 'QUESTION',
  'open-question': 'QUESTION',
  
  // Accusation variations
  accusation: 'ACCUSATION',
  claim: 'ACCUSATION',
  allegation: 'ACCUSATION',
  
  // Fact variations
  fact: 'FACT',
  factual: 'FACT',
  factual_statement: 'FACT',
  'factual-statement': 'FACT',
  objective_fact: 'FACT',
  'objective-fact': 'FACT',
  objective: 'FACT',
  statement: 'FACT',
  
  // Guess (single type)
  guess: 'GUESS',
  
  // Opinion (single type)
  opinion: 'OPINION',
};

/**
 * Type colors for card styling
 * Includes background, border, and text colors for light/dark modes
 */
/**
 * Card text styling constants
 * Centralized text sizes and colors for card elements
 */
export const CARD_TEXT_STYLES = {
  footer: {
    // Base footer styling - removed monospace font
    // Date text styling
    date: {
      mobile: 'text-[10px]',
      desktop: 'text-[12px]',
      color: 'text-gray-400 dark:text-gray-300'
    },
    // User info text styling
    createdBy: {
      mobile: 'text-[10px]',
      desktop: 'text-[12px]',
      color: 'text-gray-400 dark:text-gray-300'
    },
    assignedTo: {
      mobile: 'text-[10px]',
      desktop: 'text-[12px]',
      color: 'text-blue-500 dark:text-blue-300'
    }
  },
  content: {
    // Content area text
    text: 'text-sm sm:text-base lg:text-lg',
    color: 'text-gray-800 dark:text-gray-100',
    placeholder: 'italic text-gray-400 dark:text-gray-200/90'
  },
  // Icon sizes for footer elements
  icons: {
    calendar: {
      mobile: 'w-6 h-6',   // xs profile pic size is 24px (w-6 h-6)
      desktop: 'w-6 h-6',  // Keep consistent with profile pic xs size
      color: 'text-gray-400 dark:text-gray-300'
    }
  }
};

/**
 * Helper function to get text style classes
 * @param {string} element - The element type (footer.date, footer.createdBy, etc.)
 * @param {number} screenWidth - Screen width for responsive sizing
 * @returns {string} - Combined CSS classes
 */
export function getCardTextStyle(element, screenWidth = 1024) {
  const isMobile = screenWidth < 640; // BREAKPOINTS.mobile
  const parts = element.split('.');
  
  let style = CARD_TEXT_STYLES;
  for (const part of parts) {
    style = style[part];
    if (!style) return '';
  }
  
  if (style.mobile && style.desktop) {
    const sizeClass = isMobile ? style.mobile : style.desktop;
    return `${sizeClass} ${style.color || ''}`.trim();
  }
  
  return style;
}

export const TYPE_COLORS = {
  topic: {
    bg: 'bg-white dark:bg-gray-700',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-800 dark:text-gray-100',
    container: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600',
    hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-600',
  },
  question: {
    bg: 'bg-blue-50 dark:bg-blue-900',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-900 dark:text-blue-100',
    container: 'bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-600',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900',
  },
  accusation: {
    bg: 'bg-red-50 dark:bg-red-900',
    border: 'border-red-300 dark:border-red-600',
    text: 'text-red-900 dark:text-red-100',
    container: 'bg-red-50 dark:bg-red-950 border-red-400 dark:border-red-600',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900',
  },
  fact: {
    bg: 'bg-yellow-50 dark:bg-yellow-900',
    border: 'border-yellow-300 dark:border-yellow-600',
    text: 'text-yellow-900 dark:text-yellow-100',
    container: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-400 dark:border-yellow-600',
    hoverBg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900',
  },
  guess: {
    bg: 'bg-purple-50 dark:bg-purple-900',
    border: 'border-purple-300 dark:border-purple-600',
    text: 'text-purple-900 dark:text-purple-100',
    container: 'bg-purple-50 dark:bg-purple-950 border-purple-400 dark:border-purple-600',
    hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900',
  },
  opinion: {
    bg: 'bg-pink-50 dark:bg-pink-900',
    border: 'border-pink-300 dark:border-pink-600',
    text: 'text-pink-900 dark:text-pink-100',
    container: 'bg-pink-50 dark:bg-pink-950 border-pink-400 dark:border-pink-600',
    hoverBg: 'hover:bg-pink-100 dark:hover:bg-pink-900',
  },
};

/**
 * Helper function to get base type from any type variation
 * @param {string} typeKey - The type key (could be a variation)
 * @returns {string} - The base type (topic, question, accusation, fact, guess, opinion)
 */
export function getBaseType(typeKey) {
  if (!typeKey) return 'topic';
  
  const key = typeKey.toLowerCase();
  const label = TYPE_LABEL[key];
  
  if (!label) return 'topic';
  
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

/**
 * Get type colors for a card
 * @param {string} type - The card type
 * @returns {Object} - Colors object with bg, border, text, container, hoverBg
 */
export function getTypeColors(type) {
  const baseType = getBaseType(type);
  return TYPE_COLORS[baseType] || TYPE_COLORS.topic;
}

/**
 * Get type label for display
 * @param {string} type - The card type
 * @returns {string} - Display label
 */
export function getTypeLabel(type) {
  if (!type) return 'TOPIC';
  const key = type.toLowerCase();
  return TYPE_LABEL[key] || 'TOPIC';
}