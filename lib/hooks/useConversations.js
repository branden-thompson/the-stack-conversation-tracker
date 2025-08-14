// lib/hooks/useConversations.js
import { useCallback, useEffect, useState } from 'react';

async function jsonOrThrow(res, label) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${label} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export function useConversations() {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/conversations', { cache: 'no-store' });
      const data = await jsonOrThrow(res, 'GET /api/conversations');
      setItems(Array.isArray(data.items) ? data.items : []);
      setActiveId(data.activeId ?? null);
    } catch (e) {
      setError(e.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (name) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const conv = await jsonOrThrow(res, 'POST /api/conversations');
    await refresh();
    return conv;
  }, [refresh]);

  const patch = useCallback(async (id, patch) => {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const updated = await jsonOrThrow(res, `PATCH /api/conversations/${id}`);
    await refresh();
    return updated;
  }, [refresh]);

  // Events
  const listEvents = useCallback(async (id) => {
    const res = await fetch(`/api/conversations/${id}/events`, { cache: 'no-store' });
    return jsonOrThrow(res, `GET /api/conversations/${id}/events`);
  }, []);

  const logEvent = useCallback(async (id, type, payload) => {
    const res = await fetch(`/api/conversations/${id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    return jsonOrThrow(res, `POST /api/conversations/${id}/events`);
  }, []);

  const clearEvents = useCallback(async (id) => {
    const res = await fetch(`/api/conversations/${id}/events`, { method: 'DELETE' });
    await jsonOrThrow(res, `DELETE /api/conversations/${id}/events`);
  }, []);

  return {
    loading,
    error,
    items,
    activeId,
    setActiveId,   // used by Dev Page
    refresh,
    create,
    patch,
    listEvents,
    logEvent,
    clearEvents,
  };
}