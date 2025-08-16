/**
 * Enhanced TUI Component Library
 * 
 * Authentic terminal UI components with proper box drawing and grid layout
 */

'use client';

import * as React from 'react';
import { BOX_CHARS, TUI_COLORS, CHAR_DIMENSIONS, TERMINAL_WIDTHS } from '@/lib/styles/tui-theme';

/**
 * Calculate width in pixels based on character count
 */
function charsToPixels(chars) {
  return chars * CHAR_DIMENSIONS.width;
}

/**
 * TUI Button with proper box drawing
 * Real terminal-style button with box characters
 */
export function TUIButtonProper({ 
  children, 
  onClick, 
  disabled = false, 
  active = false,
  variant = 'default',
  width = 'auto', // Can be number of chars or 'auto'
  className = ''
}) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };
  
  const getColor = () => {
    if (disabled) return TUI_COLORS.textDim;
    if (pressed) return TUI_COLORS.accent;
    if (active || hover) return TUI_COLORS.secondary;
    
    switch (variant) {
      case 'primary': return TUI_COLORS.primary;
      case 'success': return TUI_COLORS.success;
      case 'error': return TUI_COLORS.error;
      case 'warning': return TUI_COLORS.warning;
      default: return TUI_COLORS.text;
    }
  };
  
  const chars = active || pressed ? BOX_CHARS.double : BOX_CHARS.single;
  const textContent = String(children);
  const buttonWidth = width === 'auto' ? textContent.length + 4 : width;
  const padding = Math.max(0, Math.floor((buttonWidth - textContent.length - 2) / 2));
  const rightPadding = buttonWidth - textContent.length - padding - 2;
  
  // Build the button as ASCII art
  const topLine = chars.topLeft + chars.horizontal.repeat(buttonWidth - 2) + chars.topRight;
  const middleLine = chars.vertical + ' '.repeat(padding) + textContent + ' '.repeat(rightPadding) + chars.vertical;
  const bottomLine = chars.bottomLeft + chars.horizontal.repeat(buttonWidth - 2) + chars.bottomRight;
  
  return (
    <div
      className={`tui-button-proper ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-block',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: getColor(),
        opacity: disabled ? 0.5 : 1,
        textShadow: (hover || active) && !disabled ? `0 0 10px currentColor` : 'none',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 1,
        userSelect: 'none',
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
    >
      <div>{topLine}</div>
      <div>{middleLine}</div>
      <div>{bottomLine}</div>
    </div>
  );
}

/**
 * TUI Scrollbar - Terminal-style scrollbar
 */
export function TUIScrollbar({ 
  orientation = 'vertical',
  totalItems = 100,
  visibleItems = 10,
  currentPosition = 0,
  height = 20, // In characters for vertical
  width = 40,  // In characters for horizontal
}) {
  const chars = BOX_CHARS.single;
  const special = BOX_CHARS.special;
  
  if (orientation === 'vertical') {
    const scrollRatio = visibleItems / totalItems;
    const thumbSize = Math.max(1, Math.floor(height * scrollRatio));
    const scrollPosition = Math.floor((currentPosition / (totalItems - visibleItems)) * (height - thumbSize));
    
    const lines = [];
    lines.push(special.triangleUp); // Up arrow
    
    for (let i = 0; i < height; i++) {
      if (i >= scrollPosition && i < scrollPosition + thumbSize) {
        lines.push(special.block); // Thumb
      } else {
        lines.push(special.blockLight); // Track
      }
    }
    
    lines.push(special.triangleDown); // Down arrow
    
    return (
      <div 
        style={{ 
          color: TUI_COLORS.border,
          lineHeight: 1,
          fontFamily: 'inherit',
        }}
      >
        {lines.map((char, i) => (
          <div key={i}>{char}</div>
        ))}
      </div>
    );
  }
  
  // Horizontal scrollbar
  const scrollRatio = visibleItems / totalItems;
  const thumbSize = Math.max(1, Math.floor(width * scrollRatio));
  const scrollPosition = Math.floor((currentPosition / (totalItems - visibleItems)) * (width - thumbSize));
  
  let bar = special.triangleLeft; // Left arrow
  for (let i = 0; i < width; i++) {
    if (i >= scrollPosition && i < scrollPosition + thumbSize) {
      bar += special.block; // Thumb
    } else {
      bar += special.blockLight; // Track
    }
  }
  bar += special.triangleRight; // Right arrow
  
  return (
    <div style={{ 
      color: TUI_COLORS.border,
      fontFamily: 'inherit',
    }}>
      {bar}
    </div>
  );
}

/**
 * TUI Panel - Container with proper box drawing and optional scrollbars
 */
export function TUIPanel({ 
  title = '',
  children,
  style = {},
  scrollable = false,
  variant = 'single',
  glow = false,
  className = '',
}) {
  const chars = BOX_CHARS[variant] || BOX_CHARS.single;
  
  return (
    <div 
      className={`tui-panel ${className}`}
      style={{
        background: TUI_COLORS.surface,
        border: `1px solid ${TUI_COLORS.border}`,
        position: 'relative',
        fontFamily: 'inherit',
        boxShadow: glow ? `0 0 20px ${TUI_COLORS.primaryGlow}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Title bar */}
      {title && (
        <div style={{
          padding: '0.25em 0.75em',
          borderBottom: `1px solid ${TUI_COLORS.border}`,
          color: TUI_COLORS.accent,
          textShadow: `0 0 10px ${TUI_COLORS.accentGlow}`,
          fontWeight: 'bold',
          fontSize: '0.9em',
        }}>
          {chars.horizontal} {title} {chars.horizontal}
        </div>
      )}
      
      {/* Content area */}
      {children}
    </div>
  );
}

