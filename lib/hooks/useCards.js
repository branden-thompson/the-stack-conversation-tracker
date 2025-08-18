/**
 * useCards Hook
 * 
 * React Query-powered cards management with fallback to legacy implementation.
 * Legacy code moved to /deprecated after successful React Query migration.
 */

import { getSafetySwitch } from '@/lib/utils/safety-switches';

/**
 * Main useCards hook with React Query implementation
 */
export function useCards() {
  // Use non-hook version to avoid conditional hook calls
  const useReactQuery = getSafetySwitch('reactQuery');
  
  if (useReactQuery) {
    // Use React Query version (primary)
    const { useCards: useCardsQuery } = require('./useCardsQuery');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCardsQuery();
  } else {
    // Fallback to legacy version if needed
    const { useCardsLegacy } = require('./deprecated/useCardsLegacy');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCardsLegacy();
  }
}