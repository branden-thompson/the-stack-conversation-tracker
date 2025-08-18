/**
 * Synthwave84 Color Theme
 * A retro-futuristic synthwave theme - dark mode exclusive
 * 
 * Base Colors:
 * - Backgrounds/Zones: #201a2a (Blue-Purple)
 * - Borders/Dividers: #f52baf (Hot-Pink) 
 * - Text/Icons: #00D4FF (Hot Teal)
 */

export const synthwaveTheme = {
  id: 'synthwave',
  name: 'Synthwave 84',
  description: 'Get on the GunShip, loser.',
  darkOnly: true, // Only available in dark mode
  
  // No light mode - dark only theme
  light: {
    // Placeholder - this theme should never be used in light mode
    // but we need the structure for validation
    primary: 'bg-gray-50 dark:bg-[#0f0a14]',        // Extra darkened base: 35% darker than #201a2a
    secondary: 'bg-white dark:bg-[#0f0a14]',         // Extra darkened base: 35% darker than #201a2a  
    tertiary: 'bg-gray-100 dark:bg-[#201a2a]',      // Base background color
    card: 'bg-gray-50 dark:bg-[#2d1f3a]',           // Lightened base: 15% lighter than #201a2a
    dropdown: 'bg-white dark:bg-[#0f0a14]',         // Extra darkened base
    hover: 'hover:bg-gray-50 dark:hover:bg-[#201a2a]/50', // Base with opacity
    hoverStrong: 'hover:bg-gray-100 dark:hover:bg-[#2d1f3a]', // Lightened base
    accent: 'bg-gray-50 dark:bg-[#2d1f3a]',         // Lightened base
    divider: 'bg-gray-300 dark:bg-[#f52baf]',       // Hot-Pink dividers
    
    border: {
      primary: 'border-gray-200 dark:border-[#3a2547]',   // Balanced border visibility
      secondary: 'border-gray-300 dark:border-[#4a3057]', // Slightly stronger for definition
      strong: 'border-gray-400 dark:border-[#d946ef]',    // Muted pink for important borders
    },
    
    text: {
      primary: 'text-gray-900 dark:text-[#00e1ff]',    // Slightly softened teal for better readability
      secondary: 'text-gray-700 dark:text-[#4de7ff]',  // Balanced teal with good contrast
      tertiary: 'text-gray-600 dark:text-[#80edff]',   // Muted teal for secondary content
      muted: 'text-gray-500 dark:text-[#b3f3ff]',      // Subtle teal for supporting text
      light: 'text-gray-400 dark:text-[#ccf5ff]',      // Very light teal for minimal content
    },
    
    cardTypes: {
      topic: {
        container: 'bg-gray-50 border-gray-300 text-gray-800 dark:bg-[#2d1f3a] dark:border-[#f52baf] dark:text-[#00D4FF]',
        borderColor: 'border-gray-300 dark:border-[#f52baf]',
        background: 'bg-gray-50 dark:bg-[#2d1f3a]',
        text: 'text-gray-800 dark:text-[#00D4FF]',
      },
      question: {
        container: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-[#1a0f2a] dark:border-[#0099cc] dark:text-[#66ebff]',
        borderColor: 'border-blue-300 dark:border-[#0099cc]',
        background: 'bg-blue-50 dark:bg-[#1a0f2a]',
        text: 'text-blue-900 dark:text-[#66ebff]',
      },
      accusation: {
        container: 'bg-red-50 border-red-300 text-red-900 dark:bg-[#2a0f1a] dark:border-[#cc1155] dark:text-[#ff6699]',
        borderColor: 'border-red-300 dark:border-[#cc1155]',
        background: 'bg-red-50 dark:bg-[#2a0f1a]',
        text: 'text-red-900 dark:text-[#ff6699]',
      },
      fact: {
        container: 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-[#2a221a] dark:border-[#ffaa00] dark:text-[#ffdd66]',
        borderColor: 'border-yellow-300 dark:border-[#ffaa00]',
        background: 'bg-yellow-50 dark:bg-[#2a221a]',
        text: 'text-yellow-900 dark:text-[#ffdd66]',
      },
      guess: {
        container: 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-[#221a2a] dark:border-[#cc55ff] dark:text-[#e699ff]',
        borderColor: 'border-purple-300 dark:border-[#cc55ff]',
        background: 'bg-purple-50 dark:bg-[#221a2a]',
        text: 'text-purple-900 dark:text-[#e699ff]',
      },
      opinion: {
        container: 'bg-pink-50 border-pink-300 text-pink-900 dark:bg-[#2a1a22] dark:border-[#f52baf] dark:text-[#ff99cc]',
        borderColor: 'border-pink-300 dark:border-[#f52baf]',
        background: 'bg-pink-50 dark:bg-[#2a1a22]',
        text: 'text-pink-900 dark:text-[#ff99cc]',
      },
    }
  },
  
  // Dark mode colors - Synthwave84 retro-futuristic theme (BALANCED APPROACH)
  dark: {
    primary: 'bg-gray-50 dark:bg-[#0f0a14]',        // Extra darkened base: 35% darker than #201a2a
    secondary: 'bg-white dark:bg-[#1a1423]',         // Slightly lighter than primary for contrast
    tertiary: 'bg-gray-100 dark:bg-[#201a2a]',      // Base background color
    card: 'bg-gray-50 dark:bg-[#2a1f35]',           // Card background - balanced between readability and theme
    dropdown: 'bg-white dark:bg-[#1a1423]',         // Match secondary for consistency
    hover: 'hover:bg-gray-50 dark:hover:bg-[#201a2a]/60', // Slightly more opaque for better feedback
    hoverStrong: 'hover:bg-gray-100 dark:hover:bg-[#2a1f35]', // Match card color
    accent: 'bg-gray-50 dark:bg-[#2a1f35]',         // Match card for consistency
    divider: 'bg-gray-300 dark:bg-[#d946ef]',       // Slightly muted pink for better balance
    
    border: {
      primary: 'border-gray-200 dark:border-[#3a2547]',   // Balanced border visibility
      secondary: 'border-gray-300 dark:border-[#4a3057]', // Slightly stronger for definition
      strong: 'border-gray-400 dark:border-[#d946ef]',    // Muted pink for important borders
    },
    
    text: {
      primary: 'text-gray-900 dark:text-[#00e1ff]',    // Slightly softened teal for better readability
      secondary: 'text-gray-700 dark:text-[#4de7ff]',  // Balanced teal with good contrast
      tertiary: 'text-gray-600 dark:text-[#80edff]',   // Muted teal for secondary content
      muted: 'text-gray-500 dark:text-[#b3f3ff]',      // Subtle teal for supporting text
      light: 'text-gray-400 dark:text-[#ccf5ff]',      // Very light teal for minimal content
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-gray-300 text-gray-800 dark:bg-[#2d1f3a] dark:border-[#f52baf] dark:text-[#00D4FF]',
        borderColor: 'border-gray-300 dark:border-[#f52baf]',
        background: 'bg-white dark:bg-[#2d1f3a]',
        text: 'text-gray-800 dark:text-[#00D4FF]',
      },
      question: {
        container: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-[#1a0f2a] dark:border-[#0099cc] dark:text-[#66ebff]',
        borderColor: 'border-blue-300 dark:border-[#0099cc]',
        background: 'bg-blue-50 dark:bg-[#1a0f2a]',
        text: 'text-blue-900 dark:text-[#66ebff]',
      },
      accusation: {
        container: 'bg-red-50 border-red-300 text-red-900 dark:bg-[#2a0f1a] dark:border-[#cc1155] dark:text-[#ff6699]',
        borderColor: 'border-red-300 dark:border-[#cc1155]',
        background: 'bg-red-50 dark:bg-[#2a0f1a]',
        text: 'text-red-900 dark:text-[#ff6699]',
      },
      fact: {
        container: 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-[#2a221a] dark:border-[#ffaa00] dark:text-[#ffdd66]',
        borderColor: 'border-yellow-300 dark:border-[#ffaa00]',
        background: 'bg-yellow-50 dark:bg-[#2a221a]',
        text: 'text-yellow-900 dark:text-[#ffdd66]',
      },
      guess: {
        container: 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-[#221a2a] dark:border-[#cc55ff] dark:text-[#e699ff]',
        borderColor: 'border-purple-300 dark:border-[#cc55ff]',
        background: 'bg-purple-50 dark:bg-[#221a2a]',
        text: 'text-purple-900 dark:text-[#e699ff]',
      },
      opinion: {
        container: 'bg-pink-50 border-pink-300 text-pink-900 dark:bg-[#2a1a22] dark:border-[#f52baf] dark:text-[#ff99cc]',
        borderColor: 'border-pink-300 dark:border-[#f52baf]',
        background: 'bg-pink-50 dark:bg-[#2a1a22]',
        text: 'text-pink-900 dark:text-[#ff99cc]',
      },
    }
  }
};

export default synthwaveTheme;