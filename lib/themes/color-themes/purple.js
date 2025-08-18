/**
 * Purple Color Theme
 * A sophisticated purple theme for app pages
 */

export const purpleTheme = {
  id: 'purple',
  name: 'Royal Purple',
  description: 'A sophisticated purple theme with royal elegance',
  
  // Light mode colors - subtle purple hints
  light: {
    primary: 'bg-violet-50 dark:bg-slate-950',
    secondary: 'bg-white dark:bg-slate-950',
    tertiary: 'bg-violet-100 dark:bg-violet-950',
    card: 'bg-violet-50 dark:bg-violet-900',
    dropdown: 'bg-white dark:bg-slate-950',
    hover: 'hover:bg-violet-50 dark:hover:bg-violet-950/50',
    hoverStrong: 'hover:bg-violet-100 dark:hover:bg-violet-900',
    accent: 'bg-violet-50 dark:bg-violet-900',
    divider: 'bg-violet-300 dark:bg-violet-800',
    
    border: {
      primary: 'border-violet-200 dark:border-violet-900',
      secondary: 'border-violet-300 dark:border-violet-800',
      strong: 'border-violet-400 dark:border-violet-700',
    },
    
    text: {
      primary: 'text-slate-900 dark:text-violet-50',
      secondary: 'text-slate-700 dark:text-violet-100',
      tertiary: 'text-slate-600 dark:text-violet-200',
      muted: 'text-slate-500 dark:text-violet-300',
      light: 'text-slate-400 dark:text-violet-400',
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-violet-300 text-slate-800 dark:bg-violet-900 dark:border-violet-800 dark:text-violet-100',
        borderColor: 'border-violet-300 dark:border-violet-800',
        background: 'bg-white dark:bg-violet-900',
        text: 'text-slate-800 dark:text-violet-100',
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
  
  // Dark mode colors - using Blue template ratios with violet colors
  dark: {
    primary: 'bg-violet-50 dark:bg-slate-950',
    secondary: 'bg-white dark:bg-slate-950',
    tertiary: 'bg-violet-100 dark:bg-violet-950',
    card: 'bg-violet-50 dark:bg-violet-900',
    dropdown: 'bg-white dark:bg-slate-950',
    hover: 'hover:bg-violet-50 dark:hover:bg-violet-950/50',
    hoverStrong: 'hover:bg-violet-100 dark:hover:bg-violet-900',
    accent: 'bg-violet-50 dark:bg-violet-900',
    divider: 'bg-violet-300 dark:bg-violet-800',
    
    border: {
      primary: 'border-violet-200 dark:border-violet-900',
      secondary: 'border-violet-300 dark:border-violet-800',
      strong: 'border-violet-400 dark:border-violet-700',
    },
    
    text: {
      primary: 'text-slate-900 dark:text-violet-50',
      secondary: 'text-slate-700 dark:text-violet-100',
      tertiary: 'text-slate-600 dark:text-violet-200',
      muted: 'text-slate-500 dark:text-violet-300',
      light: 'text-slate-400 dark:text-violet-400',
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-violet-300 text-slate-800 dark:bg-violet-900 dark:border-violet-800 dark:text-violet-100',
        borderColor: 'border-violet-300 dark:border-violet-800',
        background: 'bg-white dark:bg-violet-900',
        text: 'text-slate-800 dark:text-violet-100',
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