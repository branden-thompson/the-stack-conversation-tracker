/**
 * useUserTracking Hook
 * Subscribe to real-time user session updates and manage tracking state
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SESSION_CONFIG } from '@/lib/utils/session-constants';
import { useTabVisibility } from '@/lib/hooks/useTabVisibility';

export function useUserTracking(config = {}) {
  // State
  const [sessions, setSessions] = useState({ grouped: {}, guests: [], total: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionMode, setConnectionMode] = useState(config.mode || SESSION_CONFIG.DEFAULT_MODE);
  
  // Refs
  const pollIntervalRef = useRef(null);
  const eventSourceRef = useRef(null);
  const lastFetchRef = useRef(0);
  
  // Tab visibility for smart polling
  const isTabVisible = useTabVisibility();
  
  // Configuration
  const pollInterval = config.pollInterval || SESSION_CONFIG.POLL_INTERVAL_MS;
  const maxEvents = config.maxEvents || 100;

  /**
   * Fetch sessions from API
   */
  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessions(data);
      lastFetchRef.current = Date.now();
      setError(null);
      
      return data;
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
      return null;
    }
  }, []);

  /**
   * Fetch recent events
   */
  const fetchEvents = useCallback(async (limit = maxEvents) => {
    try {
      const response = await fetch(`/api/sessions/events?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      setEvents(data.events || []);
      
      return data.events;
    } catch (err) {
      console.error('Error fetching events:', err);
      return [];
    }
  }, [maxEvents]);

  /**
   * Create a simulated session
   */
  const createSimulatedSession = useCallback(async (count = 1, autoActivity = true) => {
    try {
      const response = await fetch('/api/sessions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, autoActivity }),
      });
      
      if (!response.ok) throw new Error('Failed to create simulated session');
      
      const data = await response.json();
      
      // Refresh sessions
      await fetchSessions();
      
      return data.sessions;
    } catch (err) {
      console.error('Error creating simulated session:', err);
      setError(err.message);
      return null;
    }
  }, [fetchSessions]);

  /**
   * Remove simulated sessions
   */
  const removeSimulatedSessions = useCallback(async (sessionId = null) => {
    try {
      const url = sessionId 
        ? `/api/sessions/simulate?sessionId=${sessionId}`
        : '/api/sessions/simulate';
        
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove simulated sessions');
      
      const data = await response.json();
      
      // Refresh sessions
      await fetchSessions();
      
      return data;
    } catch (err) {
      console.error('Error removing simulated sessions:', err);
      setError(err.message);
      return null;
    }
  }, [fetchSessions]);

  /**
   * Get simulated sessions
   */
  const getSimulatedSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions/simulate');
      if (!response.ok) throw new Error('Failed to fetch simulated sessions');
      
      const data = await response.json();
      return data.sessions;
    } catch (err) {
      console.error('Error fetching simulated sessions:', err);
      return [];
    }
  }, []);

  /**
   * Start polling with smart tab visibility detection
   */
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    
    pollIntervalRef.current = setInterval(async () => {
      // Only fetch when tab is visible (smart polling optimization)
      if (isTabVisible) {
        await fetchSessions();
        await fetchEvents();
      }
    }, pollInterval);
  }, [pollInterval, fetchSessions, fetchEvents, isTabVisible]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  /**
   * Start EventSource connection (for push mode)
   */
  const startEventSource = useCallback(() => {
    if (eventSourceRef.current) return;
    
    eventSourceRef.current = new EventSource('/api/sessions/stream');
    
    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'session_update') {
          setSessions(data.sessions);
        } else if (data.type === 'event') {
          setEvents(prev => [data.event, ...prev.slice(0, maxEvents - 1)]);
        }
      } catch (err) {
        console.error('Error processing SSE message:', err);
      }
    };
    
    eventSourceRef.current.onerror = (err) => {
      console.error('EventSource error:', err);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      
      // Fallback to polling
      setConnectionMode('polling');
      startPolling();
    };
  }, [maxEvents, startPolling]);

  /**
   * Stop EventSource connection
   */
  const stopEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  /**
   * Change connection mode
   */
  const changeMode = useCallback((newMode) => {
    // Stop current mode
    if (connectionMode === 'polling') {
      stopPolling();
    } else if (connectionMode === 'push') {
      stopEventSource();
    }
    
    // Start new mode
    setConnectionMode(newMode);
    
    if (newMode === 'polling') {
      startPolling();
    } else if (newMode === 'push') {
      startEventSource();
    }
  }, [connectionMode, startPolling, stopPolling, startEventSource, stopEventSource]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchSessions(),
      fetchEvents(),
    ]);
    setLoading(false);
  }, [fetchSessions, fetchEvents]);

  /**
   * Filter sessions by status
   */
  const filterByStatus = useCallback((status) => {
    const filtered = { grouped: {}, guests: [], total: 0 };
    
    // Filter grouped sessions
    Object.entries(sessions.grouped).forEach(([userId, userSessions]) => {
      const filteredSessions = userSessions.filter(s => s.status === status);
      if (filteredSessions.length > 0) {
        filtered.grouped[userId] = filteredSessions;
        filtered.total += filteredSessions.length;
      }
    });
    
    // Filter guest sessions
    filtered.guests = sessions.guests.filter(s => s.status === status);
    filtered.total += filtered.guests.length;
    
    return filtered;
  }, [sessions]);

  /**
   * Get session statistics
   */
  const getStats = useCallback(() => {
    let active = 0;
    let idle = 0;
    let inactive = 0;
    let total = 0;
    
    // Count grouped sessions
    Object.values(sessions.grouped).forEach(userSessions => {
      userSessions.forEach(session => {
        total++;
        if (session.status === 'active') active++;
        else if (session.status === 'idle') idle++;
        else if (session.status === 'inactive') inactive++;
      });
    });
    
    // Count guest sessions
    sessions.guests.forEach(session => {
      total++;
      if (session.status === 'active') active++;
      else if (session.status === 'idle') idle++;
      else if (session.status === 'inactive') inactive++;
    });
    
    return { active, idle, inactive, total };
  }, [sessions]);

  // Handle tab visibility changes for smart polling
  useEffect(() => {
    if (connectionMode === 'polling' && pollIntervalRef.current) {
      // Restart polling when tab becomes visible to sync immediately
      if (isTabVisible) {
        // Immediate sync when tab becomes visible
        fetchSessions();
        fetchEvents();
      }
    }
  }, [isTabVisible, connectionMode, fetchSessions, fetchEvents]);

  // Initialize connection based on mode
  useEffect(() => {
    setLoading(true);
    
    // Initial fetch
    Promise.all([
      fetchSessions(),
      fetchEvents(),
    ]).then(() => {
      setLoading(false);
      
      // Start connection based on mode
      if (connectionMode === 'polling') {
        startPolling();
      } else if (connectionMode === 'push') {
        startEventSource();
      }
    });
    
    // Cleanup
    return () => {
      stopPolling();
      stopEventSource();
    };
  }, []); // Only run on mount

  return {
    // Data
    sessions,
    events,
    loading,
    error,
    
    // Connection
    connectionMode,
    changeMode,
    
    // Actions
    refresh,
    createSimulatedSession,
    removeSimulatedSessions,
    getSimulatedSessions,
    
    // Utilities
    filterByStatus,
    getStats,
  };
}