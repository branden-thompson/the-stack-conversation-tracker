/**
 * ClearBoardDialog Component
 * Confirmation dialog for clearing all cards from the board
 * 
 * Features:
 * - Destructive action confirmation
 * - Clear warning message
 * - Cancel/Confirm options
 * - Accessible keyboard navigation
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

export function ClearBoardDialog({ 
  onClearBoard,
  trigger,
  className = "",
  size = "sm",
  disabled = false
}) {
  const [isClearing, setIsClearing] = useState(false);
  const dynamicTheme = useDynamicAppTheme();

  const handleClearBoard = async () => {
    if (!onClearBoard || isClearing) return;
    
    setIsClearing(true);
    try {
      await onClearBoard();
    } catch (error) {
      console.error('Failed to clear board:', error);
      // Error handling could be enhanced with toast notifications
    } finally {
      setIsClearing(false);
    }
  };

  const TriggerButton = trigger || (
    <Button
      variant="outline"
      size={size}
      disabled={disabled}
      className={`${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      title="Clear the board"
      aria-label="Clear all cards from the board"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild disabled={disabled}>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clear the Board</DialogTitle>
        </DialogHeader>
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg bg-red-100 dark:bg-red-900/20`}>
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-medium ${dynamicTheme.colors.text.primary} mb-2`}>
              Clear All Cards?
            </h3>
            <p className={`text-sm ${dynamicTheme.colors.text.secondary} leading-relaxed`}>
              This will permanently remove all cards from the board. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Additional Warning */}
        <div className={`p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`}>
          <p className={`text-xs ${dynamicTheme.colors.text.muted}`}>
            <strong>Note:</strong> This will clear all cards regardless of their current state (active, resolved, or archived).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isClearing}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleClearBoard}
            disabled={isClearing}
            className={`bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 ${isClearing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isClearing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Board
              </>
            )}
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}