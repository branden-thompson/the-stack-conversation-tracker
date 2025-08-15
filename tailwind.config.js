// tailwind.config.js
module.exports = {
    darkMode: 'class',
    content: [
      './app/**/*.{js,jsx,ts,tsx}',
      './components/**/*.{js,jsx,ts,tsx}',
      './lib/**/*.{js,jsx,ts,tsx}',
    ],
    theme: { 
      extend: {
        animation: {
          'slide-in-left': 'slideInLeft 0.6s ease-out',
          'slide-in-right': 'slideInRight 0.6s ease-out',
          'fade-in-scale': 'fadeInScale 0.3s ease-out',
          'fade-in': 'fadeIn 0.5s ease-out',
          'bounce-subtle': 'bounceSubtle 2s infinite',
        },
        keyframes: {
          slideInLeft: {
            '0%': {
              opacity: '0',
              transform: 'translateX(-100px)',
            },
            '100%': {
              opacity: '1',
              transform: 'translateX(0)',
            },
          },
          slideInRight: {
            '0%': {
              opacity: '0',
              transform: 'translateX(100px)',
            },
            '100%': {
              opacity: '1',
              transform: 'translateX(0)',
            },
          },
          fadeInScale: {
            '0%': {
              opacity: '0',
              transform: 'scale(0.95)',
            },
            '100%': {
              opacity: '1',
              transform: 'scale(1)',
            },
          },
          fadeIn: {
            '0%': {
              opacity: '0',
            },
            '100%': {
              opacity: '1',
            },
          },
          bounceSubtle: {
            '0%, 100%': {
              transform: 'translateY(0)',
            },
            '50%': {
              transform: 'translateY(-5px)',
            },
          },
        },
      } 
    },
    plugins: [],
  };