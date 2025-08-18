/**
 * Blue Color Theme
 * A calming blue theme for app pages
 */

export const blueTheme = {
  id: 'blue',
  name: 'Ocean Blue',
  description: 'A calming blue theme with subtle oceanic tints',
  
  // Light mode colors - 10% darker blue theme with subtle zone tinting (no pure white)
  light: {
    primary: 'bg-[#f0f9ff] dark:bg-[#020617]',        // Light sky-50: subtle blue page background
    secondary: 'bg-[#f0f9ff] dark:bg-[#020617]',      // Light sky-50: subtle blue zones (no pure white)
    tertiary: 'bg-[#e0f2fe] dark:bg-[#0a1733]',     // Light sky-100: enhanced headers for distinction
    card: 'bg-[#bae6fd] dark:bg-[#0f2847]',          // Light sky-200: enhanced cards for content focus
    dropdown: 'bg-[#f0f9ff] dark:bg-[#020617]',       // Light sky-50: subtle blue dropdowns
    hover: 'hover:bg-[#e0f2fe] dark:hover:bg-[#0a1733]/50', // Light sky-100 hover
    hoverStrong: 'hover:bg-[#bae6fd] dark:hover:bg-[#0f2847]', // Light sky-200 hover
    accent: 'bg-[#bae6fd] dark:bg-[#0f2847]',        // Light sky-200: subtle accent
    divider: 'bg-sky-300 dark:bg-[#1361a0]',      // Enhanced divider: stronger definition
    
    border: {
      primary: 'border-sky-300 dark:border-[#0f2847]',   // Enhanced border: better definition
      secondary: 'border-sky-400 dark:border-[#1361a0]', // Stronger border: clear separation
      strong: 'border-sky-500 dark:border-[#1570b8]',    // Strong border: maximum definition
    },
    
    text: {
      primary: 'text-sky-900 dark:text-[#e0f2fe]',    // Blue text: theme-aware maximum readability
      secondary: 'text-sky-700 dark:text-[#bae6fd]',  // Blue text: theme-aware good contrast
      tertiary: 'text-sky-600 dark:text-[#7dd3fc]',   // Blue text: theme-aware subtle content
      muted: 'text-sky-500 dark:text-[#38bdf8]',      // Blue text: theme-aware background content
      light: 'text-sky-400 dark:text-[#0ea5e9]',      // Blue text: theme-aware minimal contrast
    },
    
    cardTypes: {
      topic: {
        container: 'bg-[#bae6fd] border-sky-400 text-sky-800 dark:bg-[#0f2847] dark:border-[#1361a0] dark:text-[#e0f2fe]',
        borderColor: 'border-sky-400 dark:border-[#1361a0]',
        background: 'bg-[#bae6fd] dark:bg-[#0f2847]',
        text: 'text-sky-800 dark:text-[#e0f2fe]',
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
  
  // Dark mode colors - custom darkened sky ramp for deeper ocean appearance
  dark: {
    primary: 'bg-sky-50 dark:bg-[#020617]',        // Extra darkened slate-950: #020617 → #020617 (deepest ocean)
    secondary: 'bg-white dark:bg-[#020617]',           // Extra darkened slate-950: #020617 → #020617 (deepest ocean)
    tertiary: 'bg-sky-100 dark:bg-[#0a1733]',     // Darkened sky-950: #0c4a6e → #0a1733 (25% darker)
    card: 'bg-sky-50 dark:bg-[#0f2847]',          // Darkened sky-900: #0369a1 → #0f2847 (15% darker)
    dropdown: 'bg-white dark:bg-[#020617]',           // Extra darkened slate-950: #020617 → #020617 (deepest ocean)
    hover: 'hover:bg-sky-50 dark:hover:bg-[#0a1733]/50', // Darkened sky-950 with opacity
    hoverStrong: 'hover:bg-sky-100 dark:hover:bg-[#0f2847]', // Darkened sky-900
    accent: 'bg-sky-50 dark:bg-[#0f2847]',        // Darkened sky-900: #0369a1 → #0f2847 (15% darker)
    divider: 'bg-sky-300 dark:bg-[#1361a0]',      // Darkened sky-800: #075985 → #1361a0 (custom adjustment)
    
    border: {
      primary: 'border-sky-200 dark:border-[#0f2847]',   // Darkened sky-900: #0369a1 → #0f2847
      secondary: 'border-sky-300 dark:border-[#1361a0]', // Darkened sky-800: #075985 → #1361a0
      strong: 'border-sky-400 dark:border-[#1570b8]',    // Darkened sky-700: #0284c7 → #1570b8
    },
    
    text: {
      primary: 'text-slate-900 dark:text-[#e0f2fe]',    // Darkened sky-50: #f0f9ff → #e0f2fe
      secondary: 'text-slate-700 dark:text-[#bae6fd]',  // Darkened sky-100: #e0f2fe → #bae6fd
      tertiary: 'text-slate-600 dark:text-[#7dd3fc]',   // Darkened sky-200: #bae6fd → #7dd3fc
      muted: 'text-slate-500 dark:text-[#38bdf8]',      // Sky-300: #7dd3fc → #38bdf8 (slightly adjusted)
      light: 'text-slate-400 dark:text-[#0ea5e9]',      // Sky-500: maintaining good contrast
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-sky-300 text-slate-800 dark:bg-[#0f2847] dark:border-[#1361a0] dark:text-[#e0f2fe]',
        borderColor: 'border-sky-300 dark:border-[#1361a0]',
        background: 'bg-white dark:bg-[#0f2847]',
        text: 'text-slate-800 dark:text-[#e0f2fe]',
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

export default blueTheme;