'use client';

import { useCallback, useEffect, useState } from 'react';

const API = {
  list: '/api/conversations',
  one: (id) => `/api/conversations/${id}`,
  events: (id) => `/api/conversations/${id}/events`,
};

export function useConversations() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.list);
      if (!res.ok) throw new Error(`GET ${API.list} failed`);
      const data = await res.json();
      setItems(data);
      const active = data.find((c) => c.status === 'active');
      setActiveId(active ? active.id : null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (name) => {
    const res = await fetch(API.list, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    const convo = await res.json();
    setItems((prev) => [...prev, convo]);
    return convo;
  }, []);

  const patch = useCallback(async (id, updates) => {
    const res = await fetch(API.one(id), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update conversation');
    const updated = await res.json();
    setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const listEvents = useCallback(async (id) => {
    const res = await fetch(API.events(id));
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  }, []);

  const clearEvents = useCallback(async (id) => {
    const res = await fetch(API.events(id), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear events');
    return res.json();
  }, []);

  const logEvent = useCallback(async (conversationId, type, payload) => {
    const res = await fetch(API.events(conversationId), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    if (!res.ok) throw new Error('Failed to append event');
    return res.json();
  }, []);

  return {
    loading, error, items, activeId,
    refresh, create, patch, logEvent, setActiveId,
    listEvents, clearEvents,
  };
}