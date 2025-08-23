/**
 * Synthwave San Diego Color Theme
 * A light-mode version of Synthwave84 with California vibes
 * 
 * Base Colors:
 * - Light backgrounds with subtle pink/purple tints
 * - Bright pink accents and borders
 * - Deep teal text for contrast
 */

export const synthwaveSanDiegoTheme = {
  id: 'synthwave-san-diego',
  name: 'Synthwave San Diego',
  description: 'California sunshine meets synthwave aesthetics',
  
  // Light mode colors - Pastel blue backgrounds darkened 10% for better contrast
  light: {
    primary: 'bg-[#d9fffe] dark:bg-[#0f0a14]',        // 10% darker than #f0fffe (85% lighter than #00FFFB)
    secondary: 'bg-[#e6ffff] dark:bg-[#1a1423]',      // 10% darker than #f5ffff (87% lighter than #00FFFB)
    tertiary: 'bg-[#ccfffe] dark:bg-[#201a2a]',      // 10% darker than #e6fffe (80% lighter than #00FFFB)
    card: 'bg-[#b3fffc] dark:bg-[#2a1f35]',          // 10% darker than #ccfffd (70% lighter than #00FFFB)
    dropdown: 'bg-[#e6ffff] dark:bg-[#1a1423]',      // Match secondary for consistency
    hover: 'hover:bg-[#ccfffe] dark:hover:bg-[#201a2a]/60', // Match tertiary for hover
    hoverStrong: 'hover:bg-[#b3fffc] dark:hover:bg-[#2a1f35]', // Match card for strong hover
    accent: 'bg-[#b3fffc] dark:bg-[#2a1f35]',        // Match card for accent
    divider: 'bg-[#8C00FF] dark:bg-[#d946ef]',       // Hot purple dividers
    
    border: {
      primary: 'border-[#B366FF] dark:border-[#3a2547]',   // Light hot purple border
      secondary: 'border-[#9933FF] dark:border-[#4a3057]', // Medium hot purple border
      strong: 'border-[#8C00FF] dark:border-[#d946ef]',    // Hot purple for strong borders
    },
    
    text: {
      primary: 'text-[#CC0099] dark:text-[#00e1ff]',    // Hot pink for primary text (darker than #FF00EE)
      secondary: 'text-[#E6009F] dark:text-[#4de7ff]',  // Medium hot pink for secondary  
      tertiary: 'text-[#FF00AA] dark:text-[#80edff]',   // Bright hot pink for tertiary
      muted: 'text-[#FF33BB] dark:text-[#b3f3ff]',      // Light hot pink for muted
      light: 'text-[#FF66CC] dark:text-[#ccf5ff]',      // Very light hot pink for light text
    },
    
    cardTypes: {
      topic: {
        container: 'bg-[#ccfffd] border-[#8C00FF] text-[#CC0099] dark:bg-[#2d1f3a] dark:border-[#f52baf] dark:text-[#00D4FF]',
        borderColor: 'border-[#8C00FF] dark:border-[#f52baf]',
        background: 'bg-[#ccfffd] dark:bg-[#2d1f3a]',
        text: 'text-[#CC0099] dark:text-[#00D4FF]',
      },
      question: {
        container: 'bg-[#e6fffe] border-[#6600CC] text-[#E6009F] dark:bg-[#1a0f2a] dark:border-[#0099cc] dark:text-[#66ebff]',
        borderColor: 'border-[#6600CC] dark:border-[#0099cc]',
        background: 'bg-[#e6fffe] dark:bg-[#1a0f2a]',
        text: 'text-[#E6009F] dark:text-[#66ebff]',
      },
      accusation: {
        container: 'bg-[#f0fffe] border-[#FF0080] text-[#CC0066] dark:bg-[#2a0f1a] dark:border-[#cc1155] dark:text-[#ff6699]',
        borderColor: 'border-[#FF0080] dark:border-[#cc1155]',
        background: 'bg-[#f0fffe] dark:bg-[#2a0f1a]',
        text: 'text-[#CC0066] dark:text-[#ff6699]',
      },
      fact: {
        container: 'bg-[#f5ffff] border-[#AA00DD] text-[#FF00AA] dark:bg-[#2a221a] dark:border-[#ffaa00] dark:text-[#ffdd66]',
        borderColor: 'border-[#AA00DD] dark:border-[#ffaa00]',
        background: 'bg-[#f5ffff] dark:bg-[#2a221a]',
        text: 'text-[#FF00AA] dark:text-[#ffdd66]',
      },
      guess: {
        container: 'bg-[#e6fffe] border-[#8C00FF] text-[#FF33BB] dark:bg-[#221a2a] dark:border-[#cc55ff] dark:text-[#e699ff]',
        borderColor: 'border-[#8C00FF] dark:border-[#cc55ff]',
        background: 'bg-[#e6fffe] dark:bg-[#221a2a]',
        text: 'text-[#FF33BB] dark:text-[#e699ff]',
      },
      opinion: {
        container: 'bg-[#ccfffd] border-[#FF00EE] text-[#FF66CC] dark:bg-[#2a1a22] dark:border-[#f52baf] dark:text-[#ff99cc]',
        borderColor: 'border-[#FF00EE] dark:border-[#f52baf]',
        background: 'bg-[#ccfffd] dark:bg-[#2a1a22]',
        text: 'text-[#FF66CC] dark:text-[#ff99cc]',
      },
    }
  },
  
  // Dark mode colors - Same as original Synthwave84
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

export default synthwaveSanDiegoTheme;