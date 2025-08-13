/**
 * usePeople.js
 * Simple People CRUD for assigning cards to a person.
 * Backed by NEXT_PUBLIC_API_BASE (json-server or your own API).
 */

import { useCallback, useEffect, useState } from 'react';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, '') || 'http://localhost:5050';

export function usePeople() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/people`);
      if (!res.ok) throw new Error('Failed to fetch people');
      const data = await res.json();
      setPeople(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPerson = useCallback(async (name) => {
    const payload = { id: crypto.randomUUID(), name };
    const res = await fetch(`${API_BASE}/people`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Failed to create person');
    }
    const created = await res.json();
    setPeople(prev => [...prev, created]);
    return created;
  }, []);

  // Case-insensitive finder
  const findByName = useCallback((name) => {
    if (!name) return null;
    const target = name.trim().toLowerCase();
    return people.find(p => p.name.trim().toLowerCase() === target) || null;
  }, [people]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  return {
    people,
    loading,
    error,
    refreshPeople: fetchPeople,
    createPerson,
    findByName,
  };
}