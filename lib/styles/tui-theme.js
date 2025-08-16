/**
 * TUI Theme Configuration
 * Synthwave84-inspired terminal UI theme with box-drawing characters
 * 
 * This provides styling without modifying core data or functionality
 */

// Synthwave84 Color Palette - VSCode Edition
export const TUI_COLORS = {
  // Core colors - VSCode Synthwave84 exact colors
  background: '#262335',      // VSCode Synthwave84 editor background
  backgroundAlt: '#1e1a29',   // Darker variant for depth
  surface: '#2a2139',         // Panel background from VSCode theme
  
  // Primary colors
  primary: '#ff007c',         // Hot pink
  primaryGlow: '#ff007c33',   // Hot pink glow
  
  // Secondary colors  
  secondary: '#00ffff',       // Cyan
  secondaryGlow: '#00ffff33', // Cyan glow
  
  // Accent colors
  accent: '#ffff00',          // Yellow
  accentGlow: '#ffff0033',    // Yellow glow
  
  // Text colors
  text: '#f0f0f0',           // Near white
  textMuted: '#b8b8b8',      // Muted gray
  textDim: '#8b42a8',        // Purple
  
  // UI colors
  border: '#ff00ff',         // Magenta
  borderDim: '#8b42a8',      // Purple border
  success: '#00ff88',        // Green
  warning: '#ffaa00',        // Orange
  error: '#ff0055',          // Red
  info: '#00aaff',           // Light blue
  
  // Special effects
  scanline: '#ff00ff11',     // Very faint magenta
  glow: '#ff007c66',         // Medium pink glow
};

// Box-drawing characters
export const BOX_CHARS = {
  // Single-line box drawing
  single: {
    horizontal: '─',
    vertical: '│',
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    cross: '┼',
    teeUp: '┴',
    teeDown: '┬',
    teeLeft: '┤',
    teeRight: '├',
  },
  
  // Double-line box drawing
  double: {
    horizontal: '═',
    vertical: '║',
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    cross: '╬',
    teeUp: '╩',
    teeDown: '╦',
    teeLeft: '╣',
    teeRight: '╠',
  },
  
  // Mixed single/double
  mixed: {
    verticalSingleHorizontalDouble: '╫',
    verticalDoubleHorizontalSingle: '╪',
    // Corner variations
    singleToDouble: '╟',
    doubleToSingle: '├',
  },
  
  // Special characters
  special: {
    block: '█',
    blockLight: '░',
    blockMedium: '▒',
    blockDark: '▓',
    triangleRight: '▶',
    triangleLeft: '◀',
    triangleUp: '▲',
    triangleDown: '▼',
    dot: '•',
    star: '★',
    check: '✓',
    cross: '✗',
    arrow: '→',
    doubleArrow: '⇒',
  }
};

// Character dimensions for grid layout (based on Roboto Mono)
export const CHAR_DIMENSIONS = {
  width: 9.6,    // Approximate width of one character in pixels at 16px font
  height: 24,    // Line height for good readability
  fontSize: 14,  // Base font size
};

// Standard terminal widths in characters
export const TERMINAL_WIDTHS = {
  narrow: 40,
  standard: 80,
  wide: 120,
  ultrawide: 160,
};

// TUI component styles (CSS classes)
export const TUI_STYLES = {
  // Base container with Roboto Mono
  container: `
    font-family: 'Roboto Mono', 'Courier New', 'Monaco', monospace !important;
    background: ${TUI_COLORS.background};
    color: ${TUI_COLORS.text};
    font-size: ${CHAR_DIMENSIONS.fontSize}px;
    line-height: ${CHAR_DIMENSIONS.height}px;
    letter-spacing: 0;
  `,
  
  // Button styles - [Button Name] format
  button: {
    base: `
      font-family: inherit;
      background: transparent;
      color: ${TUI_COLORS.primary};
      border: none;
      padding: 0 1ch;
      cursor: pointer;
      transition: all 0.2s;
      text-shadow: 0 0 10px currentColor;
    `,
    hover: `
      color: ${TUI_COLORS.secondary};
      text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
    `,
    active: `
      color: ${TUI_COLORS.accent};
    `,
    disabled: `
      color: ${TUI_COLORS.textDim};
      cursor: not-allowed;
      text-shadow: none;
    `
  },
  
  // Box/Panel styles
  box: {
    base: `
      border: 1px solid ${TUI_COLORS.border};
      background: ${TUI_COLORS.surface};
      padding: 1em;
      position: relative;
    `,
    glow: `
      box-shadow: 
        0 0 20px ${TUI_COLORS.primaryGlow},
        inset 0 0 20px ${TUI_COLORS.backgroundAlt};
    `
  },
  
  // Text effects
  text: {
    glow: `text-shadow: 0 0 10px currentColor;`,
    pulse: `animation: tui-pulse 2s ease-in-out infinite;`,
    typing: `animation: tui-typing 0.5s steps(20, end);`,
  }
};

// Helper functions for building TUI components

/**
 * Create a box with title
 * @param {string} title - Box title
 * @param {number} width - Width in characters
 * @param {number} height - Height in lines
 * @param {'single'|'double'} style - Box style
 */
