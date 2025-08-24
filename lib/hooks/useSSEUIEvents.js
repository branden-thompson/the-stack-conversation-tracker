/**
 * SSE UI Events Hook
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 2 UI CONSOLIDATION
 * Unified UI event system with SSE broadcasting and fallback support
 * 
 * Features:
 * - Centralized UI event management
 * - Real-time cross-tab synchronization
 * - Dialog and tray state synchronization
 * - Button tracking consolidation
 * - Theme change broadcasting
 * - Performance optimization
 */

'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useSSEConnection } from './useSSEConnection';
import { useGlobalSession } from '@/lib/contexts/GlobalSessionProvider';

/**
 * UI Event Types and Configuration
 */
export const UI_EVENT_TYPES = {
  // Dialog events
  DIALOG_OPEN: 'ui.dialogOpen',
  DIALOG_CLOSE: 'ui.dialogClose',
  
  // Tray events
  TRAY_OPEN: 'ui.trayOpen',
  TRAY_CLOSE: 'ui.trayClose',
  
  // Theme events
  THEME_CHANGED: 'ui.themeChanged',
  
  // Button tracking
  BUTTON_CLICK: 'ui.buttonClick',
  
  // Generic UI interactions
  HOVER: 'ui.hover',
  FOCUS: 'ui.focus'
};

const EVENT_CONFIG = {
  // Which events should be broadcast to other tabs
  BROADCAST_EVENTS: [
    UI_EVENT_TYPES.DIALOG_OPEN,
    UI_EVENT_TYPES.DIALOG_CLOSE,
    UI_EVENT_TYPES.TRAY_OPEN,
    UI_EVENT_TYPES.TRAY_CLOSE,
    UI_EVENT_TYPES.THEME_CHANGED
  ],
  
  // Which events should be persisted
  PERSISTENT_EVENTS: [
    UI_EVENT_TYPES.THEME_CHANGED
  ],
  
  // Rate limiting per event type (events per minute)
  RATE_LIMITS: {
    [UI_EVENT_TYPES.BUTTON_CLICK]: 1000,
    [UI_EVENT_TYPES.THEME_CHANGED]: 20,
    [UI_EVENT_TYPES.DIALOG_OPEN]: 100,
    [UI_EVENT_TYPES.DIALOG_CLOSE]: 100,
    [UI_EVENT_TYPES.TRAY_OPEN]: 100,
    [UI_EVENT_TYPES.TRAY_CLOSE]: 100,
    [UI_EVENT_TYPES.HOVER]: 500,
    [UI_EVENT_TYPES.FOCUS]: 300
  }
};

/**
 * SSE UI Events Hook
 */
