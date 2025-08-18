/**
 * useTabVisibility Hook
 * Detects when the browser tab becomes visible/hidden for smart polling optimization
 */

'use client';

import { useState, useEffect } from 'react';

export function useTabVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Handle Page Visibility API
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Handle window focus/blur (fallback for older browsers)
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    // Check initial state
    setIsVisible(!document.hidden);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isVisible;
}

export default useTabVisibility;