export function createBox(title, width, height, style = 'single') {
  const chars = BOX_CHARS[style];
  const titleStr = title ? ` ${title} ` : '';
  const titlePadding = Math.floor((width - titleStr.length - 2) / 2);
  
  const lines = [];
  
  // Top line with title
  lines.push(
    chars.topLeft + 
    chars.horizontal.repeat(titlePadding) +
    titleStr +
    chars.horizontal.repeat(width - titlePadding - titleStr.length - 2) +
    chars.topRight
  );
  
  // Middle lines
  for (let i = 0; i < height - 2; i++) {
    lines.push(chars.vertical + ' '.repeat(width - 2) + chars.vertical);
  }
  
  // Bottom line
  lines.push(
    chars.bottomLeft +
    chars.horizontal.repeat(width - 2) +
    chars.bottomRight
  );
  
  return lines;
}

/**
 * Format text as a TUI button
 * @param {string} text - Button text
 * @param {boolean} active - Whether button is active
 */
export function formatButton(text, active = false) {
  const brackets = active ? '⟨' + text + '⟩' : '[' + text + ']';
  return brackets;
}

/**
 * Create a progress bar
 * @param {number} value - Current value (0-100)
 * @param {number} width - Width in characters
 */
export function createProgressBar(value, width = 20) {
  const filled = Math.floor((value / 100) * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

/**
 * Create a tree structure
 * @param {Array} items - Array of items with level property
 */
export function createTree(items) {
  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    const prefix = item.level > 0 
      ? '  '.repeat(item.level - 1) + (isLast ? '└─ ' : '├─ ')
      : '';
    return prefix + item.label;
  }).join('\n');
}

// CSS animations for TUI effects
export const TUI_ANIMATIONS = `
  @keyframes tui-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes tui-typing {
    from { width: 0; }
    to { width: 100%; }
  }
  
  @keyframes tui-scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  
  @keyframes tui-glow {
    0%, 100% { 
      text-shadow: 
        0 0 10px currentColor,
        0 0 20px currentColor;
    }
    50% { 
      text-shadow: 
        0 0 20px currentColor,
        0 0 40px currentColor,
        0 0 60px currentColor;
    }
  }
  
  .tui-scanline::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      transparent,
      ${TUI_COLORS.scanline} 50%,
      transparent
    );
    animation: tui-scanline 8s linear infinite;
    pointer-events: none;
    z-index: 9999;
  }
  
  .tui-crt::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      ${TUI_COLORS.scanline} 2px,
      ${TUI_COLORS.scanline} 4px
    );
    pointer-events: none;
    z-index: 9998;
  }
`;

// Export a ready-to-use style tag content
export function getTUIStyleTag() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
    
    ${TUI_ANIMATIONS}
    
    .tui-mode {
      ${TUI_STYLES.container}
    }
    
    .tui-mode * {
      font-family: 'Roboto Mono', monospace !important;
    }
    
    /* Custom TUI scrollbars for entire page */
    .tui-mode ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
      background: ${TUI_COLORS.background};
    }
    
    .tui-mode ::-webkit-scrollbar-track {
      background: ${TUI_COLORS.surface};
      border: 1px solid ${TUI_COLORS.border};
    }
    
    .tui-mode ::-webkit-scrollbar-thumb {
      background: ${TUI_COLORS.primary};
      border: 1px solid ${TUI_COLORS.border};
      box-shadow: 0 0 5px ${TUI_COLORS.primaryGlow};
    }
    
    .tui-mode ::-webkit-scrollbar-thumb:hover {
      background: ${TUI_COLORS.secondary};
      box-shadow: 0 0 10px ${TUI_COLORS.secondaryGlow};
    }
    
    .tui-mode ::-webkit-scrollbar-corner {
      background: ${TUI_COLORS.surface};
      border: 1px solid ${TUI_COLORS.border};
    }
    
    /* Terminal-style text selection */
    .tui-mode ::selection {
      background: ${TUI_COLORS.secondary};
      color: ${TUI_COLORS.background};
    }
    
    .tui-mode ::-moz-selection {
      background: ${TUI_COLORS.secondary};
      color: ${TUI_COLORS.background};
    }
    
    /* Force monospace grid alignment */
    .tui-mode input,
    .tui-mode textarea,
    .tui-mode select,
    .tui-mode button {
      font-family: 'Roboto Mono', monospace !important;
      font-size: ${CHAR_DIMENSIONS.fontSize}px !important;
      line-height: ${CHAR_DIMENSIONS.height}px !important;
    }
    
    .tui-button {
      ${TUI_STYLES.button.base}
    }
    
    .tui-button:hover {
      ${TUI_STYLES.button.hover}
    }
    
    .tui-button:active {
      ${TUI_STYLES.button.active}
    }
    
    .tui-button:disabled {
      ${TUI_STYLES.button.disabled}
    }
    
    .tui-box {
      ${TUI_STYLES.box.base}
    }
    
    .tui-box-glow {
      ${TUI_STYLES.box.glow}
    }
    
    .tui-text-glow {
      ${TUI_STYLES.text.glow}
    }
  `;
}