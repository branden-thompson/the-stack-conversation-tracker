/**
 * LeftTray Component
 * Reusable slide-out navigation tray that can be used across different views
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { X, MessageSquare, TestTube, Home, BarChart3 } from 'lucide-react';

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

  // ESC key handler to close tray
  useEffect(() => {
    const onKey = (e) => { 
      if (e.key === 'Escape' && isOpen) onClose(); 
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Dynamic color schemes based on page type
  const colorScheme = isDevPage ? {
    // App pages: Blue/cyan theme for technical feel
    bg: 'bg-stone-50 dark:bg-stone-900',
    border: 'border-stone-200 dark:border-stone-700',
    headerBg: 'bg-stone-100 dark:bg-stone-800',
    headerBorder: 'border-stone-200 dark:border-stone-700',
    headerText: 'text-stone-900 dark:text-stone-100',
    sectionText: 'text-stone-600 dark:text-stone-300',
    divider: 'border-stone-200 dark:border-stone-700',
    footerBorder: 'border-stone-200 dark:border-stone-700'
  } : {
    // Dev pages:  Warm stone theme for conversation focus
    bg: 'bg-slate-50 dark:bg-slate-900',
    border: 'border-slate-200 dark:border-slate-700',
    headerBg: 'bg-slate-100 dark:bg-slate-800',
    headerBorder: 'border-slate-200 dark:border-slate-700',
    headerText: 'text-slate-900 dark:text-slate-100',
    sectionText: 'text-slate-600 dark:text-slate-300',
    divider: 'border-slate-200 dark:border-slate-700',
    footerBorder: 'border-slate-200 dark:border-slate-700'
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
            <Button variant="outline" size="icon" onClick={onClose}>
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
                  className="w-full justify-start" 
                  onClick={() => { router.push('/'); onClose(); }}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Main App
                </Button>
              </div>
            </div>

          </div>

          {/* Footer: Dev Ops Center, Quick actions and theme toggle */}
          <div className={`p-3 border-t ${colorScheme.footerBorder} space-y-3`}>
            <div>
              <div className={colorScheme.sectionText}>Dev Ops Center</div>
              <div className="mt-2 space-y-2">
                <Button 
                  variant={pathname === '/dev/tests' ? 'default' : 'outline'}
                  className="w-full justify-start" 
                  onClick={() => { router.push('/dev/tests'); onClose(); }}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Dashboard
                </Button>
                <Button 
                  variant={pathname === '/dev/coverage' ? 'default' : 'outline'}
                  className="w-full justify-start" 
                  onClick={() => { router.push('/dev/coverage'); onClose(); }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Coverage Report
                </Button>
                <Button 
                  variant={pathname === '/dev/convos' ? 'default' : 'outline'}
                  className="w-full justify-start" 
                  onClick={() => { router.push('/dev/convos'); onClose(); }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Event Tracking
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
                  className="w-full justify-start" 
                  onClick={onNewCard}
                >
                  + New Card
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={onResetLayout}
                >
                  Reset Layout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
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