/**
 * TUI Grid Layout - Enforces character-based grid
 */
export function TUIGrid({ 
  cols = 80,
  rows = 24,
  children,
  gap = 1, // Gap in characters
  className = ''
}) {
  return (
    <div 
      className={`tui-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${CHAR_DIMENSIONS.width}px)`,
        gridTemplateRows: `repeat(${rows}, ${CHAR_DIMENSIONS.height}px)`,
        gap: charsToPixels(gap),
        fontFamily: 'inherit',
        background: TUI_COLORS.background,
      }}
    >
      {children}
    </div>
  );
}

/**
 * TUI Input Field with box drawing
 */
export function TUIInput({
  value = '',
  onChange,
  placeholder = '',
  width = 40, // In characters
  disabled = false,
  type = 'text',
  className = ''
}) {
  const [focused, setFocused] = React.useState(false);
  const chars = focused ? BOX_CHARS.double : BOX_CHARS.single;
  
  return (
    <div 
      className={`tui-input ${className}`}
      style={{
        display: 'inline-block',
        position: 'relative',
        width: charsToPixels(width),
      }}
    >
      {/* Top border */}
      <div style={{ 
        position: 'absolute',
        top: -1,
        left: -1,
        right: -1,
        color: focused ? TUI_COLORS.secondary : TUI_COLORS.border,
        whiteSpace: 'pre',
        pointerEvents: 'none',
      }}>
        {chars.topLeft}{chars.horizontal.repeat(width - 2)}{chars.topRight}
      </div>
      
      {/* Input field */}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: TUI_COLORS.surface,
          color: TUI_COLORS.text,
          border: `1px solid ${focused ? TUI_COLORS.secondary : TUI_COLORS.border}`,
          padding: '0.25em 0.5em',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          outline: 'none',
          boxShadow: focused ? `0 0 10px ${TUI_COLORS.secondaryGlow}` : 'none',
        }}
      />
      
      {/* Bottom border */}
      <div style={{
        position: 'absolute',
        bottom: -1,
        left: -1,
        right: -1,
        color: focused ? TUI_COLORS.secondary : TUI_COLORS.border,
        whiteSpace: 'pre',
        pointerEvents: 'none',
      }}>
        {chars.bottomLeft}{chars.horizontal.repeat(width - 2)}{chars.bottomRight}
      </div>
    </div>
  );
}

// Add custom scrollbar CSS
if (typeof document !== 'undefined') {
  const styleId = 'tui-scrollbar-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      /* Hide native scrollbars in TUI panels */
      .tui-panel-content::-webkit-scrollbar {
        display: none;
      }
      
      /* Roboto Mono font import */
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
      
      /* Ensure monospace alignment */
      .tui-mode * {
        font-family: 'Roboto Mono', monospace !important;
      }
    `;
    document.head.appendChild(style);
  }
}