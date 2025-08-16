/**
 * TUI Component Library
 * 
 * Reusable terminal UI components following Bubble Tea conventions
 * Data-first: Components only change presentation, never modify data
 */

'use client';

import { BOX_CHARS, TUI_COLORS } from '@/lib/styles/tui-theme';

/**
 * TUI Button component - [Button Name] style
 */
export function TUIButton({ 
  children, 
  onClick, 
  disabled = false, 
  active = false,
  variant = 'default',
  className = ''
}) {
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { color: TUI_COLORS.primary };
      case 'secondary':
        return { color: TUI_COLORS.secondary };
      case 'success':
        return { color: TUI_COLORS.success };
      case 'error':
        return { color: TUI_COLORS.error };
      case 'warning':
        return { color: TUI_COLORS.warning };
      default:
        return { color: TUI_COLORS.text };
    }
  };
  
  const brackets = active ? '⟨ ' : '[ ';
  const closeBrackets = active ? ' ⟩' : ' ]';
  
  return (
    <span
      className={`tui-button ${className}`}
      onClick={handleClick}
      style={{
        ...getVariantStyle(),
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textShadow: disabled ? 'none' : `0 0 10px currentColor`,
        fontFamily: 'inherit',
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
    >
      {brackets}{children}{closeBrackets}
    </span>
  );
}

/**
 * TUI Box component with box-drawing characters
 */
export function TUIBox({ 
  title = '', 
  children, 
  variant = 'single',
  glow = false,
  className = '',
  style = {},
  width = 'auto',
  height = 'auto',
  padding = '1em'
}) {
  const chars = BOX_CHARS[variant] || BOX_CHARS.single;
  
  const renderTitle = () => {
    if (!title) return null;
    return (
      <div 
        style={{
          position: 'absolute',
          top: '-0.5em',
          left: '1em',
          background: TUI_COLORS.surface,
          padding: '0 0.5em',
          color: TUI_COLORS.accent,
          textShadow: `0 0 10px ${TUI_COLORS.accentGlow}`,
        }}
      >
        {title}
      </div>
    );
  };
  
  return (
    <div 
      className={`tui-box ${glow ? 'tui-box-glow' : ''} ${className}`}
      style={{
        border: `1px solid ${TUI_COLORS.border}`,
        background: TUI_COLORS.surface,
        padding,
        position: 'relative',
        width,
        height,
        boxShadow: glow ? `0 0 20px ${TUI_COLORS.primaryGlow}` : 'none',
        ...style
      }}
    >
      {renderTitle()}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
      
      {/* Corner decorations */}
      <span style={{ position: 'absolute', top: -1, left: -1, color: TUI_COLORS.border }}>
        {chars.topLeft}
      </span>
      <span style={{ position: 'absolute', top: -1, right: -1, color: TUI_COLORS.border }}>
        {chars.topRight}
      </span>
      <span style={{ position: 'absolute', bottom: -1, left: -1, color: TUI_COLORS.border }}>
        {chars.bottomLeft}
      </span>
      <span style={{ position: 'absolute', bottom: -1, right: -1, color: TUI_COLORS.border }}>
        {chars.bottomRight}
      </span>
    </div>
  );
}

/**
 * TUI Select/Dropdown component
 */
export function TUISelect({ 
  options = [], 
  value, 
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const chars = BOX_CHARS.single;
  
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className={`tui-select ${className}`} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '0.5em 1em',
          border: `1px solid ${TUI_COLORS.border}`,
          background: TUI_COLORS.surface,
          color: selectedOption ? TUI_COLORS.text : TUI_COLORS.textMuted,
          minWidth: '150px',
          position: 'relative',
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span style={{ position: 'absolute', right: '0.5em' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: TUI_COLORS.surface,
            border: `1px solid ${TUI_COLORS.border}`,
            borderTop: 'none',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: '0.5em 1em',
                cursor: 'pointer',
                color: TUI_COLORS.text,
                background: value === option.value ? TUI_COLORS.primaryGlow : 'transparent',
                borderTop: index > 0 ? `1px solid ${TUI_COLORS.borderDim}` : 'none',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = TUI_COLORS.secondaryGlow;
                e.target.style.color = TUI_COLORS.secondary;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = value === option.value ? TUI_COLORS.primaryGlow : 'transparent';
                e.target.style.color = TUI_COLORS.text;
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * TUI Table component
 */
export function TUITable({ 
  headers = [], 
  rows = [], 
  className = '',
  showBorders = true 
}) {
  const chars = BOX_CHARS.single;
  
  return (
    <div className={`tui-table ${className}`} style={{ fontFamily: 'inherit' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                style={{
                  textAlign: 'left',
                  padding: '0.5em',
                  borderBottom: showBorders ? `1px solid ${TUI_COLORS.border}` : 'none',
                  color: TUI_COLORS.accent,
                  textShadow: `0 0 5px ${TUI_COLORS.accentGlow}`,
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: '0.5em',
                    borderBottom: showBorders && rowIndex < rows.length - 1 
                      ? `1px solid ${TUI_COLORS.borderDim}` 
                      : 'none',
                    color: TUI_COLORS.text,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * TUI Progress Bar component
 */
export function TUIProgressBar({ 
  value = 0, 
  max = 100, 
  width = 20,
  showPercentage = true,
  className = '' 
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filled = Math.floor((percentage / 100) * width);
  const empty = width - filled;
  
  return (
    <div className={`tui-progress ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '1em' }}>
      <span style={{ color: TUI_COLORS.text }}>
        [{BOX_CHARS.special.block.repeat(filled)}{BOX_CHARS.special.blockLight.repeat(empty)}]
      </span>
      {showPercentage && (
        <span style={{ color: TUI_COLORS.accent, minWidth: '3em' }}>
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

// Add React import for hooks
import * as React from 'react';