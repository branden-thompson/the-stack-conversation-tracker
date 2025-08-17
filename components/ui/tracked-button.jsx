/**
 * TrackedButton Component
 * Enhanced button that automatically tracks click events
 */

'use client';

import * as React from "react";
import { Button } from "./button";
import { useGlobalSession } from "@/lib/contexts/GlobalSessionProvider";

export function TrackedButton({
  onClick,
  children,
  trackingLabel,
  trackingMetadata = {},
  disabled,
  ...props
}) {
  const { emitUIEvent } = useGlobalSession();
  
  const handleClick = React.useCallback((e) => {
    // Don't track if button is disabled
    if (disabled) return;
    
    // Emit tracking event
    if (emitUIEvent) {
      emitUIEvent('buttonClick', {
        label: trackingLabel || children?.toString() || 'button',
        ...trackingMetadata
      });
    }
    
    // Call original onClick handler
    if (onClick) {
      onClick(e);
    }
  }, [onClick, emitUIEvent, trackingLabel, children, trackingMetadata, disabled]);
  
  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
}