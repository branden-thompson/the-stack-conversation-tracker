/**
 * useUserTracking Hook
 * 
 * React Query-powered user session tracking with fallback to legacy implementation.
 * Legacy code moved to /deprecated after successful React Query migration.
 */

'use client';

import { getSafetySwitch } from '@/lib/utils/safety-switches';
import { useUserTracking as useUserTrackingQuery } from './useUserTrackingQuery';

/**
 * Main useUserTracking hook with React Query migration
 */
export function useUserTracking(config = {}) {
  // Use React Query version (primary) - import at top level for proper ESM support
  return useUserTrackingQuery(config);
}