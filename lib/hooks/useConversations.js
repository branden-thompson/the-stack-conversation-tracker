/**
 * useConversations Hook
 * 
 * React Query-powered conversations management with fallback to legacy implementation.
 * Legacy code moved to /deprecated after successful React Query migration.
 */

import { getSafetySwitch } from '@/lib/utils/safety-switches';
import { useConversations as useConversationsQuery } from './useConversationsQuery';

/**
 * Main useConversations hook with React Query implementation
 */
export function useConversations() {
  // Use React Query version (primary) - import at top level for ESM compatibility
  return useConversationsQuery();
}