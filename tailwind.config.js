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
          'shimmer': 'shimmer 2s infinite linear',
          'heartbeat': 'heartbeat 1s ease-in-out infinite',
          'wiggle': 'wiggle 0.5s ease-in-out',
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
          shimmer: {
            '0%': {
              transform: 'translateX(-100%)',
            },
            '100%': {
              transform: 'translateX(100%)',
            },
          },
          heartbeat: {
            '0%, 100%': {
              transform: 'scale(1)',
            },
            '50%': {
              transform: 'scale(1.05)',
            },
          },
          wiggle: {
            '0%, 100%': {
              transform: 'rotate(0deg)',
            },
            '25%': {
              transform: 'rotate(-3deg)',
            },
            '75%': {
              transform: 'rotate(3deg)',
            },
          },
        },
        
        // GPU acceleration utilities
        transitionProperty: {
          'transform-gpu': 'transform',
          'opacity-gpu': 'opacity', 
          'transform-opacity-gpu': 'transform, opacity',
        },
        
        willChange: {
          'transform': 'transform',
          'opacity': 'opacity',
          'transform-opacity': 'transform, opacity',
          'contents': 'contents',
        },
      } 
    },
    plugins: [
      // Plugin to add GPU acceleration utilities
      function({ addUtilities }) {
        const newUtilities = {
          '.will-change-transform': {
            'will-change': 'transform',
          },
          '.will-change-opacity': {
            'will-change': 'opacity',
          },
          '.will-change-transform-opacity': {
            'will-change': 'transform, opacity',
          },
          '.backface-visibility-hidden': {
            'backface-visibility': 'hidden',
            '-webkit-backface-visibility': 'hidden',
          },
          '.transform-gpu': {
            'transform': 'translate3d(0, 0, 0)',
          },
          '.perspective-1000': {
            'perspective': '1000px',
          },
          '.preserve-3d': {
            'transform-style': 'preserve-3d',
          },
        }
        addUtilities(newUtilities)
      }
    ],
  };