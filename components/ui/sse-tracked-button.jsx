/**
 * SSE Tracked Button Component
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | PHASE 2 UI INTEGRATION
 * Enhanced button with SSE tracking and fallback support
 * 
 * Features:
 * - Real-time click tracking via SSE
 * - Automatic fallback to local tracking
 * - Custom tracking metadata
 * - Performance optimization
 * - Visual tracking indicators (dev mode)
 */

'use client';

import * as React from "react";
import { Button } from "./button";
import { useSSETrackedButton } from "@/lib/hooks/useSSEButtonTracking";

export function SSETrackedButton({
  onClick,
  children,
  trackingLabel,
  trackingMetadata = {},
  disabled,
  showTrackingIndicator = false, // Dev mode indicator
  ...props
}) {
  const { 
    handleClick: handleSSETracking, 
    isSSEConnected,
    trackingEnabled 
  } = useSSETrackedButton({
    trackingLabel: trackingLabel || children?.toString() || 'button',
    trackingMetadata,
    disabled
  });

  const handleClick = React.useCallback((e) => {
    // Don't track if button is disabled
    if (disabled) return;

    // Emit SSE tracking event
    if (trackingEnabled) {
      handleSSETracking(e);
    }

    // Call original onClick handler
    if (onClick) {
      onClick(e);
    }
  }, [onClick, handleSSETracking, trackingEnabled, disabled]);

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      data-tracked="sse" // Mark as SSE tracked
      data-sse-connected={isSSEConnected ? "true" : "false"}
      className={`${props.className || ''} ${showTrackingIndicator ? 'sse-tracked' : ''}`.trim()}
      {...props}
    >
      {children}
      {showTrackingIndicator && (
        <span 
          className={`inline-block w-2 h-2 rounded-full ml-2 ${
            isSSEConnected ? 'bg-green-400' : 'bg-orange-400'
          }`}
          title={`Tracking: ${isSSEConnected ? 'SSE' : 'Fallback'}`}
        />
      )}
    </Button>
  );
}

/**
 * Legacy TrackedButton with SSE enhancement
 * Drop-in replacement for existing TrackedButton components
 */
export function EnhancedTrackedButton({
  onClick,
  children,
  trackingLabel,
  trackingMetadata = {},
  disabled,
  ...props
}) {
  return (
    <SSETrackedButton
      onClick={onClick}
      trackingLabel={trackingLabel}
      trackingMetadata={trackingMetadata}
      disabled={disabled}
      {...props}
    >
      {children}
    </SSETrackedButton>
  );
}