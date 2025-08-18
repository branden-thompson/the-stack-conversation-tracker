/**
 * Green Color Theme
 * A fresh green theme for app pages
 */

export const greenTheme = {
  id: 'green',
  name: 'Forest Green',
  description: 'A fresh green theme inspired by natural forests',
  
  // Light mode colors - enhanced green theme with subtle forest tinting (no pure white)
  light: {
    primary: 'bg-[#ecfdf5] dark:bg-[#011b01]',        // Light emerald-50: subtle green page background
    secondary: 'bg-[#ecfdf5] dark:bg-[#011b01]',      // Light emerald-50: subtle green zones (no pure white)
    tertiary: 'bg-[#d1fae5] dark:bg-[#0a3d0a]',     // Light emerald-100: enhanced headers for distinction
    card: 'bg-[#a7f3d0] dark:bg-[#0f4c0f]',          // Light emerald-200: enhanced cards for content focus
    dropdown: 'bg-[#ecfdf5] dark:bg-[#011b01]',       // Light emerald-50: subtle green dropdowns
    hover: 'hover:bg-[#d1fae5] dark:hover:bg-[#0a3d0a]/50', // Light emerald-100 hover
    hoverStrong: 'hover:bg-[#a7f3d0] dark:hover:bg-[#0f4c0f]', // Light emerald-200 hover
    accent: 'bg-[#a7f3d0] dark:bg-[#0f4c0f]',        // Light emerald-200: subtle accent
    divider: 'bg-emerald-300 dark:bg-[#125a2b]',      // Enhanced divider: stronger definition
    
    border: {
      primary: 'border-emerald-300 dark:border-[#0f4c0f]',   // Enhanced border: better definition
      secondary: 'border-emerald-400 dark:border-[#125a2b]', // Stronger border: clear separation
      strong: 'border-emerald-500 dark:border-[#158f3e]',    // Strong border: maximum definition
    },
    
    text: {
      primary: 'text-emerald-900 dark:text-[#dcfce7]',    // Green text: theme-aware maximum readability
      secondary: 'text-emerald-700 dark:text-[#bbf7d0]',  // Green text: theme-aware good contrast
      tertiary: 'text-emerald-600 dark:text-[#86efac]',   // Green text: theme-aware subtle content
      muted: 'text-emerald-500 dark:text-[#6ee7b7]',      // Green text: theme-aware background content
      light: 'text-emerald-400 dark:text-[#34d399]',      // Green text: theme-aware minimal contrast
    },
    
    cardTypes: {
      topic: {
        container: 'bg-[#a7f3d0] border-emerald-400 text-emerald-800 dark:bg-[#0f4c0f] dark:border-[#125a2b] dark:text-[#dcfce7]',
        borderColor: 'border-emerald-400 dark:border-[#125a2b]',
        background: 'bg-[#a7f3d0] dark:bg-[#0f4c0f]',
        text: 'text-emerald-800 dark:text-[#dcfce7]',
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
  
  // Dark mode colors - custom darkened emerald ramp for deeper forest appearance
  dark: {
    primary: 'bg-emerald-50 dark:bg-[#011b01]',        // Extra darkened emerald-950: #022c02 → #011b01 (15% darker)
    secondary: 'bg-white dark:bg-[#011b01]',           // Extra darkened emerald-950: #022c02 → #011b01 (15% darker)
    tertiary: 'bg-emerald-100 dark:bg-[#0a3d0a]',     // Darkened emerald-900: #065f46 → #0a3d0a
    card: 'bg-emerald-50 dark:bg-[#0f4c0f]',          // Darkened emerald-800: #166534 → #0f4c0f
    dropdown: 'bg-white dark:bg-[#011b01]',           // Extra darkened emerald-950: #022c02 → #011b01 (15% darker)
    hover: 'hover:bg-emerald-50 dark:hover:bg-[#0a3d0a]/50', // Darkened emerald-900 with opacity
    hoverStrong: 'hover:bg-emerald-100 dark:hover:bg-[#0f4c0f]', // Darkened emerald-800
    accent: 'bg-emerald-50 dark:bg-[#0f4c0f]',        // Darkened emerald-800: #166534 → #0f4c0f
    divider: 'bg-emerald-300 dark:bg-[#125a2b]',      // Darkened emerald-700: #15803d → #125a2b
    
    border: {
      primary: 'border-emerald-200 dark:border-[#0f4c0f]',   // Darkened emerald-800: #166534 → #0f4c0f
      secondary: 'border-emerald-300 dark:border-[#125a2b]', // Darkened emerald-700: #15803d → #125a2b
      strong: 'border-emerald-400 dark:border-[#158f3e]',    // Darkened emerald-600: #16a34a → #158f3e
    },
    
    text: {
      primary: 'text-slate-900 dark:text-[#dcfce7]',    // Darkened emerald-50: #ecfdf5 → #dcfce7
      secondary: 'text-slate-700 dark:text-[#bbf7d0]',  // Darkened emerald-100: #d1fae5 → #bbf7d0
      tertiary: 'text-slate-600 dark:text-[#86efac]',   // Darkened emerald-200: #a7f3d0 → #86efac
      muted: 'text-slate-500 dark:text-[#6ee7b7]',      // Darkened emerald-300: #6ee7b7 (slightly adjusted)
      light: 'text-slate-400 dark:text-[#34d399]',      // Emerald-400: maintaining good contrast
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-emerald-300 text-slate-800 dark:bg-[#0f4c0f] dark:border-[#125a2b] dark:text-[#dcfce7]',
        borderColor: 'border-emerald-300 dark:border-[#125a2b]',
        background: 'bg-white dark:bg-[#0f4c0f]',
        text: 'text-slate-800 dark:text-[#dcfce7]',
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

export default greenTheme;