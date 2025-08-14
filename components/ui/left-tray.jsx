/**
 * LeftTray Component
 * Reusable slide-out navigation tray that can be used across different views
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { X } from 'lucide-react';

export function LeftTray({
  isOpen,
  onClose,
  onNewCard,
  onResetLayout,
  onRefreshCards,
  title = "The Stack",
}) {
  // ESC key handler to close tray
  useEffect(() => {
    const onKey = (e) => { 
      if (e.key === 'Escape' && isOpen) onClose(); 
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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
          'fixed z-50 inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-800',
          'border-r border-gray-200 dark:border-gray-700',
          'shadow-lg transform transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-label="Main menu"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </div>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable content: Zones list */}
          <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
            <div className="pt-2 text-gray-600 dark:text-gray-300">Zones</div>
            <ul className="space-y-1">
              <li className="text-gray-700 dark:text-gray-200">Active Conversation</li>
              <li className="text-gray-700 dark:text-gray-200">Parking Lot</li>
              <li className="text-gray-700 dark:text-gray-200">Resolved</li>
              <li className="text-gray-700 dark:text-gray-200">Unresolved</li>
            </ul>
          </div>

          {/* Footer: Quick actions and theme toggle */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <div className="text-gray-600 dark:text-gray-300">Quick actions</div>
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