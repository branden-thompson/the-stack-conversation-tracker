'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTabVisibility } from '@/lib/hooks/useTabVisibility';
import { useConversations } from '@/lib/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { DevHeader } from '@/components/ui/dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { RefreshCw, Download } from 'lucide-react';
import { EVENT_TYPES, EVENT_COLORS, EVENT_LABELS, DEV_LAYOUT } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { ConversationStatusBadge, ConversationStatusIndicator } from '@/components/ui/status-badge';
import { SelectionEmptyState, NoDataEmptyState } from '@/components/ui/empty-state';
import { EventTypeBadge } from '@/components/ui/event-type-badge';
import { JSONPreview } from '@/components/ui/json-preview';
import { ConversationActions, EventActions } from '@/components/ui/button-group';
import { EventFilterControls } from '@/components/ui/filter-controls';

function fmtDuration(ms) {
  if (!ms || ms < 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${ss}`;
}


const typeColor = (type) => {
  return EVENT_COLORS[type] || 'bg-zinc-400';
};

const typeLabel = (type) => {
  return EVENT_LABELS[type] || type;
};

const summarizePayload = (type, payload = {}) => {
  if (type === EVENT_TYPES.CARD_CREATED) {
    return `id: ${payload.id ?? '—'} • type: ${payload.type ?? '—'}`;
  }
  if (type === EVENT_TYPES.CARD_MOVED) {
    return `id: ${payload.id ?? '—'} • ${payload.from ?? '—'} → ${payload.to ?? '—'}`;
  }
  if (type === EVENT_TYPES.CARD_UPDATED) {
    const keys = Object.keys(payload).filter((k) => k !== 'id');
    return `id: ${payload.id ?? '—'} • fields: ${keys.length ? keys.join(', ') : '—'}`;
  }
  if (type === EVENT_TYPES.CARD_DELETED) {
    return `id: ${payload.id ?? '—'}`;
  }
  if (type === EVENT_TYPES.CARD_FLIPPED) {
    return `id: ${payload.cardId ?? '—'} • ${payload.from ?? '—'} → ${payload.flippedTo ?? '—'} • by: ${payload.flippedBy ?? '—'}`;
  }
  return Object.keys(payload).length ? JSON.stringify(payload) : '—';
};

export default function DevConvos() {
  const dynamicTheme = useDynamicAppTheme();
  
  const {
    loading, error, items, activeId,
    refresh, create, patch, logEvent, setActiveId,
    listEvents, clearEvents,
  } = useConversations();

  // MINIMAL HARDENING: always treat items as an array
  const safeItems = Array.isArray(items) ? items : [];
  
  // Debug logging - only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[DevConvos] Conversations loaded:', { 
      loading, 
      error, 
      itemsCount: safeItems.length, 
      activeId
      // Omitting full items array to avoid large console output
    });
  }

  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [events, setEvents] = useState([]);
  const [poll, setPoll] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [query, setQuery] = useState('');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [trayOpen, setTrayOpen] = useState(false);
  
  // Smart polling based on tab visibility
  const isTabVisible = useTabVisibility();

  const selected = useMemo(
    () => safeItems.find((c) => c.id === (selectedId || activeId)) || null,
    [safeItems, selectedId, activeId]
  );

  // Poll events for the selected conversation with smart tab visibility
  useEffect(() => {
    let t;
    async function run() {
      if (!selected) { setEvents([]); return; }
      // Only fetch when tab is visible (smart polling optimization)
      if (!isTabVisible) return;
      
      try {
        const data = await listEvents(selected.id);
        setEvents(data);
      } catch {
        // ignore fetch noise in dev
      }
    }
    run();
    if (poll) {
      t = setInterval(run, DEV_LAYOUT.eventPollInterval);
    }
    return () => t && clearInterval(t);
  }, [selected, poll, listEvents, isTabVisible]);

  // Auto-refresh conversations list with smart tab visibility
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh when tab is visible (smart polling optimization)
      if (isTabVisible) {
        refresh();
      }
    }, DEV_LAYOUT.conversationRefreshInterval);
    return () => clearInterval(interval);
  }, [refresh, isTabVisible]);

  // Immediate sync when tab becomes visible
  useEffect(() => {
    if (isTabVisible && selected) {
      // Sync immediately when user returns to tab
      refresh();
      listEvents(selected.id).then(setEvents).catch(() => {});
    }
  }, [isTabVisible, selected, refresh, listEvents]);

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

  // Event types for emit buttons
  const eventTypesToEmit = useMemo(() => [
    {
      type: EVENT_TYPES.CARD_CREATED,
      label: 'Emit: card.created',
      payload: { id: crypto.randomUUID(), type: 'topic' }
    },
    {
      type: EVENT_TYPES.CARD_MOVED,
      label: 'Emit: card.moved',
      payload: { id: 'demo', from: 'active', to: 'resolved' }
    },
    {
      type: EVENT_TYPES.CARD_UPDATED,
      label: 'Emit: card.updated',
      payload: { id: 'demo', content: 'edited' }
    },
    {
      type: EVENT_TYPES.CARD_DELETED,
      label: 'Emit: card.deleted',
      payload: { id: 'demo' }
    },
    {
      type: EVENT_TYPES.CARD_FLIPPED,
      label: 'Emit: card.flipped',
      payload: { 
        cardId: 'demo', 
        flippedBy: 'user',
        zone: 'active',
        from: 'faceUp',
        flippedTo: 'faceDown'
      }
    }
  ], []);

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
          a.download = `${DEV_LAYOUT.exportFilenames.allConversations}-${Date.now()}.json`;
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
    <div className={`h-screen flex flex-col ${dynamicTheme.colors.background.primary}`}>
      {/* Header */}
      <DevHeader
        onOpenTray={() => setTrayOpen(true)}
        rightControls={rightControls}
      />

      {/* Main Content */}
      <div 
        className={`flex-1 grid gap-${DEV_LAYOUT.gridGap} ${DEV_LAYOUT.sectionPadding} ${dynamicTheme.colors.text.primary} min-h-0`}
        style={{
          gridTemplateColumns: `${DEV_LAYOUT.leftPanelWidth} 1fr`
        }}
      >
      {/* LEFT: conversations list */}
      <div className={`flex flex-col rounded-lg border ${dynamicTheme.colors.border.primary} overflow-hidden`}>
        <div className={`p-3 border-b ${dynamicTheme.colors.border.primary}`}>
          <div className="flex gap-2">
            <input
              className={`flex-1 border rounded px-2 py-1 ${dynamicTheme.colors.background.secondary} ${dynamicTheme.colors.border.secondary}`}
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

        <div className={`flex-1 overflow-auto divide-y ${dynamicTheme.colors.border.primary}`}>
          {loading && <div className="p-3 text-sm">Loading…</div>}
          {error && <div className="p-3 text-sm text-red-500">{error}</div>}
          {safeItems.map((c) => (
            <div
              key={c.id}
              className={`p-3 cursor-pointer ${selected?.id === c.id ? dynamicTheme.colors.background.tertiary : ''}`}
              onClick={() => setSelectedId(c.id)}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold truncate">{c.name}</div>
                <ConversationStatusBadge status={c.status} size="s" />
              </div>
              <div className={`text-xs ${dynamicTheme.colors.text.light} mt-1`}>
                {new Date(c.createdAt).toLocaleString()}
              </div>
              <div className="mt-2">
                <ConversationActions
                  conversation={c}
                  compact={true}
                  onStart={async (conv) => {
                    await patch(conv.id, {
                      status: 'active',
                      startedAt: conv.startedAt || Date.now(),
                      pausedAt: null,
                      stoppedAt: null,
                    });
                    setActiveId(conv.id);
                    refresh();
                  }}
                  onPause={async (conv) => {
                    await patch(conv.id, {
                      status: 'paused',
                      pausedAt: Date.now(),
                    });
                    refresh();
                  }}
                  onStop={async (conv) => {
                    await patch(conv.id, {
                      status: 'stopped',
                      stoppedAt: Date.now(),
                    });
                    refresh();
                  }}
                  onDelete={async (conv) => {
                    await fetch(`/api/conversations/${conv.id}`, { method: 'DELETE' });
                    if (selectedId === conv.id) setSelectedId(null);
                    refresh();
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: details + filters up top, middle split (timeline/events), emit bar fixed at bottom */}
      <div className={`flex flex-col rounded-lg border ${dynamicTheme.colors.border.primary} overflow-hidden min-h-0`}>
        {/* Details */}
        <div className={`p-4 border-b ${dynamicTheme.colors.border.primary}`}>
          {selected ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{selected.name}</div>
                <div className={`text-xs ${dynamicTheme.colors.text.light}`}>
                  id: {selected.id}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ConversationStatusIndicator 
                  status={selected.status}
                  runtime={runtime}
                  size="s"
                />
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
                    a.download = `${DEV_LAYOUT.exportFilenames.singleConversation}-${selected?.id || 'export'}.json`;
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
            <SelectionEmptyState 
              title="Select a Conversation"
              description="Choose a conversation from the left to view details."
              size="sm"
            />
          )}
        </div>

        {/* Filters */}
        <EventFilterControls
          eventTypes={Object.values(EVENT_TYPES)}
          filterType={filterType}
          query={query}
          sortDir={sortDir}
          onFilterTypeChange={setFilterType}
          onQueryChange={setQuery}
          onSortChange={setSortDir}
        />

        {/* MIDDLE: split horizontally into Timeline (left) and Events (right); both scroll */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className={`grid ${DEV_LAYOUT.timelineEventsGrid} h-full min-h-0`}>
            {/* Timeline (left column) */}
            <section className={`h-full flex flex-col border-r ${dynamicTheme.colors.border.primary} min-h-0`}>
              <div className={`px-4 py-2 text-sm font-semibold border-b ${dynamicTheme.colors.border.primary} ${dynamicTheme.colors.background.tertiary} flex-shrink-0`}>Timeline</div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
                {selected ? (
                  timeline.length ? (
                    <ol className="relative ml-5 pt-2">
                      {/* vertical rail */}
                      <div 
                        className={`absolute left-0 top-2 w-0.5 bg-zinc-300 dark:bg-zinc-600`}
                        style={{ height: 'calc(100% - 8px)' }}
                      />
                      {timeline.map((e) => (
                        <li key={e.id} className="relative pl-4 py-2">
                          {/* dot */}
                          <span
                            className={`absolute left-[-6px] top-[14px] w-3 h-3 rounded-full ring-2 ring-zinc-50 dark:ring-zinc-900 ${typeColor(e.type)}`}
                            aria-hidden="true"
                          />
                          {/* content */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div className="text-sm font-medium">
                              {typeLabel(e.type)}
                            </div>
                            <div className={`text-xs font-mono ${dynamicTheme.colors.text.light}`}>
                              {new Date(e.at).toLocaleString()}
                            </div>
                          </div>
                          <div className={`text-xs ${dynamicTheme.colors.text.tertiary} mt-1`}>
                            {summarizePayload(e.type, e.payload)}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <NoDataEmptyState 
                      title="No Timeline Entries"
                      description="Timeline events will appear here as they occur."
                      size="sm"
                    />
                  )
                ) : (
                  <SelectionEmptyState 
                    title="Select a Conversation"
                    description="Choose a conversation to view its timeline."
                    size="sm"
                  />
                )}
              </div>
            </section>

            {/* Events (right column) */}
            <section className="h-full flex flex-col min-h-0">
              <div className={`px-4 py-2 text-sm font-semibold border-b ${dynamicTheme.colors.border.primary} ${dynamicTheme.colors.background.tertiary} flex-shrink-0`}>Events</div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {selected ? (
                  filtered.length ? (
                    <ul className={`divide-y ${dynamicTheme.colors.border.primary}`}>
                      {filtered.map((e) => (
                        <li key={e.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-xs opacity-80">
                              {new Date(e.at).toLocaleString()}
                            </div>
                            <EventTypeBadge 
                              eventType={e.type}
                              size="xs"
                              showIcon={false}
                            />
                          </div>
                          <div className="mt-2">
                            <JSONPreview 
                              value={e.payload} 
                              collapsible={true}
                              maxHeight="max-h-32"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <NoDataEmptyState 
                      title="No Events"
                      description="Events will be listed here when they occur."
                      size="sm"
                    />
                  )
                ) : (
                  <SelectionEmptyState 
                    title="Select a Conversation"
                    description="Choose a conversation to view its events."
                    size="sm"
                  />
                )}
              </div>
            </section>
          </div>
        </div>

        {/* EMIT BAR: fixed at bottom of right column */}
        {selected && (
          <div className={`p-3 border-t ${dynamicTheme.colors.border.primary}`}>
            <EventActions
              eventTypes={eventTypesToEmit}
              onEmitEvent={(eventType, payload) => logEvent(selected.id, eventType, payload)}
              compact={true}
            />
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