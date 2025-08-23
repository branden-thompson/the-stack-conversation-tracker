/**
 * Tiffany Blue Color Theme
 * Luxury teal theme inspired by Tiffany & Co.
 * 
 * Base Colors:
 * - Tiffany Blue (#0ABAB5) - the iconic luxury teal
 * - Light mode: Soft mint/cream backgrounds with teal accents
 * - Dark mode: Deep teal backgrounds with bright teal accents
 */

export const tiffanyBlueTheme = {
  id: 'tiffany-blue',
  name: 'Tiffany Teal',
  description: 'Luxury teal elegance with sophisticated contrast',
  
  // Light mode colors - Soft mint/cream backgrounds with Tiffany Blue accents
  light: {
    primary: 'bg-[#f7fefd] dark:bg-[#081716]',        // Very light mint background
    secondary: 'bg-[#f0fdfa] dark:bg-[#0f2e2a]',      // Light mint zones
    tertiary: 'bg-[#ccfbf1] dark:bg-[#164e4a]',      // Soft teal headers
    card: 'bg-[#ffffff] dark:bg-[#1f5551]',          // White cards with mint tint
    dropdown: 'bg-[#ffffff] dark:bg-[#0f2e2a]',       // White dropdowns
    hover: 'hover:bg-[#ccfbf1] dark:hover:bg-[#164e4a]/70', // Soft teal hover
    hoverStrong: 'hover:bg-[#99f6e4] dark:hover:bg-[#1f5551]', // Light teal hover
    accent: 'bg-[#99f6e4] dark:bg-[#1f5551]',        // Light teal accent
    divider: 'bg-[#0ABAB5] dark:bg-[#0ABAB5]',       // Tiffany Blue dividers
    
    border: {
      primary: 'border-[#99f6e4] dark:border-[#1f5551]',   // Light teal border
      secondary: 'border-[#5eead4] dark:border-[#2d6a65]', // Medium teal border
      strong: 'border-[#0ABAB5] dark:border-[#0ABAB5]',    // Tiffany Blue strong
    },
    
    text: {
      primary: 'text-[#134e4a] dark:text-[#99f6e4]',    // Dark teal / light teal
      secondary: 'text-[#0f766e] dark:text-[#5eead4]',  // Teal-700 / teal-300
      tertiary: 'text-[#0d9488] dark:text-[#2dd4bf]',   // Teal-600 / teal-400
      muted: 'text-[#14b8a6] dark:text-[#0ABAB5]',      // Teal-500 / Tiffany Blue
      light: 'text-[#2dd4bf] dark:text-[#7dd3fc]',      // Teal-400 / lighter teal
    },
    
    cardTypes: {
      topic: {
        container: 'bg-[#ffffff] border-[#0ABAB5] text-[#134e4a] dark:bg-[#1f5551] dark:border-[#0ABAB5] dark:text-[#99f6e4]',
        borderColor: 'border-[#0ABAB5] dark:border-[#0ABAB5]',
        background: 'bg-[#ffffff] dark:bg-[#1f5551]',
        text: 'text-[#134e4a] dark:text-[#99f6e4]',
      },
      question: {
        container: 'bg-[#eff6ff] border-[#3b82f6] text-[#1e40af] dark:bg-[#1e3a5f] dark:border-[#3b82f6] dark:text-[#93c5fd]',
        borderColor: 'border-[#3b82f6] dark:border-[#3b82f6]',
        background: 'bg-[#eff6ff] dark:bg-[#1e3a5f]',
        text: 'text-[#1e40af] dark:text-[#93c5fd]',
      },
      accusation: {
        container: 'bg-[#fef2f2] border-[#dc2626] text-[#991b1b] dark:bg-[#4c1d1d] dark:border-[#dc2626] dark:text-[#fca5a5]',
        borderColor: 'border-[#dc2626] dark:border-[#dc2626]',
        background: 'bg-[#fef2f2] dark:bg-[#4c1d1d]',
        text: 'text-[#991b1b] dark:text-[#fca5a5]',
      },
      fact: {
        container: 'bg-[#fffbeb] border-[#f59e0b] text-[#d97706] dark:bg-[#4c3d1d] dark:border-[#f59e0b] dark:text-[#fcd34d]',
        borderColor: 'border-[#f59e0b] dark:border-[#f59e0b]',
        background: 'bg-[#fffbeb] dark:bg-[#4c3d1d]',
        text: 'text-[#d97706] dark:text-[#fcd34d]',
      },
      guess: {
        container: 'bg-[#faf5ff] border-[#8b5cf6] text-[#7c3aed] dark:bg-[#3d2d4c] dark:border-[#8b5cf6] dark:text-[#c4b5fd]',
        borderColor: 'border-[#8b5cf6] dark:border-[#8b5cf6]',
        background: 'bg-[#faf5ff] dark:bg-[#3d2d4c]',
        text: 'text-[#7c3aed] dark:text-[#c4b5fd]',
      },
      opinion: {
        container: 'bg-[#fdf2f8] border-[#ec4899] text-[#be185d] dark:bg-[#4c2d3d] dark:border-[#ec4899] dark:text-[#f9a8d4]',
        borderColor: 'border-[#ec4899] dark:border-[#ec4899]',
        background: 'bg-[#fdf2f8] dark:bg-[#4c2d3d]',
        text: 'text-[#be185d] dark:text-[#f9a8d4]',
      },
    }
  },
  
  // Dark mode colors - Deep teal theme with Tiffany Blue accents
  dark: {
    primary: 'bg-gray-50 dark:bg-[#081716]',        // Very dark teal-black
    secondary: 'bg-white dark:bg-[#0f2e2a]',         // Dark teal zones
    tertiary: 'bg-gray-100 dark:bg-[#164e4a]',      // Medium teal headers
    card: 'bg-gray-50 dark:bg-[#1f5551]',           // Teal-800 cards
    dropdown: 'bg-white dark:bg-[#0f2e2a]',         // Dark teal dropdowns
    hover: 'hover:bg-gray-50 dark:hover:bg-[#164e4a]/70', // Medium teal hover
    hoverStrong: 'hover:bg-gray-100 dark:hover:bg-[#1f5551]', // Teal-800 hover
    accent: 'bg-gray-50 dark:bg-[#1f5551]',         // Teal-800 accent
    divider: 'bg-gray-300 dark:bg-[#0ABAB5]',       // Tiffany Blue dividers
    
    border: {
      primary: 'border-gray-200 dark:border-[#1f5551]',   // Teal-800 border
      secondary: 'border-gray-300 dark:border-[#2d6a65]', // Darker teal border
      strong: 'border-gray-400 dark:border-[#0ABAB5]',    // Tiffany Blue strong
    },
    
    text: {
      primary: 'text-gray-900 dark:text-[#99f6e4]',    // Light teal text
      secondary: 'text-gray-700 dark:text-[#5eead4]',  // Medium teal text
      tertiary: 'text-gray-600 dark:text-[#2dd4bf]',   // Teal-400 text
      muted: 'text-gray-500 dark:text-[#0ABAB5]',      // Tiffany Blue text
      light: 'text-gray-400 dark:text-[#7dd3fc]',      // Lighter teal text
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-gray-300 text-gray-800 dark:bg-[#1f5551] dark:border-[#0ABAB5] dark:text-[#99f6e4]',
        borderColor: 'border-gray-300 dark:border-[#0ABAB5]',
        background: 'bg-white dark:bg-[#1f5551]',
        text: 'text-gray-800 dark:text-[#99f6e4]',
      },
      question: {
        container: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-[#1e3a5f] dark:border-[#3b82f6] dark:text-[#93c5fd]',
        borderColor: 'border-blue-300 dark:border-[#3b82f6]',
        background: 'bg-blue-50 dark:bg-[#1e3a5f]',
        text: 'text-blue-900 dark:text-[#93c5fd]',
      },
      accusation: {
        container: 'bg-red-50 border-red-300 text-red-900 dark:bg-[#4c1d1d] dark:border-[#dc2626] dark:text-[#fca5a5]',
        borderColor: 'border-red-300 dark:border-[#dc2626]',
        background: 'bg-red-50 dark:bg-[#4c1d1d]',
        text: 'text-red-900 dark:text-[#fca5a5]',
      },
      fact: {
        container: 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-[#4c3d1d] dark:border-[#f59e0b] dark:text-[#fcd34d]',
        borderColor: 'border-yellow-300 dark:border-[#f59e0b]',
        background: 'bg-yellow-50 dark:bg-[#4c3d1d]',
        text: 'text-yellow-900 dark:text-[#fcd34d]',
      },
      guess: {
        container: 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-[#3d2d4c] dark:border-[#8b5cf6] dark:text-[#c4b5fd]',
        borderColor: 'border-purple-300 dark:border-[#8b5cf6]',
        background: 'bg-purple-50 dark:bg-[#3d2d4c]',
        text: 'text-purple-900 dark:text-[#c4b5fd]',
      },
      opinion: {
        container: 'bg-pink-50 border-pink-300 text-pink-900 dark:bg-[#4c2d3d] dark:border-[#ec4899] dark:text-[#f9a8d4]',
        borderColor: 'border-pink-300 dark:border-[#ec4899]',
        background: 'bg-pink-50 dark:bg-[#4c2d3d]',
        text: 'text-pink-900 dark:text-[#f9a8d4]',
      },
    }
  }
};

export default tiffanyBlueTheme;