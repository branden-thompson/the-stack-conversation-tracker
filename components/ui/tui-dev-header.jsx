/**
 * TUI DevHeader Component
 * Terminal UI version of the developer header for hax-mode
 */

'use client';

import { TUIButtonProper } from '@/components/ui/tui-components-enhanced';
import { TUI_COLORS, BOX_CHARS } from '@/lib/styles/tui-theme';

export function TUIDevHeader({
  // Tray control
  onOpenTray,
  
  // Page-specific actions
  rightControls,
  
  // Hax mode controls
  isHaxMode = false,
  onToggleHaxMode,
  
  // Customization
  title = "Developer Operations Center",
  subtitle = "See the inside of The Stack",
}) {
  const chars = BOX_CHARS.double;
  
  return (
    <header style={{
      background: TUI_COLORS.surface,
      borderBottom: `2px solid ${TUI_COLORS.border}`,
      padding: '0.75em 1em',
      position: 'relative',
      fontFamily: 'Roboto Mono, monospace',
      boxShadow: `0 2px 10px ${TUI_COLORS.primaryGlow}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: Menu + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
          {onOpenTray && (
            <TUIButtonProper
              onClick={onOpenTray}
              variant="default"
              style={{ padding: '0.25em 0.5em' }}
            >
              ☰
            </TUIButtonProper>
          )}
          <div>
            <h1 style={{
              fontSize: '1.2em',
              fontWeight: 'bold',
              color: TUI_COLORS.accent,
              textShadow: `0 0 10px ${TUI_COLORS.accentGlow}`,
              margin: 0,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontSize: '0.7em',
                color: TUI_COLORS.textMuted,
                margin: 0,
                marginTop: '0.25em',
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
          {/* Page-specific controls */}
          {rightControls && (
            <>
              {rightControls}
              <span style={{
                width: '1px',
                height: '2em',
                background: TUI_COLORS.border,
                margin: '0 0.5em',
              }} />
            </>
          )}
          
          {/* Hax mode toggle */}
          {onToggleHaxMode && (
            <TUIButtonProper
              onClick={onToggleHaxMode}
              variant={isHaxMode ? "primary" : "default"}
              style={{
                padding: '0.25em 0.75em',
                animation: isHaxMode ? 'tui-glow 2s ease-in-out infinite' : 'none',
              }}
            >
              {isHaxMode ? '◉' : '○'} #hax-mode
            </TUIButtonProper>
          )}
          
          {/* Theme toggle (simplified for TUI) */}
          <TUIButtonProper
            onClick={() => {
              // Toggle theme
              const isDark = document.documentElement.classList.contains('dark');
              document.documentElement.classList.toggle('dark', !isDark);
            }}
            variant="default"
            style={{ padding: '0.25em 0.5em' }}
          >
            ☼
          </TUIButtonProper>
        </div>
      </div>
      
      {/* Decorative bottom border */}
      <div style={{
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: '1px',
        background: `linear-gradient(90deg, 
          transparent, 
          ${TUI_COLORS.primary} 20%, 
          ${TUI_COLORS.secondary} 50%, 
          ${TUI_COLORS.primary} 80%, 
          transparent)`,
        opacity: 0.5,
      }} />
    </header>
  );
}