export function useSSEUIEvents() {
  const { currentSession, emitUIEvent } = useGlobalSession();
  const [eventStats, setEventStats] = useState({
    emitted: 0,
    received: 0,
    failed: 0,
    lastEvent: null
  });

  const { 
    isConnected, 
    isFallback, 
    subscribe, 
    emit: emitSSE,
    connectionState 
  } = useSSEConnection({ 
    sessionId: currentSession?.sessionId,
    userId: currentSession?.userId,
    autoConnect: true
  });

  /**
   * Emit UI event with SSE and fallback support
   */
  const emitUIEventSSE = useCallback(async (eventType, eventData = {}) => {
    if (!Object.values(UI_EVENT_TYPES).includes(eventType)) {
      console.warn(`Unknown UI event type: ${eventType}`);
      return { success: false, error: 'Unknown event type' };
    }

    try {
      let result = { success: false };
      const timestamp = Date.now();

      // Prepare event payload
      const payload = {
        eventType,
        eventData: {
          ...eventData,
          timestamp,
          tabId: typeof window !== 'undefined' ? window.performance?.timeOrigin || Date.now() : Date.now()
        }
      };

      // Try SSE first if connected
      if (isConnected) {
        result = await emitSSE(payload);
        
        if (result.success) {
          console.log(`UI event emitted via SSE: ${eventType}`);
          
          setEventStats(prev => ({
            ...prev,
            emitted: prev.emitted + 1,
            lastEvent: { type: eventType, method: 'sse', timestamp }
          }));
          
          return { ...result, method: 'sse' };
        } else {
          console.warn(`SSE emission failed for ${eventType}:`, result.error);
        }
      }

      // Fallback to GlobalSession
      if (emitUIEvent) {
        emitUIEvent(eventType.replace('ui.', ''), eventData);
        
        setEventStats(prev => ({
          ...prev,
          emitted: prev.emitted + 1,
          lastEvent: { type: eventType, method: 'fallback', timestamp }
        }));
        
        return { success: true, method: 'fallback' };
      }

      // No fallback available
      setEventStats(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));
      
      return { success: false, error: 'No emission method available' };

    } catch (error) {
      console.error(`UI event emission error for ${eventType}:`, error);
      
      setEventStats(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));
      
      return { success: false, error: error.message };
    }
  }, [isConnected, emitSSE, emitUIEvent]);

  /**
   * Dialog state management
   */
  const openDialog = useCallback(async (dialogType, metadata = {}) => {
    return await emitUIEventSSE(UI_EVENT_TYPES.DIALOG_OPEN, {
      dialogType,
      ...metadata
    });
  }, [emitUIEventSSE]);

  const closeDialog = useCallback(async (dialogType, metadata = {}) => {
    return await emitUIEventSSE(UI_EVENT_TYPES.DIALOG_CLOSE, {
      dialogType,
      ...metadata
    });
  }, [emitUIEventSSE]);

  /**
   * Tray state management
   */
  const openTray = useCallback(async (trayType, metadata = {}) => {
    return await emitUIEventSSE(UI_EVENT_TYPES.TRAY_OPEN, {
      trayType,
      ...metadata
    });
  }, [emitUIEventSSE]);

  const closeTray = useCallback(async (trayType, metadata = {}) => {
    return await emitUIEventSSE(UI_EVENT_TYPES.TRAY_CLOSE, {
      trayType,
      ...metadata
    });
  }, [emitUIEventSSE]);

  /**
   * Theme change management
   */
  const changeTheme = useCallback(async (theme, metadata = {}) => {
    return await emitUIEventSSE(UI_EVENT_TYPES.THEME_CHANGED, {
      theme,
      ...metadata
    });
  }, [emitUIEventSSE]);

  /**
   * Button tracking
   */
  const trackButton = useCallback(async (buttonData) => {
    return await emitUIEventSSE(UI_EVENT_TYPES.BUTTON_CLICK, buttonData);
  }, [emitUIEventSSE]);

  /**
   * Generic UI interaction tracking
   */
  const trackInteraction = useCallback(async (interactionType, componentName, metadata = {}) => {
    const eventType = interactionType === 'hover' ? UI_EVENT_TYPES.HOVER :
                     interactionType === 'focus' ? UI_EVENT_TYPES.FOCUS :
                     UI_EVENT_TYPES.BUTTON_CLICK;

    return await emitUIEventSSE(eventType, {
      componentName,
      interactionType,
      ...metadata
    });
  }, [emitUIEventSSE]);

  /**
   * Handle incoming UI events from other tabs
   */
  const handleIncomingUIEvent = useCallback((eventData) => {
    const { eventType, eventData: data } = eventData;
    
    // Ignore our own events
    const tabId = typeof window !== 'undefined' ? window.performance?.timeOrigin || Date.now() : Date.now();
    if (data?.tabId === tabId) {
      return;
    }

    console.log(`Received UI event from SSE: ${eventType}`, data);
    
    setEventStats(prev => ({
      ...prev,
      received: prev.received + 1,
      lastEvent: { type: eventType, method: 'received', timestamp: Date.now() }
    }));

    // Dispatch custom events for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`sse-${eventType}`, {
        detail: { eventType, eventData: data }
      }));
    }
  }, []);

  /**
   * Subscribe to UI events
   */
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeList = Object.values(UI_EVENT_TYPES).map(eventType => 
      subscribe(eventType, handleIncomingUIEvent)
    );

    return () => {
      unsubscribeList.forEach(unsubscribe => unsubscribe());
    };
  }, [isConnected, subscribe, handleIncomingUIEvent]);

  /**
   * Monitor connection state changes
   */
  useEffect(() => {
    console.log(`UI Events SSE connection: ${connectionState}`);
  }, [connectionState]);

  return {
    // Connection status
    isSSEConnected: isConnected,
    isFallbackMode: isFallback,
    connectionState,
    
    // Event emission
    emitUIEvent: emitUIEventSSE,
    
    // Specialized event handlers
    openDialog,
    closeDialog,
    openTray,
    closeTray,
    changeTheme,
    trackButton,
    trackInteraction,
    
    // Statistics
    eventStats,
    
    // Configuration
    eventTypes: UI_EVENT_TYPES,
    canBroadcast: isConnected || isFallback,
    broadcastMethod: isConnected ? 'sse' : 'fallback'
  };
}

/**
 * React hook for listening to specific UI events
 */
export function useUIEventListener(eventType, handler, dependencies = []) {
  // Create stable dependency array to avoid spread element warning
  const stableDeps = useMemo(() => dependencies, [dependencies]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const eventName = `sse-${eventType}`;
    const wrappedHandler = (event) => {
      handler(event.detail);
    };
    
    window.addEventListener(eventName, wrappedHandler);
    
    return () => {
      window.removeEventListener(eventName, wrappedHandler);
    };
  }, [eventType, handler, stableDeps]);
}

/**
 * Hook for dialog state synchronization
 */
export function useDialogSync(dialogType) {
  const [isOpen, setIsOpen] = useState(false);
  const { openDialog, closeDialog } = useSSEUIEvents();
  
  // Listen for dialog events
  useUIEventListener(UI_EVENT_TYPES.DIALOG_OPEN, (data) => {
    if (data.eventData?.dialogType === dialogType) {
      setIsOpen(true);
    }
  }, [dialogType]);
  
  useUIEventListener(UI_EVENT_TYPES.DIALOG_CLOSE, (data) => {
    if (data.eventData?.dialogType === dialogType) {
      setIsOpen(false);
    }
  }, [dialogType]);
  
  return {
    isOpen,
    openDialog: (metadata) => openDialog(dialogType, metadata),
    closeDialog: (metadata) => closeDialog(dialogType, metadata)
  };
}

/**
 * Hook for tray state synchronization
 */
export function useTraySync(trayType) {
  const [isOpen, setIsOpen] = useState(false);
  const { openTray, closeTray } = useSSEUIEvents();
  
  // Listen for tray events
  useUIEventListener(UI_EVENT_TYPES.TRAY_OPEN, (data) => {
    if (data.eventData?.trayType === trayType) {
      setIsOpen(true);
    }
  }, [trayType]);
  
  useUIEventListener(UI_EVENT_TYPES.TRAY_CLOSE, (data) => {
    if (data.eventData?.trayType === trayType) {
      setIsOpen(false);
    }
  }, [trayType]);
  
  return {
    isOpen,
    openTray: (metadata) => openTray(trayType, metadata),
    closeTray: (metadata) => closeTray(trayType, metadata)
  };
}