/**
 * Purple Color Theme
 * A sophisticated purple theme for app pages
 */

export const purpleTheme = {
  id: 'purple',
  name: 'Royal Purple',
  description: 'A sophisticated purple theme with royal elegance',
  
  // Light mode colors - enhanced purple theme with subtle royal tinting (no pure white)
  light: {
    primary: 'bg-[#faf5ff] dark:bg-[#1a0d2e]',        // Light violet-50: subtle purple page background
    secondary: 'bg-[#faf5ff] dark:bg-[#1a0d2e]',      // Light violet-50: subtle purple zones (no pure white)
    tertiary: 'bg-[#f3e8ff] dark:bg-[#3b1f6b]',     // Light violet-100: enhanced headers for distinction
    card: 'bg-[#e9d5ff] dark:bg-[#4a2473]',          // Light violet-200: enhanced cards for content focus
    dropdown: 'bg-[#faf5ff] dark:bg-[#1a0d2e]',       // Light violet-50: subtle purple dropdowns
    hover: 'hover:bg-[#f3e8ff] dark:hover:bg-[#3b1f6b]/50', // Light violet-100 hover
    hoverStrong: 'hover:bg-[#e9d5ff] dark:hover:bg-[#4a2473]', // Light violet-200 hover
    accent: 'bg-[#e9d5ff] dark:bg-[#4a2473]',        // Light violet-200: subtle accent
    divider: 'bg-violet-300 dark:bg-[#5b2c87]',      // Enhanced divider: stronger definition
    
    border: {
      primary: 'border-violet-300 dark:border-[#4a2473]',   // Enhanced border: better definition
      secondary: 'border-violet-400 dark:border-[#5b2c87]', // Stronger border: clear separation
      strong: 'border-violet-500 dark:border-[#6d3ba3]',    // Strong border: maximum definition
    },
    
    text: {
      primary: 'text-violet-900 dark:text-[#f3e8ff]',    // Purple text: theme-aware maximum readability
      secondary: 'text-violet-700 dark:text-[#e9d5ff]',  // Purple text: theme-aware good contrast
      tertiary: 'text-violet-600 dark:text-[#d8b4fe]',   // Purple text: theme-aware subtle content
      muted: 'text-violet-500 dark:text-[#c4b5fd]',      // Purple text: theme-aware background content
      light: 'text-violet-400 dark:text-[#a78bfa]',      // Purple text: theme-aware minimal contrast
    },
    
    cardTypes: {
      topic: {
        container: 'bg-[#e9d5ff] border-violet-400 text-violet-800 dark:bg-[#4a2473] dark:border-[#5b2c87] dark:text-[#f3e8ff]',
        borderColor: 'border-violet-400 dark:border-[#5b2c87]',
        background: 'bg-[#e9d5ff] dark:bg-[#4a2473]',
        text: 'text-violet-800 dark:text-[#f3e8ff]',
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
  },
  
  // Dark mode colors - custom darkened violet ramp for deeper royal appearance
  dark: {
    primary: 'bg-violet-50 dark:bg-[#1a0d2e]',        // Extra darkened violet-950: #2e1065 → #1a0d2e (35% darker)
    secondary: 'bg-white dark:bg-[#1a0d2e]',           // Extra darkened violet-950: #2e1065 → #1a0d2e (35% darker)
    tertiary: 'bg-violet-100 dark:bg-[#3b1f6b]',     // Darkened violet-900: #581c87 → #3b1f6b (25% darker)
    card: 'bg-violet-50 dark:bg-[#4a2473]',          // Darkened violet-800: #6b21a8 → #4a2473 (15% darker)
    dropdown: 'bg-white dark:bg-[#1a0d2e]',           // Extra darkened violet-950: #2e1065 → #1a0d2e (35% darker)
    hover: 'hover:bg-violet-50 dark:hover:bg-[#3b1f6b]/50', // Darkened violet-900 with opacity
    hoverStrong: 'hover:bg-violet-100 dark:hover:bg-[#4a2473]', // Darkened violet-800
    accent: 'bg-violet-50 dark:bg-[#4a2473]',        // Darkened violet-800: #6b21a8 → #4a2473 (15% darker)
    divider: 'bg-violet-300 dark:bg-[#5b2c87]',      // Darkened violet-700: #7c3aed → #5b2c87 (custom adjustment)
    
    border: {
      primary: 'border-violet-200 dark:border-[#4a2473]',   // Darkened violet-800: #6b21a8 → #4a2473
      secondary: 'border-violet-300 dark:border-[#5b2c87]', // Darkened violet-700: #7c3aed → #5b2c87
      strong: 'border-violet-400 dark:border-[#6d3ba3]',    // Darkened violet-600: #9333ea → #6d3ba3
    },
    
    text: {
      primary: 'text-slate-900 dark:text-[#f3e8ff]',    // Darkened violet-50: #faf5ff → #f3e8ff
      secondary: 'text-slate-700 dark:text-[#e9d5ff]',  // Darkened violet-100: #f3e8ff → #e9d5ff
      tertiary: 'text-slate-600 dark:text-[#d8b4fe]',   // Darkened violet-200: #e9d5ff → #d8b4fe
      muted: 'text-slate-500 dark:text-[#c4b5fd]',      // Violet-300: #d8b4fe → #c4b5fd (slightly adjusted)
      light: 'text-slate-400 dark:text-[#a78bfa]',      // Violet-400: maintaining good contrast
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-violet-300 text-slate-800 dark:bg-[#4a2473] dark:border-[#5b2c87] dark:text-[#f3e8ff]',
        borderColor: 'border-violet-300 dark:border-[#5b2c87]',
        background: 'bg-white dark:bg-[#4a2473]',
        text: 'text-slate-800 dark:text-[#f3e8ff]',
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
  }
};

export default purpleTheme;