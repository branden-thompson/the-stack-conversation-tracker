/**
 * useSessionEmitter Hook
 * Emit user tracking events and manage session lifecycle
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import sessionTracker from '@/lib/services/session-tracker';
import { SESSION_EVENT_TYPES } from '@/lib/utils/session-constants';

export function useSessionEmitter(user = null, options = {}) {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const sessionRef = useRef(null);
  const isInitializedRef = useRef(false);

  /**
   * Start session for current user
   */
  const startSession = useCallback(async () => {
    if (!user) return null;
    
    const userType = user.isGuest ? 'guest' : 'registered';
    const session = await sessionTracker.startSession(user.id, userType);
    sessionRef.current = session;
    
    // Also create session on server
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userType,
          browser: session.browser,
          metadata: {
            userName: user.name,
            route: pathname,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to create server session:', error);
    }
    
    return session;
  }, [user, pathname]);

  /**
   * End current session
   */
  const endSession = useCallback(async () => {
    const session = await sessionTracker.endSession();
    
    // Also end session on server
    if (session) {
      try {
        await fetch(`/api/sessions?id=${session.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to end server session:', error);
      }
    }
    
    sessionRef.current = null;
    return session;
  }, []);

  /**
   * Emit a tracking event
   */
  const emit = useCallback((type, metadata = {}) => {
    if (!sessionRef.current) return;
    
    return sessionTracker.emitEvent(type, {
      ...metadata,
      userId: user?.id,
      userName: user?.name,
    });
  }, [user]);

  /**
   * Emit navigation event
   */
  const emitNavigation = useCallback((from, to) => {
    emit(SESSION_EVENT_TYPES.ROUTE_CHANGE, {
      from,
      to,
    });
    sessionTracker.updateRoute(to);
  }, [emit]);

  /**
   * Emit card event
   */
  const emitCardEvent = useCallback((type, cardData) => {
    const eventType = {
      created: SESSION_EVENT_TYPES.CARD_CREATED,
      updated: SESSION_EVENT_TYPES.CARD_UPDATED,
      deleted: SESSION_EVENT_TYPES.CARD_DELETED,
      moved: SESSION_EVENT_TYPES.CARD_MOVED,
      flipped: SESSION_EVENT_TYPES.CARD_FLIPPED,
    }[type];
    
    if (eventType) {
      emit(eventType, cardData);
    }
  }, [emit]);

  /**
   * Emit UI interaction event
   */
  const emitUIEvent = useCallback((type, metadata = {}) => {
    const eventType = {
      dialogOpen: SESSION_EVENT_TYPES.DIALOG_OPENED,
      dialogClose: SESSION_EVENT_TYPES.DIALOG_CLOSED,
      trayOpen: SESSION_EVENT_TYPES.TRAY_OPENED,
      trayClose: SESSION_EVENT_TYPES.TRAY_CLOSED,
      buttonClick: SESSION_EVENT_TYPES.BUTTON_CLICKED,
    }[type];
    
    if (eventType) {
      emit(eventType, metadata);
    }
  }, [emit]);

  /**
   * Emit test event
   */
  const emitTestEvent = useCallback((type, metadata = {}) => {
    const eventType = {
      run: SESSION_EVENT_TYPES.TEST_RUN,
      view: SESSION_EVENT_TYPES.TEST_VIEW,
      coverage: SESSION_EVENT_TYPES.COVERAGE_VIEW,
    }[type];
    
    if (eventType) {
      emit(eventType, metadata);
    }
  }, [emit]);

  /**
   * Emit preference change event
   */
  const emitPreferenceEvent = useCallback((type, metadata = {}) => {
    const eventType = {
      theme: SESSION_EVENT_TYPES.THEME_CHANGED,
      animation: SESSION_EVENT_TYPES.ANIMATION_TOGGLED,
      preference: SESSION_EVENT_TYPES.PREFERENCE_UPDATED,
    }[type];
    
    if (eventType) {
      emit(eventType, metadata);
    }
  }, [emit]);

  // Initialize session when user changes
  useEffect(() => {
    console.log('[SessionEmitter] User changed:', user?.id, user?.name);
    
    if (!user) {
      // End session if user is cleared
      if (sessionRef.current) {
        console.log('[SessionEmitter] Ending session - no user');
        endSession();
      }
      return;
    }
    
    // Start new session if user changed
    if (!isInitializedRef.current || sessionRef.current?.userId !== user.id) {
      console.log('[SessionEmitter] Starting session for user:', user.id);
      // End previous session if exists
      if (sessionRef.current) {
        endSession().then(() => {
          startSession();
        });
      } else {
        startSession();
      }
      isInitializedRef.current = true;
    }
  }, [user, startSession, endSession]);

  // Track route changes
  useEffect(() => {
    if (pathname !== previousPathnameRef.current) {
      if (previousPathnameRef.current && sessionRef.current) {
        emitNavigation(previousPathnameRef.current, pathname);
      } else if (sessionRef.current) {
        // Initial page view
        emit(SESSION_EVENT_TYPES.PAGE_VIEW, {
          route: pathname,
        });
      }
      previousPathnameRef.current = pathname;
    }
  }, [pathname, emit, emitNavigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        endSession();
      }
    };
  }, []);

  return {
    // Session management
    session: sessionRef.current,
    startSession,
    endSession,
    
    // Event emitters
    emit,
    emitNavigation,
    emitCardEvent,
    emitUIEvent,
    emitTestEvent,
    emitPreferenceEvent,
    
    // Utilities
    getCurrentSession: () => sessionTracker.getCurrentSession(),
    updateConfig: (config) => sessionTracker.updateConfig(config),
  };
}