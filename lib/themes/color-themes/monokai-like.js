/**
 * Monokai-like Color Theme
 * Classic code editor colors inspired by Monokai Pro
 * 
 * Base Colors:
 * - Dark charcoal backgrounds (#2c2c2c, #3c3c3c)
 * - Bright green accents (#a6e22e)
 * - Orange highlights (#fd971f)
 * - Purple text (#ae81ff)
 */

export const monokaiLikeTheme = {
  id: 'monokai-like',
  name: 'Monokai-like',
  description: 'Classic code editor aesthetics with charcoal and green tones',
  
  // Light mode colors - Inverted Monokai with light backgrounds
  light: {
    primary: 'bg-[#fafafa] dark:bg-[#1e1e1e]',        // Very light gray background
    secondary: 'bg-[#f5f5f5] dark:bg-[#2c2c2c]',      // Light gray zones
    tertiary: 'bg-[#e8e8e8] dark:bg-[#3c3c3c]',      // Medium gray headers
    card: 'bg-[#ffffff] dark:bg-[#4a4a4a]',          // White cards with subtle shadow
    dropdown: 'bg-[#ffffff] dark:bg-[#2c2c2c]',       // White dropdowns
    hover: 'hover:bg-[#f0f0f0] dark:hover:bg-[#3c3c3c]/70', // Light gray hover
    hoverStrong: 'hover:bg-[#e8e8e8] dark:hover:bg-[#4a4a4a]', // Medium gray hover
    accent: 'bg-[#e8f5e8] dark:bg-[#4a4a4a]',        // Very light green accent
    divider: 'bg-[#a6e22e] dark:bg-[#a6e22e]',       // Monokai green dividers
    
    border: {
      primary: 'border-[#d0d0d0] dark:border-[#4a4a4a]',   // Light gray border
      secondary: 'border-[#b0b0b0] dark:border-[#5a5a5a]', // Medium gray border
      strong: 'border-[#a6e22e] dark:border-[#a6e22e]',    // Green for strong borders
    },
    
    text: {
      primary: 'text-[#2c2c2c] dark:text-[#f8f8f2]',    // Dark gray / light text
      secondary: 'text-[#4a4a4a] dark:text-[#cfcfc2]',  // Medium gray / medium light
      tertiary: 'text-[#6a6a6a] dark:text-[#a6a69c]',   // Light gray / muted light
      muted: 'text-[#8a8a8a] dark:text-[#75715e]',      // Very light gray / Monokai comment
      light: 'text-[#a0a0a0] dark:text-[#49483e]',      // Subtle gray / very muted
    },
    
    cardTypes: {
      topic: {
        container: 'bg-[#ffffff] border-[#a6e22e] text-[#2c2c2c] dark:bg-[#4a4a4a] dark:border-[#a6e22e] dark:text-[#f8f8f2]',
        borderColor: 'border-[#a6e22e] dark:border-[#a6e22e]',
        background: 'bg-[#ffffff] dark:bg-[#4a4a4a]',
        text: 'text-[#2c2c2c] dark:text-[#f8f8f2]',
      },
      question: {
        container: 'bg-[#e8f4fd] border-[#66d9ef] text-[#1565c0] dark:bg-[#2d3748] dark:border-[#66d9ef] dark:text-[#66d9ef]',
        borderColor: 'border-[#66d9ef] dark:border-[#66d9ef]',
        background: 'bg-[#e8f4fd] dark:bg-[#2d3748]',
        text: 'text-[#1565c0] dark:text-[#66d9ef]',
      },
      accusation: {
        container: 'bg-[#fef2f2] border-[#f92672] text-[#c62828] dark:bg-[#3c2832] dark:border-[#f92672] dark:text-[#f92672]',
        borderColor: 'border-[#f92672] dark:border-[#f92672]',
        background: 'bg-[#fef2f2] dark:bg-[#3c2832]',
        text: 'text-[#c62828] dark:text-[#f92672]',
      },
      fact: {
        container: 'bg-[#fff8e1] border-[#fd971f] text-[#ef6c00] dark:bg-[#3c3228] dark:border-[#fd971f] dark:text-[#fd971f]',
        borderColor: 'border-[#fd971f] dark:border-[#fd971f]',
        background: 'bg-[#fff8e1] dark:bg-[#3c3228]',
        text: 'text-[#ef6c00] dark:text-[#fd971f]',
      },
      guess: {
        container: 'bg-[#f3e5f5] border-[#ae81ff] text-[#7b1fa2] dark:bg-[#322d3c] dark:border-[#ae81ff] dark:text-[#ae81ff]',
        borderColor: 'border-[#ae81ff] dark:border-[#ae81ff]',
        background: 'bg-[#f3e5f5] dark:bg-[#322d3c]',
        text: 'text-[#7b1fa2] dark:text-[#ae81ff]',
      },
      opinion: {
        container: 'bg-[#fce4ec] border-[#f92672] text-[#c2185b] dark:bg-[#3c2832] dark:border-[#f92672] dark:text-[#f92672]',
        borderColor: 'border-[#f92672] dark:border-[#f92672]',
        background: 'bg-[#fce4ec] dark:bg-[#3c2832]',
        text: 'text-[#c2185b] dark:text-[#f92672]',
      },
    }
  },
  
  // Dark mode colors - True Monokai-inspired theme
  dark: {
    primary: 'bg-gray-50 dark:bg-[#1e1e1e]',        // Darkest charcoal background
    secondary: 'bg-white dark:bg-[#2c2c2c]',         // Dark charcoal zones
    tertiary: 'bg-gray-100 dark:bg-[#3c3c3c]',      // Medium charcoal headers
    card: 'bg-gray-50 dark:bg-[#4a4a4a]',           // Lighter charcoal cards
    dropdown: 'bg-white dark:bg-[#2c2c2c]',         // Dark charcoal dropdowns
    hover: 'hover:bg-gray-50 dark:hover:bg-[#3c3c3c]/70', // Medium charcoal hover
    hoverStrong: 'hover:bg-gray-100 dark:hover:bg-[#4a4a4a]', // Lighter charcoal hover
    accent: 'bg-gray-50 dark:bg-[#4a4a4a]',         // Lighter charcoal accent
    divider: 'bg-gray-300 dark:bg-[#a6e22e]',       // Monokai green dividers
    
    border: {
      primary: 'border-gray-200 dark:border-[#4a4a4a]',   // Lighter charcoal border
      secondary: 'border-gray-300 dark:border-[#5a5a5a]', // Medium charcoal border
      strong: 'border-gray-400 dark:border-[#a6e22e]',    // Green for strong borders
    },
    
    text: {
      primary: 'text-gray-900 dark:text-[#f8f8f2]',    // Monokai foreground
      secondary: 'text-gray-700 dark:text-[#cfcfc2]',  // Lighter Monokai text
      tertiary: 'text-gray-600 dark:text-[#a6a69c]',   // Medium Monokai text
      muted: 'text-gray-500 dark:text-[#75715e]',      // Monokai comment color
      light: 'text-gray-400 dark:text-[#49483e]',      // Very muted Monokai
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-gray-300 text-gray-800 dark:bg-[#4a4a4a] dark:border-[#a6e22e] dark:text-[#f8f8f2]',
        borderColor: 'border-gray-300 dark:border-[#a6e22e]',
        background: 'bg-white dark:bg-[#4a4a4a]',
        text: 'text-gray-800 dark:text-[#f8f8f2]',
      },
      question: {
        container: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-[#2d3748] dark:border-[#66d9ef] dark:text-[#66d9ef]',
        borderColor: 'border-blue-300 dark:border-[#66d9ef]',
        background: 'bg-blue-50 dark:bg-[#2d3748]',
        text: 'text-blue-900 dark:text-[#66d9ef]',
      },
      accusation: {
        container: 'bg-red-50 border-red-300 text-red-900 dark:bg-[#3c2832] dark:border-[#f92672] dark:text-[#f92672]',
        borderColor: 'border-red-300 dark:border-[#f92672]',
        background: 'bg-red-50 dark:bg-[#3c2832]',
        text: 'text-red-900 dark:text-[#f92672]',
      },
      fact: {
        container: 'bg-yellow-50 border-yellow-300 text-yellow-900 dark:bg-[#3c3228] dark:border-[#fd971f] dark:text-[#fd971f]',
        borderColor: 'border-yellow-300 dark:border-[#fd971f]',
        background: 'bg-yellow-50 dark:bg-[#3c3228]',
        text: 'text-yellow-900 dark:text-[#fd971f]',
      },
      guess: {
        container: 'bg-purple-50 border-purple-300 text-purple-900 dark:bg-[#322d3c] dark:border-[#ae81ff] dark:text-[#ae81ff]',
        borderColor: 'border-purple-300 dark:border-[#ae81ff]',
        background: 'bg-purple-50 dark:bg-[#322d3c]',
        text: 'text-purple-900 dark:text-[#ae81ff]',
      },
      opinion: {
        container: 'bg-pink-50 border-pink-300 text-pink-900 dark:bg-[#3c2832] dark:border-[#f92672] dark:text-[#f92672]',
        borderColor: 'border-pink-300 dark:border-[#f92672]',
        background: 'bg-pink-50 dark:bg-[#3c2832]',
        text: 'text-pink-900 dark:text-[#f92672]',
      },
    }
  }
};

export default monokaiLikeTheme;