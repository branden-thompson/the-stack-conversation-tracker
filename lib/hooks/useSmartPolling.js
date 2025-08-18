/**
 * useSmartPolling Hook
 * Generic hook for implementing smart polling with tab visibility and debouncing
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTabVisibility } from './useTabVisibility';

export function useSmartPolling(callback, interval = 5000, options = {}) {
  const {
    enabled = true,
    debounceMs = 100,
    syncOnVisible = true,
  } = options;

  const intervalRef = useRef(null);
  const debounceRef = useRef(null);
  const isTabVisible = useTabVisibility();

  // Debounced callback to prevent duplicate simultaneous calls
  const debouncedCallback = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (typeof callback === 'function') {
        callback();
      }
    }, debounceMs);
  }, [callback, debounceMs]);

  // Start polling
  const startPolling = useCallback(() => {
    if (!enabled || intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      // Only poll when tab is visible
      if (isTabVisible) {
        debouncedCallback();
      }
    }, interval);
  }, [enabled, interval, isTabVisible, debouncedCallback]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  // Handle tab visibility changes
  useEffect(() => {
    if (syncOnVisible && isTabVisible && enabled && intervalRef.current) {
      // Immediate sync when tab becomes visible
      debouncedCallback();
    }
  }, [isTabVisible, syncOnVisible, enabled, debouncedCallback]);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  return {
    isPolling: Boolean(intervalRef.current),
    isTabVisible,
    startPolling,
    stopPolling,
  };
}

export default useSmartPolling;