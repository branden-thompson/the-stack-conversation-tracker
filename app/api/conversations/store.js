// app/api/conversations/store.js

import { emitConversationToSession } from '@/lib/services/conversation-session-bridge';

// ---- Singleton backing store (survives HMR/dev) ----
const g = globalThis;
if (!g.__CONV_STORE__) {
  g.__CONV_STORE__ = {
    conversations: [],   // [{id, name, status, createdAt, updatedAt, startedAt?, pausedAt?, stoppedAt?}]
    eventsById: {},      // { [conversationId]: [{ id, type, payload, at }] }
    activeId: null,
  };
}
const S = g.__CONV_STORE__;

// ---- Utils ----
function now() { return Date.now(); }
function uuid() {
  // RFC4122-ish v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---- Queries ----
export function listConversations() {
  return S.conversations.slice().sort((a, b) => b.createdAt - a.createdAt);
}
export function getConversation(id) {
  return S.conversations.find(c => c.id === id) || null;
}
export function getActiveId() { return S.activeId; }
export function getActive() { return S.activeId ? getConversation(S.activeId) : null; }

// ---- Mutations ----
export function createConversation(name) {
  const conv = {
    id: uuid(),
    name: String(name),
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
    startedAt: now(),
    pausedAt: null,
    stoppedAt: null,
  };
  S.conversations.unshift(conv);
  if (!S.eventsById[conv.id]) S.eventsById[conv.id] = [];
  S.activeId = conv.id;
  return conv;
}

export function patchConversation(id, patch) {
  const c = getConversation(id);
  if (!c) return null;

  if (patch.status) {
    if (patch.status === 'active') {
      c.status = 'active';
      c.startedAt = patch.startedAt ?? now();
      c.pausedAt = null;
      c.stoppedAt = null;
      S.activeId = c.id;
    } else if (patch.status === 'paused') {
      c.status = 'paused';
      c.pausedAt = patch.pausedAt ?? now();
      // keep activeId as-is; dev page still highlights it
    } else if (patch.status === 'stopped') {
      c.status = 'stopped';
      c.stoppedAt = patch.stoppedAt ?? now();
      if (S.activeId === c.id) S.activeId = null;
    }
  }

  for (const k of Object.keys(patch)) {
    if (k !== 'status') c[k] = patch[k];
  }
  c.updatedAt = now();
  return c;
}

export function deleteConversation(id) {
  const idx = S.conversations.findIndex(c => c.id === id);
  if (idx >= 0) S.conversations.splice(idx, 1);
  delete S.eventsById[id];
  if (S.activeId === id) S.activeId = null;
  return true;
}

// ---- Events ----
export function listEvents(id) {
  return (S.eventsById[id] || []).slice().sort((a, b) => a.at - b.at);
}

export function addEvent(id, type, payload) {
  if (!getConversation(id)) return null;
  if (!S.eventsById[id]) S.eventsById[id] = [];
  const evt = { id: uuid(), type, payload: payload || {}, at: now() };
  S.eventsById[id].push(evt);
  return evt;
}

export function clearEvents(id) {
  S.eventsById[id] = [];
  return true;
}

// ---- Convenience functions for API routes ----
export function startConversation(name, userId = null) {
  const conv = createConversation(name);
  
  // Emit to session tracking
  emitConversationToSession(conv.id, 'conversation.started', {
    name: conv.name,
    startedAt: conv.startedAt,
  }, userId);
  
  return conv;
}

export function pauseConversation(id, userId = null) {
  const conv = patchConversation(id, { status: 'paused' });
  
  if (conv) {
    // Emit to session tracking
    emitConversationToSession(id, 'conversation.paused', {
      pausedAt: conv.pausedAt,
    }, userId);
  }
  
  return conv;
}

export function resumeConversation(id, userId = null) {
  const conv = patchConversation(id, { status: 'active' });
  
  if (conv) {
    // Emit to session tracking
    emitConversationToSession(id, 'conversation.resumed', {
      resumedAt: conv.startedAt,
    }, userId);
  }
  
  return conv;
}

export function stopConversation(id, userId = null) {
  const conv = patchConversation(id, { status: 'stopped' });
  
  if (conv) {
    // Emit to session tracking
    emitConversationToSession(id, 'conversation.stopped', {
      stoppedAt: conv.stoppedAt,
    }, userId);
  }
  
  return conv;
}