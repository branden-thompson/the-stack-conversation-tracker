/**
 * useConversations Hook
 * 
 * React Query-powered conversations management with fallback to legacy implementation.
 * Legacy code moved to /deprecated after successful React Query migration.
 */

import { getSafetySwitch } from '@/lib/utils/safety-switches';

/**
 * Main useConversations hook with React Query implementation
 */
export function useConversations() {
  // Use non-hook version to avoid conditional hook calls
  const useReactQuery = getSafetySwitch('reactQuery');
  
  if (useReactQuery) {
    // Use React Query version (primary)
    const { useConversations: useConversationsQuery } = require('./useConversationsQuery');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConversationsQuery();
  } else {
    // Fallback to legacy version if needed
    const { useConversationsLegacy } = require('./deprecated/useConversationsLegacy');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useConversationsLegacy();
  }
}