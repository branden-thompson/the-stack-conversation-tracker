/**
 * Green Color Theme
 * A fresh green theme for app pages
 */

export const greenTheme = {
  id: 'green',
  name: 'Forest Green',
  description: 'A fresh green theme inspired by natural forests',
  
  // Light mode colors (EXTREMELY light - like grey theme with minimal green hints)
  light: {
    primary: 'bg-emerald-50 dark:bg-emerald-950', // Very subtle green tint matching theme selector
    secondary: 'bg-white dark:bg-emerald-900', // Pure white secondary (same as grey)
    tertiary: 'bg-gray-100 dark:bg-emerald-800', // Light grey (same as grey theme)
    card: 'bg-white dark:bg-emerald-800', // Pure white cards (same as grey)
    dropdown: 'bg-gray-100 dark:bg-emerald-950', // Light grey (same as grey theme)
    zone: 'bg-emerald-50 dark:bg-emerald-900', // Ultra-subtle green for zones
    zoneHeader: 'bg-emerald-50 dark:bg-emerald-800', // Ultra-subtle green for headers
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900', // Ultra-subtle green hover
    hoverStrong: 'hover:bg-emerald-50 dark:hover:bg-emerald-800', // Ultra-subtle for strong hover
    accent: 'bg-white dark:bg-emerald-800', // Pure white accent
    
    border: {
      primary: 'border-emerald-200 dark:border-emerald-700', // Very subtle green borders
      secondary: 'border-emerald-300 dark:border-emerald-600', // Slightly more for secondary borders
      strong: 'border-emerald-400 dark:border-emerald-500', // More visible for strong borders
    },
    
    text: {
      primary: 'text-emerald-900 dark:text-emerald-100',
      secondary: 'text-emerald-700 dark:text-emerald-200',
      tertiary: 'text-emerald-600 dark:text-emerald-300',
      muted: 'text-emerald-500 dark:text-emerald-400',
      light: 'text-emerald-400 dark:text-emerald-500',
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
    primary: 'bg-emerald-500 dark:bg-emerald-950',
    secondary: 'bg-emerald-400 dark:bg-emerald-900',
    tertiary: 'bg-emerald-600 dark:bg-emerald-800',
    card: 'bg-emerald-500 dark:bg-emerald-800',
    dropdown: 'bg-emerald-600 dark:bg-emerald-950', // Darker than secondary for emphasis
    zone: 'bg-emerald-950 dark:bg-emerald-900', // Zone backgrounds - 4 shades darker total
    zoneHeader: 'bg-emerald-950 dark:bg-emerald-800', // Zone headers slightly darker
    hover: 'hover:bg-emerald-500 dark:hover:bg-emerald-900',
    hoverStrong: 'hover:bg-emerald-600 dark:hover:bg-emerald-800',
    accent: 'bg-emerald-500 dark:bg-emerald-800',
    
    border: {
      primary: 'border-emerald-700 dark:border-emerald-700',
      secondary: 'border-emerald-800 dark:border-emerald-600',
      strong: 'border-emerald-900 dark:border-emerald-500',
    },
    
    text: {
      primary: 'text-white dark:text-emerald-100',
      secondary: 'text-emerald-100 dark:text-emerald-200',
      tertiary: 'text-emerald-200 dark:text-emerald-300',
      muted: 'text-emerald-300 dark:text-emerald-400',
      light: 'text-emerald-400 dark:text-emerald-500',
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

export default greenTheme;