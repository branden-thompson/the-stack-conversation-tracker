/**
 * useCards Hook
 * 
 * React Query-powered cards management with fallback to legacy implementation.
 * Legacy code moved to /deprecated after successful React Query migration.
 */

import { getSafetySwitch } from '@/lib/utils/safety-switches';
import { useCards as useCardsQuery } from './useCardsQuery';

/**
 * Main useCards hook with React Query implementation
 */
export function useCards() {
  // Use React Query version (primary) - import at top level for ESM compatibility
  return useCardsQuery();
}