/**
 * International Orange Color Theme
 * Aviation and engineering safety orange theme
 * 
 * Base Colors:
 * - International Orange (#FF4F00) - aerospace/safety standard
 * - Light mode: Cream/beige backgrounds with orange accents
 * - Dark mode: Deep orange backgrounds with bright orange accents
 */

export const internationalOrangeTheme = {
  id: 'international-orange',
  name: 'International Orange',
  description: 'Aviation-grade safety orange with professional contrast',
  
  // Light mode colors - Cream/beige backgrounds with International Orange accents
  light: {
    primary: 'bg-[#fffbf5] dark:bg-[#1a0800]',        // Very light cream background
    secondary: 'bg-[#fff8f0] dark:bg-[#2d1100]',      // Light cream zones
    tertiary: 'bg-[#fef3e2] dark:bg-[#3d1900]',      // Warm cream headers
    card: 'bg-[#ffffff] dark:bg-[#4d2200]',          // White cards with warmth
    dropdown: 'bg-[#ffffff] dark:bg-[#2d1100]',       // White dropdowns
    hover: 'hover:bg-[#fef3e2] dark:hover:bg-[#3d1900]/70', // Warm cream hover
    hoverStrong: 'hover:bg-[#fed7aa] dark:hover:bg-[#4d2200]', // Light orange hover
    accent: 'bg-[#fed7aa] dark:bg-[#4d2200]',        // Light orange accent
    divider: 'bg-[#FF4F00] dark:bg-[#FF4F00]',       // International Orange dividers
    
    border: {
      primary: 'border-[#fed7aa] dark:border-[#4d2200]',   // Light orange border
      secondary: 'border-[#fdba74] dark:border-[#662d00]', // Medium orange border
      strong: 'border-[#FF4F00] dark:border-[#FF4F00]',    // International Orange strong
    },
    
    text: {
      primary: 'text-[#431407] dark:text-[#fed7aa]',    // Dark brown / light orange
      secondary: 'text-[#7c2d12] dark:text-[#fdba74]',  // Dark orange / medium orange
      tertiary: 'text-[#9a3412] dark:text-[#fb923c]',   // Orange-700 / orange-400
      muted: 'text-[#c2410c] dark:text-[#f97316]',      // Orange-600 / orange-500
      light: 'text-[#ea580c] dark:text-[#ff8c42]',      // Orange-500 / lighter orange
    },
    
    cardTypes: {
      topic: {
        container: 'bg-[#ffffff] border-[#FF4F00] text-[#431407] dark:bg-[#4d2200] dark:border-[#FF4F00] dark:text-[#fed7aa]',
        borderColor: 'border-[#FF4F00] dark:border-[#FF4F00]',
        background: 'bg-[#ffffff] dark:bg-[#4d2200]',
        text: 'text-[#431407] dark:text-[#fed7aa]',
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
  
  // Dark mode colors - Deep orange theme with International Orange accents
  dark: {
    primary: 'bg-gray-50 dark:bg-[#1a0800]',        // Very dark orange-black
    secondary: 'bg-white dark:bg-[#2d1100]',         // Dark orange zones
    tertiary: 'bg-gray-100 dark:bg-[#3d1900]',      // Medium dark orange headers
    card: 'bg-gray-50 dark:bg-[#4d2200]',           // Orange-brown cards
    dropdown: 'bg-white dark:bg-[#2d1100]',         // Dark orange dropdowns
    hover: 'hover:bg-gray-50 dark:hover:bg-[#3d1900]/70', // Medium dark orange hover
    hoverStrong: 'hover:bg-gray-100 dark:hover:bg-[#4d2200]', // Orange-brown hover
    accent: 'bg-gray-50 dark:bg-[#4d2200]',         // Orange-brown accent
    divider: 'bg-gray-300 dark:bg-[#FF4F00]',       // International Orange dividers
    
    border: {
      primary: 'border-gray-200 dark:border-[#4d2200]',   // Orange-brown border
      secondary: 'border-gray-300 dark:border-[#662d00]', // Darker orange border
      strong: 'border-gray-400 dark:border-[#FF4F00]',    // International Orange strong
    },
    
    text: {
      primary: 'text-gray-900 dark:text-[#fed7aa]',    // Light orange text
      secondary: 'text-gray-700 dark:text-[#fdba74]',  // Medium orange text
      tertiary: 'text-gray-600 dark:text-[#fb923c]',   // Orange-400 text
      muted: 'text-gray-500 dark:text-[#f97316]',      // Orange-500 text
      light: 'text-gray-400 dark:text-[#ff8c42]',      // Lighter orange text
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-gray-300 text-gray-800 dark:bg-[#4d2200] dark:border-[#FF4F00] dark:text-[#fed7aa]',
        borderColor: 'border-gray-300 dark:border-[#FF4F00]',
        background: 'bg-white dark:bg-[#4d2200]',
        text: 'text-gray-800 dark:text-[#fed7aa]',
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

export default internationalOrangeTheme;