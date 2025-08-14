/**
 * useConversationControls Hook
 * 
 * Centralized conversation control logic for managing conversation state,
 * timing, and control actions (start, pause, resume, stop).
 * 
 * This hook provides:
 * - Real-time conversation timing
 * - Conversation control functions
 * - Active conversation state
 * - All state flows to Dev Page via conversation API
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useConversations } from './useConversations';

// Format runtime display for header
function fmtDuration(ms) {
  if (!ms || ms < 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${ss}`;
}

export function useConversationControls() {
  // Conversations API
  const conv = useConversations();
  const { activeId, items: convItems, create, patch, refresh: refreshConvos } = conv;

  // Display runtime ticker (client-side) for active conversation
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Calculate active conversation
  const activeConversation = useMemo(() => {
    if (!activeId) return null;
    return (convItems || []).find(c => c.id === activeId) || null;
  }, [activeId, convItems]);

  // Calculate real-time runtime
  const runtime = useMemo(() => {
    const c = activeConversation;
    if (!c) return '00:00:00';
    if (c.status === 'active') {
      const base = c.startedAt || Date.now();
      const paused = c.pausedAt ? c.pausedAt - base : 0;
      return fmtDuration(Date.now() - base - (paused > 0 ? paused : 0));
    }
    if (c.status === 'paused' && c.startedAt) {
      return fmtDuration((c.pausedAt || Date.now()) - c.startedAt);
    }
    if (c.status === 'stopped' && c.startedAt) {
      return fmtDuration((c.stoppedAt || c.updatedAt) - c.startedAt);
    }
    return '00:00:00';
  }, [activeConversation, tick]);

  // Conversation control functions
  const onStart = useCallback(async () => {
    let n = window.prompt('Name this conversation:', '') || '';
    n = n.trim();
    if (!n) return;
    await create(n);         // server sets it active
    await refreshConvos();
  }, [create, refreshConvos]);

  const onPause = useCallback(async () => {
    const c = activeConversation;
    if (!c) return;
    await patch(c.id, { status: 'paused', pausedAt: Date.now() });
  }, [activeConversation, patch]);

  const onResumeOrStart = useCallback(async () => {
    const c = activeConversation;
    if (c && c.status === 'paused') {
      await patch(c.id, { status: 'active', startedAt: Date.now(), pausedAt: null, stoppedAt: null });
    } else {
      await onStart();
    }
  }, [activeConversation, patch, onStart]);

  const onStop = useCallback(async () => {
    const c = activeConversation;
    if (!c) return;
    const ok = window.confirm('End this conversation? This will stop the timer.');
    if (!ok) return;
    await patch(c.id, { status: 'stopped', stoppedAt: Date.now() });
  }, [activeConversation, patch]);

  return {
    // State
    activeConversation,
    runtime,
    
    // Control functions
    onStart,
    onPause,
    onResumeOrStart,
    onStop,
    
    // For advanced usage
    conversationApi: conv,
  };
}