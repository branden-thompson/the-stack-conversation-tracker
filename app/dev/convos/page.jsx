'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConversations } from '@/lib/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { DevHeader } from '@/components/ui/dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { RefreshCw, Download } from 'lucide-react';

function fmtDuration(ms) {
  if (!ms || ms < 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${ss}`;
}

function JSONPreview({ value }) {
  return (
    <pre className="text-xs bg-stone-100 dark:bg-stone-800 rounded p-2 overflow-auto max-h-40">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

const typeColor = (type) => {
  switch (type) {
    case 'card.created': return 'bg-emerald-500';
    case 'card.moved':   return 'bg-sky-500';
    case 'card.updated': return 'bg-amber-500';
    case 'card.deleted': return 'bg-rose-500';
    case 'card.flipped': return 'bg-pink-500';
    default:             return 'bg-stone-400';
  }
};

const typeLabel = (type) => {
  switch (type) {
    case 'card.created': return 'Card created';
    case 'card.moved':   return 'Card moved';
    case 'card.updated': return 'Card updated';
    case 'card.deleted': return 'Card deleted';
    case 'card.flipped': return 'Card flipped';
    default:             return type;
  }
};

const summarizePayload = (type, payload = {}) => {
  if (type === 'card.created') {
    return `id: ${payload.id ?? '—'} • type: ${payload.type ?? '—'}`;
  }
  if (type === 'card.moved') {
    return `id: ${payload.id ?? '—'} • ${payload.from ?? '—'} → ${payload.to ?? '—'}`;
  }
  if (type === 'card.updated') {
    const keys = Object.keys(payload).filter((k) => k !== 'id');
    return `id: ${payload.id ?? '—'} • fields: ${keys.length ? keys.join(', ') : '—'}`;
  }
  if (type === 'card.deleted') {
    return `id: ${payload.id ?? '—'}`;
  }
  if (type === 'card.flipped') {
    return `id: ${payload.cardId ?? '—'} • ${payload.from ?? '—'} → ${payload.flippedTo ?? '—'} • by: ${payload.flippedBy ?? '—'}`;
  }
  return Object.keys(payload).length ? JSON.stringify(payload) : '—';
};

export default function DevConvos() {
  const {
    loading, error, items, activeId,
    refresh, create, patch, logEvent, setActiveId,
    listEvents, clearEvents,
  } = useConversations();

  // MINIMAL HARDENING: always treat items as an array
  const safeItems = Array.isArray(items) ? items : [];
  
  // Debug logging
  console.log('[DevConvos] Conversations loaded:', { 
    loading, 
    error, 
    itemsCount: safeItems.length, 
    activeId,
    items: safeItems 
  });

  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [events, setEvents] = useState([]);
  const [poll, setPoll] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [query, setQuery] = useState('');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [trayOpen, setTrayOpen] = useState(false);
  

  const selected = useMemo(
    () => safeItems.find((c) => c.id === (selectedId || activeId)) || null,
    [safeItems, selectedId, activeId]
  );

  // Poll events for the selected conversation
  useEffect(() => {
    let t;
    async function run() {
      if (!selected) { setEvents([]); return; }
      try {
        const data = await listEvents(selected.id);
        setEvents(data);
      } catch {
        // ignore fetch noise in dev
      }
    }
    run();
    if (poll) {
      t = setInterval(run, 1000);
    }
    return () => t && clearInterval(t);
  }, [selected, poll, listEvents]);

  // Auto-refresh conversations list every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Filtered + sorted list for the Events table (right panel)
  const filtered = useMemo(() => {
    let rows = events;
    if (filterType !== 'all') rows = rows.filter((e) => e.type === filterType);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((e) =>
        e.type.toLowerCase().includes(q) ||
        JSON.stringify(e.payload).toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) =>
      sortDir === 'asc' ? a.at - b.at : b.at - a.at
    );
    return rows;
  }, [events, filterType, query, sortDir]);

  // Asc order for Timeline (left panel)
  const timeline = useMemo(() => [...filtered].sort((a, b) => a.at - b.at), [filtered]);

  const runtime = useMemo(() => {
    if (!selected) return '00:00:00';
    if (selected.status === 'active') {
      const base = selected.startedAt || Date.now();
      const paused = selected.pausedAt ? selected.pausedAt - base : 0;
      return fmtDuration(Date.now() - base - (paused > 0 ? paused : 0));
    }
    if (selected.status === 'paused' && selected.startedAt) {
      return fmtDuration((selected.pausedAt || Date.now()) - selected.startedAt);
    }
    if (selected.status === 'stopped' && selected.startedAt) {
      return fmtDuration((selected.stoppedAt || selected.updatedAt) - selected.startedAt);
    }
    return '00:00:00';
  }, [selected]);

  const rightControls = (
    <>
      <Button 
        variant="outline"
        onClick={() => refresh()}
        className="h-[40px] leading-none"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      <Button 
        variant="outline"
        onClick={() => {
          const blob = new Blob(
            [JSON.stringify({ conversations: safeItems, events }, null, 2)],
            { type: 'application/json' }
          );
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `dev-conversations-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="h-[40px] leading-none"
      >
        <Download className="w-4 h-4 mr-2" />
        Export All
      </Button>
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <DevHeader
        onOpenTray={() => setTrayOpen(true)}
        rightControls={rightControls}
      />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[320px_1fr] gap-4 p-6 text-stone-900 dark:text-stone-100 min-h-0">
      {/* LEFT: conversations list */}
      <div className="flex flex-col rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="p-3 border-b border-stone-200 dark:border-stone-700">
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"
              placeholder="New conversation name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              onClick={async () => {
                if (!name.trim()) return;
                await create(name.trim());
                setName('');
                refresh();
              }}
            >
              Create
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto divide-y divide-stone-200 dark:divide-stone-800">
          {loading && <div className="p-3 text-sm">Loading…</div>}
          {error && <div className="p-3 text-sm text-red-500">{error}</div>}
          {safeItems.map((c) => (
            <div
              key={c.id}
              className={`p-3 cursor-pointer ${selected?.id === c.id ? 'bg-stone-100 dark:bg-stone-800' : ''}`}
              onClick={() => setSelectedId(c.id)}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold truncate">{c.name}</div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700">
                  {c.status}
                </span>
              </div>
              <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                {new Date(c.createdAt).toLocaleString()}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={c.status === 'active' ? 'default' : 'outline'}
                  onClick={async (e) => {
                    e.stopPropagation();
                    await patch(c.id, {
                      status: 'active',
                      startedAt: c.startedAt || Date.now(),
                      pausedAt: null,
                      stoppedAt: null,
                    });
                    setActiveId(c.id);
                    refresh();
                  }}
                >
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await patch(c.id, {
                      status: 'paused',
                      pausedAt: Date.now(),
                    });
                    refresh();
                  }}
                >
                  Pause
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await patch(c.id, {
                      status: 'stopped',
                      stoppedAt: Date.now(),
                    });
                    refresh();
                  }}
                >
                  Stop
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await fetch(`/api/conversations/${c.id}`, { method: 'DELETE' });
                    if (selectedId === c.id) setSelectedId(null);
                    refresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: details + filters up top, middle split (timeline/events), emit bar fixed at bottom */}
      <div className="flex flex-col rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden min-h-0">
        {/* Details */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-700">
          {selected ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{selected.name}</div>
                <div className="text-xs text-stone-400 dark:text-stone-500">
                  id: {selected.id}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-700">
                  {selected.status}
                </span>
                <span className="text-sm font-mono">{runtime}</span>
                <Button
                  variant="outline"
                  onClick={() => setPoll((p) => !p)}
                  title="Toggle live polling"
                >
                  {poll ? 'Live: ON' : 'Live: OFF'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob(
                      [JSON.stringify({ conversation: selected, events }, null, 2)],
                      { type: 'application/json' }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `conversation-${selected?.id || 'export'}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={!events.length}
                >
                  Export JSON
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => { await clearEvents(selected.id); setEvents([]); }}
                  disabled={!events.length}
                >
                  Clear events
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-stone-400 dark:text-stone-500">Select a conversation from the left.</div>
          )}
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="card.created">card.created</option>
            <option value="card.moved">card.moved</option>
            <option value="card.updated">card.updated</option>
            <option value="card.deleted">card.deleted</option>
            <option value="card.flipped">card.flipped</option>
          </select>
          <input
            className="border rounded px-2 py-1 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 flex-1"
            placeholder="Search in type or payload…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600"
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>

        {/* MIDDLE: split horizontally into Timeline (left) and Events (right); both scroll */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="grid grid-cols-2 h-full min-h-0">
            {/* Timeline (left column) */}
            <section className="h-full flex flex-col border-r border-stone-200 dark:border-stone-700 min-h-0">
              <div className="px-4 py-2 text-sm font-semibold border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 flex-shrink-0">Timeline</div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
                {selected ? (
                  timeline.length ? (
                    <ol className="relative ml-5">
                      {/* vertical rail */}
                      <span className="absolute left-0 top-0 bottom-0 w-px bg-stone-300 dark:bg-stone-700" />
                      {timeline.map((e) => (
                        <li key={e.id} className="relative pl-4 py-2">
                          {/* dot */}
                          <span
                            className={`absolute left-[-6px] top-[14px] w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-900 ${typeColor(e.type)}`}
                            aria-hidden="true"
                          />
                          {/* content */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div className="text-sm font-medium">
                              {typeLabel(e.type)}
                            </div>
                            <div className="text-xs font-mono text-stone-400 dark:text-stone-500 dark:text-stone-400">
                              {new Date(e.at).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                            {summarizePayload(e.type, e.payload)}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="p-6 text-sm text-stone-400 dark:text-stone-500">No timeline entries.</div>
                  )
                ) : (
                  <div className="p-6 text-sm text-stone-400 dark:text-stone-500">Select a conversation to view timeline.</div>
                )}
              </div>
            </section>

            {/* Events (right column) */}
            <section className="h-full flex flex-col min-h-0">
              <div className="px-4 py-2 text-sm font-semibold border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 flex-shrink-0">Events</div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {selected ? (
                  filtered.length ? (
                    <ul className="divide-y divide-stone-200 dark:divide-stone-800">
                      {filtered.map((e) => (
                        <li key={e.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-xs opacity-80">
                              {new Date(e.at).toLocaleString()}
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700">
                              {e.type}
                            </span>
                          </div>
                          <div className="mt-2">
                            <JSONPreview value={e.payload} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-sm text-stone-400 dark:text-stone-500">No events.</div>
                  )
                ) : (
                  <div className="p-6 text-sm text-stone-400 dark:text-stone-500">Select a conversation to view events.</div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* EMIT BAR: fixed at bottom of right column */}
        {selected && (
          <div className="p-3 border-t border-stone-200 dark:border-stone-700 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => logEvent(selected.id, 'card.created', { id: crypto.randomUUID(), type: 'topic' })}
            >
              Emit: card.created
            </Button>
            <Button
              variant="secondary"
              onClick={() => logEvent(selected.id, 'card.moved', { id: 'demo', from: 'active', to: 'resolved' })}
            >
              Emit: card.moved
            </Button>
            <Button
              variant="secondary"
              onClick={() => logEvent(selected.id, 'card.updated', { id: 'demo', content: 'edited' })}
            >
              Emit: card.updated
            </Button>
            <Button
              variant="secondary"
              onClick={() => logEvent(selected.id, 'card.deleted', { id: 'demo' })}
            >
              Emit: card.deleted
            </Button>
            <Button
              variant="secondary"
              onClick={() => logEvent(selected.id, 'card.flipped', { 
                cardId: 'demo', 
                flippedBy: 'user',
                zone: 'active',
                from: 'faceUp',
                flippedTo: 'faceDown'
              })}
            >
              Emit: card.flipped
            </Button>
          </div>
        )}
      </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
        onNewCard={() => {}} // Disabled for dev pages
        onResetLayout={() => {}} // Disabled for dev pages  
        onRefreshCards={() => window.location.reload()}
        title="Dev Ops Center"
      />
    </div>
  );
}