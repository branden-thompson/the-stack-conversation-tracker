/**
 * useUserTracking Hook
 * 
 * React Query-powered user session tracking with fallback to legacy implementation.
 * Legacy code moved to /deprecated after successful React Query migration.
 */

'use client';

import { getSafetySwitch } from '@/lib/utils/safety-switches';

/**
 * Main useUserTracking hook with React Query migration
 */
export function useUserTracking(config = {}) {
  // Use non-hook version to avoid conditional hook calls
  const useReactQuery = getSafetySwitch('reactQuery');
  
  if (useReactQuery) {
    // Use React Query version (primary)
    const { useUserTracking: useUserTrackingQuery } = require('./useUserTrackingQuery');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUserTrackingQuery(config);
  } else {
    // Fallback to legacy version if needed
    const { useUserTrackingLegacy } = require('./deprecated/useUserTrackingLegacy');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUserTrackingLegacy(config);
  }
}