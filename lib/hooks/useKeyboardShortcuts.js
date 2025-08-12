/**
 * Custom hook for keyboard shortcuts
 * - Restores reliable global shortcuts (Mac ⌘ and Win/Linux Ctrl)
 * - Ignores when typing in inputs/textarea/contentEditable
 * - Per-type creation:
 *   ctrl+n → New Conversation Topic
 *   ctrl+q → New Open Question
 *   ctrl+a → New Accusation
 *   ctrl+o → New Factual Statement
 * - Other shortcuts unchanged:
 *   delete/backspace → delete selected
 *   ctrl+z / ctrl+shift+z or ctrl+y → undo/redo
 *   g → toggle grid
 *   r → reset layout
 */

import { useEffect, useCallback } from 'react';

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  if (!tag) return false;

  const editable =
    target.isContentEditable ||
    target.getAttribute?.('contenteditable') === 'true';

  return (
    editable ||
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    // Some component libraries render role="textbox" divs
    target.getAttribute?.('role') === 'textbox'
  );
}

export function useKeyboardShortcuts({
  // Per-type creators (preferred)
  onNewTopic,        // ctrl+n
  onNewQuestion,     // ctrl+q
  onNewAccusation,   // ctrl+a
  onNewFact,         // ctrl+o

  // Legacy single creator (fallback)
  onNewCard,

  onDeleteSelected,
  onUndo,
  onRedo,
  onToggleGrid,
  onResetLayout,
  onDeselect,

  selectedCard,
} = {}) {
  const handleKeyDown = useCallback((e) => {
    // Ignore when user is typing or composing
    if (isTypingTarget(e.target) || e.isComposing) return;

    const meta = e.metaKey || e.ctrlKey; // support ⌘ and Ctrl
    const key = e.key.toLowerCase();

    // --- Creation shortcuts (per-type first, then fallback to onNewCard) ---
    if (meta && key === 'n') {
      e.preventDefault();
      if (onNewTopic) onNewTopic();
      else onNewCard?.();
      return;
    }
    if (meta && key === 'q') {
      e.preventDefault();
      if (onNewQuestion) onNewQuestion();
      else onNewCard?.();
      return;
    }
    if (meta && key === 'a') {
      e.preventDefault();
      if (onNewAccusation) onNewAccusation();
      else onNewCard?.();
      return;
    }
    if (meta && key === 'o') {
      e.preventDefault();
      if (onNewFact) onNewFact();
      else onNewCard?.();
      return;
    }

    // --- Delete selected ---
    if ((key === 'delete' || key === 'backspace') && selectedCard) {
      e.preventDefault();
      onDeleteSelected?.();
      return;
    }

    // --- Undo / Redo ---
    // Undo: ctrl/cmd + z (no shift)
    if (meta && key === 'z' && !e.shiftKey) {
      e.preventDefault();
      onUndo?.();
      return;
    }
    // Redo: ctrl/cmd + shift + z OR ctrl/cmd + y
    if ((meta && key === 'z' && e.shiftKey) || (meta && key === 'y')) {
      e.preventDefault();
      onRedo?.();
      return;
    }

    // --- Grid toggle ---
    if (!meta && !e.ctrlKey && key === 'g') {
      e.preventDefault();
      onToggleGrid?.();
      return;
    }

    // --- Reset layout ---
    if (!meta && !e.ctrlKey && key === 'r') {
      e.preventDefault();
      onResetLayout?.();
      return;
    }

    // --- Deselect ---
    if (key === 'escape') {
      e.preventDefault();
      onDeselect?.();
      return;
    }
  }, [
    onNewTopic,
    onNewQuestion,
    onNewAccusation,
    onNewFact,
    onNewCard,
    onDeleteSelected,
    onUndo,
    onRedo,
    onToggleGrid,
    onResetLayout,
    onDeselect,
    selectedCard
  ]);

  useEffect(() => {
    // Capture phase helps survive nested components stopping propagation.
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);

  // Shortcut legend (lowercase as requested)
  return {
    shortcuts: [
      { keys: ['ctrl/⌘', 'n'], description: 'new conversation topic' },
      { keys: ['ctrl/⌘', 'q'], description: 'new open question' },
      { keys: ['ctrl/⌘', 'a'], description: 'new accusation' },
      { keys: ['ctrl/⌘', 'o'], description: 'new factual statement' },
      { keys: ['delete/backspace'], description: 'delete selected' },
      { keys: ['ctrl/⌘', 'z'], description: 'undo' },
      { keys: ['ctrl/⌘', 'shift', 'z'], description: 'redo' },
      { keys: ['g'], description: 'toggle grid' },
      { keys: ['r'], description: 'reset layout' },
      { keys: ['esc'], description: 'deselect' },
    ]
  };
}