/**
 * useButtonTracking Hook
 * Global button click tracking via event delegation
 */

'use client';

import { useEffect } from 'react';
import { useGlobalSession } from '@/lib/contexts/GlobalSessionProvider';

export function useButtonTracking() {
  const { emitUIEvent } = useGlobalSession();
  
  useEffect(() => {
    if (!emitUIEvent) return;
    
    const handleButtonClick = (e) => {
      // Check if click was on a button or within a button
      const button = e.target.closest('button');
      if (!button) return;
      
      // Don't track if button is disabled
      if (button.disabled) return;
      
      // Don't track if it's already being tracked (has data-tracked attribute)
      if (button.dataset.tracked) return;
      
      // Extract button info for tracking
      const label = button.getAttribute('aria-label') || 
                   button.getAttribute('title') || 
                   button.textContent?.trim() || 
                   'button';
      
      const variant = button.className.includes('destructive') ? 'destructive' :
                     button.className.includes('outline') ? 'outline' :
                     button.className.includes('ghost') ? 'ghost' :
                     button.className.includes('secondary') ? 'secondary' :
                     'default';
      
      // Emit tracking event
      emitUIEvent('buttonClick', {
        label: label.substring(0, 50), // Truncate long labels
        variant,
        hasIcon: button.querySelector('svg') !== null,
        className: button.className.substring(0, 100), // Truncate long class names
      });
    };
    
    // Add event listener with capture to catch all clicks
    document.addEventListener('click', handleButtonClick, true);
    
    return () => {
      document.removeEventListener('click', handleButtonClick, true);
    };
  }, [emitUIEvent]);
}