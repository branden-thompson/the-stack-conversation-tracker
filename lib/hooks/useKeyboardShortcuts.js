/**
 * Custom hook for keyboard shortcuts
 * Lowercase shortcuts; remap: ctrl+o → OPINION; add: ctrl+f → FACT.
 */

import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts({
  onNewTopic,      // ctrl+n
  onNewQuestion,   // ctrl+q
  onNewAccusation, // ctrl+a
  onNewFact,       // ctrl+f  <-- CHANGED
  onNewOpinion,    // ctrl+o  <-- NEW mapping
  onNewGuess,      // ctrl+g
  onDeleteSelected,
  onResetLayout,
  onDeselect,
  selectedCard,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.isComposing) return;

      const ctrl = e.ctrlKey || e.metaKey; // support Cmd on macOS too

      // New cards
      if (ctrl && e.key === 'n') { e.preventDefault(); onNewTopic?.(); return; }
      if (ctrl && e.key === 'q') { e.preventDefault(); onNewQuestion?.(); return; }
      if (ctrl && e.key === 'a') { e.preventDefault(); onNewAccusation?.(); return; }
      if (ctrl && e.key === 'f') { e.preventDefault(); onNewFact?.(); return; }     // FACT
      if (ctrl && e.key === 'o') { e.preventDefault(); onNewOpinion?.(); return; }  // OPINION
      if (ctrl && e.key === 'g') { e.preventDefault(); onNewGuess?.(); return; }    // GUESS

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCard) {
        e.preventDefault();
        onDeleteSelected?.();
        return;
      }

      // Reset layout
      if (!ctrl && e.key === 'r') {
        e.preventDefault();
        onResetLayout?.();
        return;
      }

      // Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        onDeselect?.();
      }
    },
    [
      onNewTopic,
      onNewQuestion,
      onNewAccusation,
      onNewFact,
      onNewOpinion,
      onNewGuess,
      onDeleteSelected,
      onResetLayout,
      onDeselect,
      selectedCard,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: [
      { keys: ['ctrl', 'n'], description: 'New topic card' },
      { keys: ['ctrl', 'q'], description: 'New question card' },
      { keys: ['ctrl', 'a'], description: 'New accusation card' },
      { keys: ['ctrl', 'f'], description: 'New fact card' },      // updated
      { keys: ['ctrl', 'o'], description: 'New opinion card' },   // new mapping
      { keys: ['ctrl', 'g'], description: 'New guess card' },
      { keys: ['Delete'], description: 'Delete selected' },
      { keys: ['r'], description: 'Reset layout' },
      { keys: ['esc'], description: 'Deselect' },
    ],
  };
}