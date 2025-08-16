/**
 * TUI Wrapper Component
 * 
 * Wraps content with TUI styling when hax-mode is enabled
 * Data-first: Only changes presentation, never modifies data
 */

'use client';

import { useEffect, useState } from 'react';
import { getTUIStyleTag, TUI_COLORS } from '@/lib/styles/tui-theme';

/**
 * TUI Wrapper that conditionally applies terminal UI styling
 * @param {Object} props
 * @param {boolean} props.isHaxMode - Whether TUI mode is enabled
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} props.showEffects - Whether to show CRT/scanline effects
 */
export function TUIWrapper({ isHaxMode, children, showEffects = true }) {
  const [stylesInjected, setStylesInjected] = useState(false);
  
  // Inject TUI styles when in hax mode
  useEffect(() => {
    if (!isHaxMode) {
      // Remove styles when not in hax mode
      const existingStyle = document.getElementById('tui-styles');
      if (existingStyle) {
        existingStyle.remove();
        setStylesInjected(false);
      }
      return;
    }
    
    // Check if styles already exist
    if (document.getElementById('tui-styles')) {
      setStylesInjected(true);
      return;
    }
    
    // Create and inject style element
    const styleElement = document.createElement('style');
    styleElement.id = 'tui-styles';
    styleElement.innerHTML = getTUIStyleTag();
    document.head.appendChild(styleElement);
    setStylesInjected(true);
    
    // Cleanup on unmount
    return () => {
      const style = document.getElementById('tui-styles');
      if (style) {
        style.remove();
      }
    };
  }, [isHaxMode]);
  
  if (!isHaxMode) {
    // Pass through children unchanged when not in hax mode
    return <>{children}</>;
  }
  
  return (
    <div 
      className="tui-container"
      style={{
        minHeight: '100vh',
        background: TUI_COLORS.background,
        color: TUI_COLORS.text,
        fontFamily: "'Roboto Mono', 'Courier New', monospace",
        fontSize: '14px',
        lineHeight: '24px',
        position: 'relative',
        overflow: 'hidden',
        // Create a true grid
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      {/* CRT/Scanline effects */}
      {showEffects && stylesInjected && (
        <>
          <div className="tui-scanline" />
          <div className="tui-crt" />
        </>
      )}
      
      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Higher-order component to wrap a component with TUI mode
 * Preserves all props and data, only changes presentation
 */
export function withTUIMode(Component) {
  return function TUIModeWrapper(props) {
    const { isHaxMode, ...restProps } = props;
    
    if (!isHaxMode) {
      return <Component {...restProps} />;
    }
    
    return (
      <TUIWrapper isHaxMode={isHaxMode}>
        <Component {...restProps} isHaxMode={isHaxMode} />
      </TUIWrapper>
    );
  };
}