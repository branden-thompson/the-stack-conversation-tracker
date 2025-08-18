/**
 * LeftTray Component
 * Reusable slide-out navigation tray that can be used across different views
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { X, MessageSquare, TestTube, Layers, BarChart3, History, Users } from 'lucide-react';
import { THEME } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

export function LeftTray({
  isOpen,
  onClose,
  onNewCard,
  onResetLayout,
  onRefreshCards,
  title = "The Stack",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isDevPage = pathname?.startsWith('/dev');
  const dynamicTheme = useDynamicAppTheme();
  
  // Theme-aware button classes that override ShadCN defaults
  const buttonClasses = {
    // Default/primary buttons for active states
    default: `${dynamicTheme.colors.background.accent} ${dynamicTheme.colors.text.primary} border ${dynamicTheme.colors.border.primary} ${dynamicTheme.colors.background.hover}`,
    // Ghost buttons for inactive navigation
    ghost: `bg-transparent ${dynamicTheme.colors.text.secondary} ${dynamicTheme.colors.background.hover} border-transparent`,
    // Outline buttons for actions
    outline: `bg-transparent ${dynamicTheme.colors.text.secondary} border ${dynamicTheme.colors.border.secondary} ${dynamicTheme.colors.background.hover}`,
    // Icon button for close
    icon: `${dynamicTheme.colors.background.secondary} ${dynamicTheme.colors.text.primary} border ${dynamicTheme.colors.border.secondary} ${dynamicTheme.colors.background.hover}`
  };

  // ESC key handler to close tray
  useEffect(() => {
    const onKey = (e) => { 
      if (e.key === 'Escape' && isOpen) onClose(); 
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Dynamic color scheme using theme-aware colors
  const colorScheme = isDevPage ? {
    // Dev pages: Use static dev theme (keep original behavior for dev pages)
    bg: THEME.colors.background.primary,
    border: THEME.colors.border.primary,
    headerBg: THEME.colors.background.tertiary,
    headerBorder: THEME.colors.border.primary,
    headerText: THEME.colors.text.primary,
    sectionText: THEME.colors.text.secondary,
    divider: THEME.colors.border.primary,
    footerBorder: THEME.colors.border.primary
  } : {
    // App pages: Use dynamic theme for consistent theming
    bg: dynamicTheme.colors.background.secondary,
    border: dynamicTheme.colors.border.primary,
    headerBg: dynamicTheme.colors.background.tertiary,
    headerBorder: dynamicTheme.colors.border.primary,
    headerText: dynamicTheme.colors.text.primary,
    sectionText: dynamicTheme.colors.text.secondary,
    divider: dynamicTheme.colors.border.secondary,
    footerBorder: dynamicTheme.colors.border.primary
  };

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* TRAY */}
      <aside
        className={[
          'fixed z-50 inset-y-0 left-0 w-[280px]',
          colorScheme.bg,
          `border-r ${colorScheme.border}`,
          'shadow-lg transform transition-all duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-label="Main menu"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={`px-4 py-3 ${colorScheme.headerBg} border-b ${colorScheme.headerBorder} flex items-center justify-between`}>
            <div className={`text-xl font-semibold ${colorScheme.headerText}`}>
              {title}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onClose}
              className={buttonClasses.icon}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto p-3 space-y-4 text-sm">
            {/* Navigation */}
            <div>
              <div className={`pt-2 ${colorScheme.sectionText}`}>Navigation</div>
              <div className="mt-2 space-y-1">
                <Button 
                  variant={pathname === '/' ? 'default' : 'ghost'}
                  className={`w-full justify-start ${pathname === '/' ? buttonClasses.default : buttonClasses.ghost}`}
                  onClick={() => { router.push('/'); onClose(); }}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  The Conversation Stack
                </Button>
                <Button 
                  variant={pathname?.startsWith('/timeline') ? 'default' : 'ghost'}
                  className={`w-full justify-start ${pathname?.startsWith('/timeline') ? buttonClasses.default : buttonClasses.ghost}`}
                  onClick={() => { router.push('/timeline/none'); onClose(); }}
                >
                  <History className="w-4 h-4 mr-2" />
                  Timeline Explorer
                </Button>
              </div>
            </div>

          </div>

          {/* Footer: Dev Ops Center, Quick actions and theme toggle */}
          <div className={`p-3 border-t ${colorScheme.footerBorder} space-y-4`}>
            <div>
              <div className={colorScheme.sectionText}>Dev Ops Center</div>
              <div className="mt-2 space-y-2">
                <Button 
                  variant={pathname === '/dev/tests' ? 'default' : 'outline'}
                  className={`w-full justify-start ${pathname === '/dev/tests' ? buttonClasses.default : buttonClasses.outline}`}
                  onClick={() => { router.push('/dev/tests'); onClose(); }}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test & Coverage
                </Button>
                <Button 
                  variant={pathname === '/dev/convos' ? 'default' : 'outline'}
                  className={`w-full justify-start ${pathname === '/dev/convos' ? buttonClasses.default : buttonClasses.outline}`}
                  onClick={() => { router.push('/dev/convos'); onClose(); }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Card Tracking
                </Button>
                <Button 
                  variant={pathname === '/dev/user-tracking' ? 'default' : 'outline'}
                  className={`w-full justify-start ${pathname === '/dev/user-tracking' ? buttonClasses.default : buttonClasses.outline}`}
                  onClick={() => { router.push('/dev/user-tracking'); onClose(); }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  User Tracking
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className={`border-t ${colorScheme.divider}`}></div>

            <div>
              <div className={colorScheme.sectionText}>Quick actions</div>
              <div className="mt-2 space-y-2">
                <Button 
                  variant="outline" 
                  className={`w-full justify-start ${buttonClasses.outline}`}
                  onClick={onNewCard}
                >
                  + New Card
                </Button>
                <Button 
                  variant="outline" 
                  className={`w-full justify-start ${buttonClasses.outline}`}
                  onClick={onResetLayout}
                >
                  Reset Layout
                </Button>
                <Button 
                  variant="outline" 
                  className={`w-full justify-start ${buttonClasses.outline}`}
                  onClick={onRefreshCards}
                >
                  Refresh Cards
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}