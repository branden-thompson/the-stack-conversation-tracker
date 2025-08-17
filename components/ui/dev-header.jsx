/**
 * DevHeader Component
 * Reusable developer header for all dev pages under app/dev/
 * 
 * Features:
 * - Hamburger menu button (activates same left tray as app-header)
 * - "The Stack | D.O.C" title with "Developer Operations Center" subtitle
 * - Theme toggle on the right
 * - Extensible right controls for page-specific actions
 * - Consistent with app-header styling but dev-focused
 */

'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu } from 'lucide-react';
import { THEME, getThemeClasses } from '@/lib/utils/ui-constants';

const TOOLBAR_H = 40;
const DIVIDER_MX = 'mx-6';
const HEADER_SIDE_GAP = 'gap-3';

export function DevHeader({
  // Tray control
  onOpenTray,
  
  // Page-specific actions (rendered in right controls area)
  rightControls,
  
  // Customization
  title = "Developer Operations Center",
  subtitle = "See the inside of The Stack",
  
  // Additional styling
  className = "",
}) {
  return (
    <header className={`${THEME.colors.background.primary} border-b ${THEME.colors.border.primary} px-6 py-3 ${THEME.shadows.sm} ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left: Hamburger + Title */}
        <div className={`flex items-center ${HEADER_SIDE_GAP}`}>
          {onOpenTray && (
            <Button
              variant="outline"
              size="icon"
              className={`h-[${TOOLBAR_H}px] w-[${TOOLBAR_H}px]`}
              title="Open menu"
              onClick={onOpenTray}
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className={`text-2xl font-bold ${THEME.colors.text.primary}`}>{title}</h1>
            {subtitle && (
              <p className={`text-xs ${THEME.colors.text.muted}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right groups */}
        <div className="flex items-center">
          {/* Theme */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>

          {/* Page-specific controls */}
          {rightControls && (
            <>
              {/* Divider */}
              <span className={`h-6 w-px ${THEME.colors.border.primary} ${DIVIDER_MX}`} />
              
              {/* Custom controls */}
              <div className="flex items-center gap-2">
                {rightControls}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}