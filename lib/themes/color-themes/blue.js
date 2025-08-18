/**
 * Blue Color Theme
 * A calming blue theme for app pages
 */

export const blueTheme = {
  id: 'blue',
  name: 'Ocean Blue',
  description: 'A calming blue theme with subtle oceanic tints',
  
  // Light mode colors - very subtle blue hints
  light: {
    primary: 'bg-sky-50 dark:bg-sky-950',
    secondary: 'bg-white dark:bg-sky-900',
    tertiary: 'bg-sky-100 dark:bg-sky-800',
    card: 'bg-sky-50 dark:bg-sky-800',
    dropdown: 'bg-white dark:bg-sky-950',
    hover: 'hover:bg-sky-50 dark:hover:bg-sky-900/50',
    hoverStrong: 'hover:bg-sky-100 dark:hover:bg-sky-800',
    accent: 'bg-sky-50 dark:bg-sky-800',
    
    border: {
      primary: 'border-sky-200 dark:border-sky-700',
      secondary: 'border-sky-300 dark:border-sky-600',
      strong: 'border-sky-400 dark:border-sky-500',
    },
    
    text: {
      primary: 'text-slate-900 dark:text-sky-100',
      secondary: 'text-slate-700 dark:text-sky-200',
      tertiary: 'text-slate-600 dark:text-sky-300',
      muted: 'text-slate-500 dark:text-sky-400',
      light: 'text-slate-400 dark:text-sky-500',
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-sky-300 text-slate-800 dark:bg-sky-800 dark:border-sky-600 dark:text-sky-100',
        borderColor: 'border-sky-300 dark:border-sky-600',
        background: 'bg-white dark:bg-sky-800',
        text: 'text-slate-800 dark:text-sky-100',
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
  
  // Dark mode colors - proper dark blue theme
  dark: {
    primary: 'bg-sky-50 dark:bg-sky-950',
    secondary: 'bg-white dark:bg-sky-900',
    tertiary: 'bg-sky-100 dark:bg-sky-800',
    card: 'bg-sky-50 dark:bg-sky-800',
    dropdown: 'bg-white dark:bg-sky-950',
    hover: 'hover:bg-sky-50 dark:hover:bg-sky-900/50',
    hoverStrong: 'hover:bg-sky-100 dark:hover:bg-sky-800',
    accent: 'bg-sky-50 dark:bg-sky-800',
    
    border: {
      primary: 'border-sky-200 dark:border-sky-700',
      secondary: 'border-sky-300 dark:border-sky-600',
      strong: 'border-sky-400 dark:border-sky-500',
    },
    
    text: {
      primary: 'text-slate-900 dark:text-sky-100',
      secondary: 'text-slate-700 dark:text-sky-200',
      tertiary: 'text-slate-600 dark:text-sky-300',
      muted: 'text-slate-500 dark:text-sky-400',
      light: 'text-slate-400 dark:text-sky-500',
    },
    
    cardTypes: {
      topic: {
        container: 'bg-white border-sky-300 text-slate-800 dark:bg-sky-800 dark:border-sky-600 dark:text-sky-100',
        borderColor: 'border-sky-300 dark:border-sky-600',
        background: 'bg-white dark:bg-sky-800',
        text: 'text-slate-800 dark:text-sky-100',
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