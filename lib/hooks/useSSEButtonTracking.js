/**
 * SSE Button Tracking Hook
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 2 UI INTEGRATION
 * Enhanced button tracking with SSE event emission and fallback
 * 
 * Features:
 * - Real-time button click tracking via SSE
 * - Fallback to local tracking when SSE unavailable
 * - Performance optimization with debouncing
 * - Analytics consolidation
 * - Emergency response integration
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSSEConnection } from './useSSEConnection';
import { useGlobalSession } from '@/lib/contexts/GlobalSessionProvider';

/**
 * SSE Button Tracking Configuration
 */
const TRACKING_CONFIG = {
  debounceDelay: 100, // ms between duplicate events
  maxLabelLength: 50,
  maxClassNameLength: 100,
  excludeClasses: ['no-track', 'tracking-disabled'],
  rateLimitWindow: 1000, // ms
  maxEventsPerWindow: 10
};

/**
 * SSE Enhanced Button Tracking Hook
 */
export function useSSEButtonTracking() {
  const { currentSession, emitUIEvent } = useGlobalSession();
  const lastEventRef = useRef(null);
  const eventCountRef = useRef(0);
  const windowStartRef = useRef(Date.now());
  
  const { 
    isConnected, 
    isFallback, 
    emit: emitSSE,
    connectionState 
  } = useSSEConnection({ 
    sessionId: currentSession?.sessionId,
    userId: currentSession?.userId,
    autoConnect: true
  });

  /**
   * Rate limiting check
   */
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    
    // Reset window if needed
    if (now - windowStartRef.current > TRACKING_CONFIG.rateLimitWindow) {
      eventCountRef.current = 0;
      windowStartRef.current = now;
    }
    
    // Check if we're over the limit
    if (eventCountRef.current >= TRACKING_CONFIG.maxEventsPerWindow) {
      return false;
    }
    
    eventCountRef.current++;
    return true;
  }, []);

  /**
   * Debounce duplicate events
   */
  const isDuplicateEvent = useCallback((eventData) => {
    const now = Date.now();
    const lastEvent = lastEventRef.current;
    
    if (!lastEvent) return false;
    
    // Check if this is a duplicate within debounce window
    if (now - lastEvent.timestamp < TRACKING_CONFIG.debounceDelay &&
        lastEvent.label === eventData.label &&
        lastEvent.variant === eventData.variant) {
      return true;
    }
    
    return false;
  }, []);

  /**
   * Extract button information for tracking
   */
  const extractButtonInfo = useCallback((button) => {
    // Extract label
    const label = button.getAttribute('aria-label') || 
                 button.getAttribute('title') || 
                 button.textContent?.trim() || 
                 'button';

    // Extract variant from className
    const variant = button.className.includes('destructive') ? 'destructive' :
                   button.className.includes('outline') ? 'outline' :
                   button.className.includes('ghost') ? 'ghost' :
                   button.className.includes('secondary') ? 'secondary' :
                   'default';

    // Extract additional metadata
    const metadata = {
      hasIcon: button.querySelector('svg') !== null,
      className: button.className.substring(0, TRACKING_CONFIG.maxClassNameLength),
      position: {
        x: button.offsetLeft,
        y: button.offsetTop
      },
      size: {
        width: button.offsetWidth,
        height: button.offsetHeight
      },
      disabled: button.disabled,
      type: button.type || 'button'
    };

    // Check for custom tracking attributes
    if (button.dataset.trackingLabel) {
      metadata.customLabel = button.dataset.trackingLabel;
    }
    
    if (button.dataset.trackingMetadata) {
      try {
        const customMetadata = JSON.parse(button.dataset.trackingMetadata);
        Object.assign(metadata, customMetadata);
      } catch (error) {
        console.warn('Invalid tracking metadata JSON:', button.dataset.trackingMetadata);
      }
    }

    return {
      label: label.substring(0, TRACKING_CONFIG.maxLabelLength),
      variant,
      metadata
    };
  }, []);

  /**
   * Emit button click event via SSE
   */
  const emitButtonClickSSE = useCallback(async (buttonInfo) => {
    try {
      const eventData = {
        eventType: 'ui.buttonClick',
        eventData: {
          buttonId: `btn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          componentName: 'button',
          interactionType: 'click',
          ...buttonInfo
        }
      };

      const result = await emitSSE(eventData);
      
      if (result.success) {
        console.log(`Button click tracked via SSE: ${buttonInfo.label}`);
        return { success: true, method: 'sse' };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.warn('SSE button tracking failed:', error.message);
      return { success: false, error: error.message };
    }
  }, [emitSSE]);

  /**
   * Fallback button tracking via GlobalSession
   */
  const emitButtonClickFallback = useCallback((buttonInfo) => {
    if (emitUIEvent) {
      emitUIEvent('buttonClick', {
        label: buttonInfo.label,
        variant: buttonInfo.variant,
        ...buttonInfo.metadata
      });
      console.log(`Button click tracked via fallback: ${buttonInfo.label}`);
      return { success: true, method: 'fallback' };
    }
    return { success: false, error: 'No fallback available' };
  }, [emitUIEvent]);

  /**
   * Main button click handler
   */
  const handleButtonClick = useCallback(async (e) => {
    // Find the button element
    const button = e.target.closest('button');
    if (!button) return;

    // Skip disabled buttons
    if (button.disabled) return;

    // Skip buttons with excluded classes
    const hasExcludedClass = TRACKING_CONFIG.excludeClasses.some(className => 
      button.classList.contains(className)
    );
    if (hasExcludedClass) return;

    // Skip if already being tracked explicitly
    if (button.dataset.tracked) return;

    // Check rate limiting
    if (!checkRateLimit()) {
      console.warn('Button tracking rate limit exceeded');
      return;
    }

    // Extract button information
    const buttonInfo = extractButtonInfo(button);

    // Check for duplicate events
    if (isDuplicateEvent(buttonInfo)) {
      return;
    }

    // Update last event reference
    lastEventRef.current = {
      ...buttonInfo,
      timestamp: Date.now()
    };

    try {
      let result;

      // Try SSE first if connected
      if (isConnected) {
        result = await emitButtonClickSSE(buttonInfo);
        
        // Fall back if SSE fails
        if (!result.success) {
          result = emitButtonClickFallback(buttonInfo);
        }
      } else {
        // Use fallback if SSE not connected
        result = emitButtonClickFallback(buttonInfo);
      }

      // Log tracking result
      if (result.success) {
        console.log(`Button tracking successful via ${result.method}: ${buttonInfo.label}`);
      } else {
        console.error('Button tracking failed:', result.error);
      }

    } catch (error) {
      console.error('Button tracking error:', error);
    }
  }, [isConnected, checkRateLimit, isDuplicateEvent, extractButtonInfo, emitButtonClickSSE, emitButtonClickFallback]);

  /**
   * Set up global button tracking
   */
  useEffect(() => {
    if (!currentSession?.sessionId) return;

    // Add global click listener with capture
    document.addEventListener('click', handleButtonClick, true);

    console.log(`SSE button tracking initialized (SSE: ${isConnected ? 'connected' : 'fallback'})`);

    return () => {
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [currentSession?.sessionId, handleButtonClick, isConnected]);

  /**
   * Monitor SSE connection changes
   */
  useEffect(() => {
    console.log(`Button tracking SSE connection: ${connectionState}`);
  }, [connectionState]);

  return {
    // Connection status
    isSSEConnected: isConnected,
    isFallbackMode: isFallback,
    connectionState,
    
    // Tracking status
    isTracking: !!currentSession?.sessionId,
    trackingMethod: isConnected ? 'sse' : 'fallback',
    
    // Manual tracking functions
    trackButtonClick: handleButtonClick,
    
    // Statistics
    eventCount: eventCountRef.current,
    lastTrackedEvent: lastEventRef.current
  };
}

/**
 * Enhanced TrackedButton Hook
 * For buttons that need explicit tracking with SSE
 */
export function useSSETrackedButton({ 
  trackingLabel, 
  trackingMetadata = {},
  disabled = false 
}) {
  const { isSSEConnected, trackButtonClick } = useSSEButtonTracking();
  
  const handleClick = useCallback((e) => {
    if (disabled) return;
    
    // Create synthetic button for tracking
    const syntheticButton = {
      getAttribute: (attr) => {
        if (attr === 'aria-label') return trackingLabel;
        return null;
      },
      querySelector: () => null,
      className: trackingMetadata.variant || 'default',
      textContent: trackingLabel,
      disabled,
      dataset: {
        trackingLabel,
        trackingMetadata: JSON.stringify(trackingMetadata)
      },
      offsetLeft: 0,
      offsetTop: 0,
      offsetWidth: 0,
      offsetHeight: 0,
      type: 'button'
    };

    // Create synthetic event
    const syntheticEvent = {
      target: {
        closest: () => syntheticButton
      }
    };

    trackButtonClick(syntheticEvent);
  }, [disabled, trackingLabel, trackingMetadata, trackButtonClick]);

  return {
    handleClick,
    isSSEConnected,
    trackingEnabled: !disabled
  };
}