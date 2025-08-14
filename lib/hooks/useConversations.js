/**
 * useConversations
 * Wires header Start/Pause/Resume/Stop to Conversation API.
 * Endpoints expected (added below):
 *   GET  /api/conversations/active
 *   POST /api/conversations/start          { name }
 *   POST /api/conversations/:id/pause
 *   POST /api/conversations/:id/resume
 *   POST /api/conversations/:id/stop
 *
 * Robust fallbacks:
 *   - If /start returns 404/405, tries POST /api/conversations {action:'start', name}
 *   - For pause/resume/stop, if 404, tries PATCH /api/conversations/:id {action}
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API = {
  active: '/api/conversations/active',
  start: '/api/conversations/start',
  pause: (id) => `/api/conversations/${id}/pause`,
  resume: (id) => `/api/conversations/${id}/resume`,
  stop: (id) => `/api/conversations/${id}/stop`,
  root: '/api/conversations',
  patch: (id) => `/api/conversations/${id}`,
};

async function parseOrText(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  const text = await res.text().catch(() => '');
  return text ? { message: text } : {};
}

async function jsonOrThrow(res, label = 'request') {
  if (!res.ok) {
    const body = await parseOrText(res);
    const msg = typeof body === 'object' ? JSON.stringify(body) : String(body);
    throw new Error(`${label} failed: ${res.status} ${msg}`);
  }
  return parseOrText(res);
}

export function useConversations() {
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);

  const fetchActive = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(API.active, { cache: 'no-store' });
      if (res.status === 404) {
        setActive(null);
      } else {
        const data = await jsonOrThrow(res, 'GET /active');
        setActive(data || null);
      }
    } catch (e) {
      setErr(e.message || String(e));
      setActive(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  // heartbeat while active
  useEffect(() => {
    if (!active || active.status !== 'active') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => setTick((n) => n + 1), 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active?.status]);

  const fmt = useCallback((ms) => {
    if (!ms || ms < 0) return '00:00:00';
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${ss}`;
  }, []);

  const elapsedMs = useMemo(() => {
    if (!active) return 0;
    const accum = active.accumulatedMs || 0;
    if (active.status === 'active' && active.startedAt) {
      return accum + (Date.now() - new Date(active.startedAt).getTime());
    }
    return accum;
  }, [active, tick]);

  const start = useCallback(async (maybeName) => {
    let name = (maybeName ?? '').trim();
    if (!name) {
      name = window.prompt('Name this conversation:', '') || '';
    }
    if (!name.trim()) return null;

    // Primary endpoint
    let res = await fetch(API.start, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    // Fallback: POST /api/conversations { action:'start', name }
    if (res.status === 404 || res.status === 405) {
      res = await fetch(API.root, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', name }),
      });
    }

    const created = await jsonOrThrow(res, 'POST /start');
    setActive(created || null);
    return created;
  }, []);

  const pause = useCallback(async () => {
    if (!active?.id || active.status !== 'active') return;
    let res = await fetch(API.pause(active.id), { method: 'POST' });
    if (res.status === 404 || res.status === 405) {
      res = await fetch(API.patch(active.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' }),
      });
    }
    const updated = await jsonOrThrow(res, 'pause');
    setActive(updated || null);
  }, [active]);

  const resume = useCallback(async () => {
    if (!active?.id || active.status !== 'paused') return;
    let res = await fetch(API.resume(active.id), { method: 'POST' });
    if (res.status === 404 || res.status === 405) {
      res = await fetch(API.patch(active.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' }),
      });
    }
    const updated = await jsonOrThrow(res, 'resume');
    setActive(updated || null);
  }, [active]);

  const stop = useCallback(async () => {
    if (!active?.id) return;
    const ok = window.confirm('End this conversation? This will stop the timer and save the final state.');
    if (!ok) return;

    let res = await fetch(API.stop(active.id), { method: 'POST' });
    if (res.status === 404 || res.status === 405) {
      res = await fetch(API.patch(active.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
    }
    const updated = await jsonOrThrow(res, 'stop');

    if (updated?.status === 'stopped' || updated === true) {
      setActive(null);
    } else {
      setActive(updated ?? null);
    }
  }, [active]);

  return {
    active,
    loading,
    error,
    start,
    pause,
    resume,
    stop,
    fmt,
    elapsedMs,
    refreshActive: fetchActive,
  };
}