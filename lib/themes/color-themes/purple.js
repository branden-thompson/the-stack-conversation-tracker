/**
 * Purple Color Theme
 * A sophisticated purple theme for app pages
 */

export const purpleTheme = {
  id: 'purple',
  name: 'Royal Purple',
  description: 'A sophisticated purple theme with royal elegance',
  
  // Light mode colors (EXTREMELY light - like grey theme with minimal purple hints)
  light: {
    primary: 'bg-violet-50 dark:bg-violet-950', // Very subtle purple tint matching theme selector
    secondary: 'bg-white dark:bg-violet-900', // Pure white secondary (same as grey)
    tertiary: 'bg-gray-100 dark:bg-violet-800', // Light grey (same as grey theme)
    card: 'bg-white dark:bg-violet-800', // Pure white cards (same as grey)
    dropdown: 'bg-gray-100 dark:bg-violet-950', // Light grey (same as grey theme)
    zone: 'bg-violet-50 dark:bg-violet-900', // Ultra-subtle purple for zones
    zoneHeader: 'bg-violet-50 dark:bg-violet-800', // Ultra-subtle purple for headers
    hover: 'hover:bg-violet-50 dark:hover:bg-violet-900', // Ultra-subtle purple hover
    hoverStrong: 'hover:bg-violet-50 dark:hover:bg-violet-800', // Ultra-subtle for strong hover
    accent: 'bg-white dark:bg-violet-800', // Pure white accent
    
    border: {
      primary: 'border-violet-200 dark:border-violet-700', // Very subtle purple borders
      secondary: 'border-violet-300 dark:border-violet-600', // Slightly more for secondary borders
      strong: 'border-violet-400 dark:border-violet-500', // More visible for strong borders
    },
    
    text: {
      primary: 'text-violet-900 dark:text-violet-100',
      secondary: 'text-violet-700 dark:text-violet-200',
      tertiary: 'text-violet-600 dark:text-violet-300',
      muted: 'text-violet-500 dark:text-violet-400',
      light: 'text-violet-400 dark:text-violet-500',
    }
  },
  
  // Card type semantic colors (consistent across themes)
  cardTypes: {
    topic: {
      container: 'bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
      borderColor: 'border-gray-300 dark:border-gray-600',
      background: 'bg-white dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-100',
    },
    question: {
      container: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-100',
      borderColor: 'border-blue-300 dark:border-blue-600',
      background: 'bg-blue-50 dark:bg-blue-900',
      text: 'text-blue-900 dark:text-blue-100',
    },
    accusation: {
      container: 'bg-red-50 border-red-300 text-red-900 dark:bg-red-900 dark:border-red-600 dark:text-red-100',
      borderColor: 'border-red-300 dark:border-red-600',
      background: 'bg-red-50 dark:bg-red-900',
      text: 'text-red-900 dark:text-red-100',
    },
    fact: {
      container: 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-100',
      borderColor: 'border-yellow-300 dark:border-yellow-600',
      background: 'bg-yellow-50 dark:bg-yellow-900',
      text: 'text-yellow-900 dark:text-yellow-100',
    },
    guess: {
      container: 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-100',
      borderColor: 'border-purple-300 dark:border-purple-600',
      background: 'bg-purple-50 dark:bg-purple-900',
      text: 'text-purple-900 dark:text-purple-100',
    },
    opinion: {
      container: 'bg-pink-50 border-pink-300 text-pink-900 dark:bg-pink-900 dark:border-pink-600 dark:text-pink-100',
      borderColor: 'border-pink-300 dark:border-pink-600',
      background: 'bg-pink-50 dark:bg-pink-900',
      text: 'text-pink-900 dark:text-pink-100',
    },
  },
  
  // Dark mode colors (same structure for consistency)
  dark: {
    primary: 'bg-violet-800 dark:bg-violet-950',
    secondary: 'bg-violet-700 dark:bg-violet-900',
    tertiary: 'bg-violet-900 dark:bg-violet-800',
    card: 'bg-violet-800 dark:bg-violet-800',
    dropdown: 'bg-violet-900 dark:bg-violet-950', // Darker than secondary for emphasis
    zone: 'bg-violet-950 dark:bg-violet-900', // Zone backgrounds - keep current darkness
    zoneHeader: 'bg-violet-950 dark:bg-violet-800', // Zone headers slightly darker
    hover: 'hover:bg-violet-800 dark:hover:bg-violet-900',
    hoverStrong: 'hover:bg-violet-900 dark:hover:bg-violet-800',
    accent: 'bg-violet-800 dark:bg-violet-800',
    
    border: {
      primary: 'border-violet-700 dark:border-violet-700',
      secondary: 'border-violet-800 dark:border-violet-600',
      strong: 'border-violet-900 dark:border-violet-500',
    },
    
    text: {
      primary: 'text-white dark:text-violet-100',
      secondary: 'text-violet-100 dark:text-violet-200',
      tertiary: 'text-violet-200 dark:text-violet-300',
      muted: 'text-violet-300 dark:text-violet-400',
      light: 'text-violet-400 dark:text-violet-500',
    }
  },
  
  // Card type semantic colors (consistent across themes)
  cardTypes: {
    topic: {
      container: 'bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
      borderColor: 'border-gray-300 dark:border-gray-600',
      background: 'bg-white dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-100',
    },
    question: {
      container: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-100',
      borderColor: 'border-blue-300 dark:border-blue-600',
      background: 'bg-blue-50 dark:bg-blue-900',
      text: 'text-blue-900 dark:text-blue-100',
    },
    accusation: {
      container: 'bg-red-50 border-red-300 text-red-900 dark:bg-red-900 dark:border-red-600 dark:text-red-100',
      borderColor: 'border-red-300 dark:border-red-600',
      background: 'bg-red-50 dark:bg-red-900',
      text: 'text-red-900 dark:text-red-100',
    },
    fact: {
      container: 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-100',
      borderColor: 'border-yellow-300 dark:border-yellow-600',
      background: 'bg-yellow-50 dark:bg-yellow-900',
      text: 'text-yellow-900 dark:text-yellow-100',
    },
    guess: {
      container: 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-100',
      borderColor: 'border-purple-300 dark:border-purple-600',
      background: 'bg-purple-50 dark:bg-purple-900',
      text: 'text-purple-900 dark:text-purple-100',
    },
    opinion: {
      container: 'bg-pink-50 border-pink-300 text-pink-900 dark:bg-pink-900 dark:border-pink-600 dark:text-pink-100',
      borderColor: 'border-pink-300 dark:border-pink-600',
      background: 'bg-pink-50 dark:bg-pink-900',
      text: 'text-pink-900 dark:text-pink-100',
    },
  }
};

export default purpleTheme;