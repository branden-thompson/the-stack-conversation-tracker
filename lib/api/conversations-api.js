/**
 * Conversations API Functions
 * 
 * Centralized API functions for conversation operations.
 * Used by both React Query hooks and legacy hooks.
 */

async function jsonOrThrow(res, label) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${label} failed: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Fetch all conversations with active conversation info
 */
export async function fetchConversations() {
  const res = await fetch('/api/conversations', { cache: 'no-store' });
  const data = await jsonOrThrow(res, 'GET /api/conversations');
  return {
    items: Array.isArray(data.items) ? data.items : [],
    activeId: data.activeId ?? null,
  };
}

/**
 * Create a new conversation
 */
export async function createConversation(name) {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return jsonOrThrow(res, 'POST /api/conversations');
}

/**
 * Update a conversation
 */
export async function updateConversation(id, patch) {
  const res = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return jsonOrThrow(res, `PATCH /api/conversations/${id}`);
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id) {
  const res = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE',
  });
  await jsonOrThrow(res, `DELETE /api/conversations/${id}`);
}

/**
 * Fetch conversation events
 */
export async function fetchConversationEvents(id) {
  const res = await fetch(`/api/conversations/${id}/events`, { cache: 'no-store' });
  return jsonOrThrow(res, `GET /api/conversations/${id}/events`);
}

/**
 * Log a conversation event
 */
export async function logConversationEvent(id, type, payload) {
  const res = await fetch(`/api/conversations/${id}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload }),
  });
  return jsonOrThrow(res, `POST /api/conversations/${id}/events`);
}

/**
 * Clear conversation events
 */
export async function clearConversationEvents(id) {
  const res = await fetch(`/api/conversations/${id}/events`, { method: 'DELETE' });
  await jsonOrThrow(res, `DELETE /api/conversations/${id}/events`);
}