# React Query Migration Implementation Plan

## Overview

This document outlines the implementation plan for migrating the conversation tracker application from custom data fetching hooks to React Query, following the architectural analysis recommendations from 2025-08-18.

## Context

**Background**: Recent performance issues were caused by performance monitoring system interference, not fundamental architectural problems. The application's core architecture is solid but can benefit from React Query's built-in optimizations.

**Goals**: 
- Achieve 95% performance improvement through automatic request deduplication and caching
- Preserve all existing UI/UX functionality 
- Add safety switches and circuit breakers
- Support 10-25 concurrent users with minimal performance degradation

**Success Criteria**:
- All functionality preserved
- 50%+ reduction in duplicate API calls
- Maintain <200ms response times for critical operations
- Zero UI/UX changes visible to users

---

## Implementation Strategy

### **DATA FIRST Approach**
Following project standards, we'll implement and test data layer changes first, then ensure UI/UX capabilities remain intact.

### **Safeguards**
- Incremental migration (one hook at a time)
- Rollback capability at each step
- Comprehensive testing at each phase
- Emergency disable flags for quick fallback

### **Testing Strategy**
- Unit tests for each migrated hook
- Integration tests for API interactions  
- Manual testing of all card and conversation functionality
- Performance benchmarking before/after each phase

---

## Phase-by-Phase Implementation

### **Week 1: Foundation & Safety (Days 1-7)**

#### **Day 1-2: Safety Switches Implementation**
**Goal**: Add circuit breakers for all major systems

**Tasks**:
- [ ] Create `lib/utils/safety-switches.js` with component-level toggles
- [ ] Add environment variables for emergency disables
- [ ] Implement runtime safety controls
- [ ] Create dev page for safety switch management
- [ ] Test safety switches with all major components

**Files to Create/Modify**:
- `lib/utils/safety-switches.js` (new)
- `app/dev/safety/page.jsx` (new)
- `.env.local` (add safety flags)

#### **Day 3-4: React Query Setup**
**Goal**: Install and configure React Query foundation

**Tasks**:
- [ ] Install @tanstack/react-query and @tanstack/react-query-devtools
- [ ] Create QueryClient configuration with optimal settings
- [ ] Add QueryClientProvider to app root
- [ ] Configure React Query DevTools for development
- [ ] Create base query functions and error handlers

**Files to Create/Modify**:
- `package.json` (dependencies)
- `lib/providers/query-client.jsx` (new)
- `app/layout.js` (wrap with QueryClientProvider)
- `lib/utils/query-config.js` (new)

#### **Day 5-7: Testing & Documentation**
**Tasks**:
- [ ] Test React Query setup doesn't interfere with existing functionality
- [ ] Verify DevTools working properly
- [ ] Document new architecture patterns
- [ ] Create migration guide template

**Testing Focus**:
- All existing functionality works unchanged
- DevTools accessible in development
- No performance regressions introduced

---

### **Week 2: Conversations Migration (Days 8-14)**

#### **Day 8-9: Conversations Hook Migration**
**Goal**: Migrate `useConversations` to React Query while preserving global state benefits

**Current System Analysis**:
- Global state with listener broadcasting (lib/hooks/useConversations.js:~200 LOC)
- Request deduplication already implemented
- 100ms throttling and stale-while-revalidate pattern

**Migration Strategy**:
- Preserve the successful global state pattern
- Enhance with React Query's caching and invalidation
- Maintain existing broadcast listener system for real-time updates

**Tasks**:
- [ ] Create `lib/hooks/useConversationsQuery.js` 
- [ ] Implement React Query version with equivalent functionality
- [ ] Add proper query invalidation for CRUD operations
- [ ] Create mutation hooks for conversation operations
- [ ] Test against existing `useConversations` interface

**Files to Create/Modify**:
- `lib/hooks/useConversationsQuery.js` (new)
- `lib/api/conversations-api.js` (new - extract API functions)

#### **Day 10-12: Conversations Testing & Integration**
**Tasks**:
- [ ] A/B test new vs old hook with feature flag
- [ ] Test all conversation CRUD operations
- [ ] Test conversation timer and controls
- [ ] Test active conversation switching
- [ ] Performance benchmarking (API calls, response times)

**Key Test Areas**:
- Conversation creation, update, deletion
- Active conversation management
- Timer functionality and real-time updates
- Multiple component instances using same data

#### **Day 13-14: Conversations Rollout**
**Tasks**:
- [ ] Replace old hook with feature flag defaulting to React Query
- [ ] Monitor for any issues in dev environment
- [ ] Update related components if needed
- [ ] Document migration results

---

### **Week 3: Cards Migration (Days 15-21)**

#### **Day 15-16: Cards Hook Migration**
**Goal**: Migrate `useCards` to React Query and add optimistic updates

**Current System Analysis**:
- Traditional React hook without deduplication
- Direct API calls for CRUD operations
- Used heavily in drag-and-drop operations

**Migration Strategy**:
- Apply React Query caching and deduplication
- Add optimistic updates for immediate UI feedback
- Preserve existing card operation interfaces

**Tasks**:
- [ ] Create `lib/hooks/useCardsQuery.js`
- [ ] Implement card queries with proper cache keys
- [ ] Create mutation hooks for card CRUD operations
- [ ] Add optimistic updates for card creation, editing, movement
- [ ] Test drag-and-drop functionality preservation

**Files to Create/Modify**:
- `lib/hooks/useCardsQuery.js` (new)
- `lib/api/cards-api.js` (new)
- Update any components using `useCards` if interface changes

#### **Day 17-19: Cards Testing & Optimistic Updates**
**Tasks**:
- [ ] Test all card operations (create, edit, delete, move)
- [ ] Test drag-and-drop functionality thoroughly
- [ ] Test card flipping animations (critical - previously broken by monitoring)
- [ ] Test optimistic updates and rollback on errors
- [ ] Test multiple zones and card positioning

**Critical Test Areas**:
- Card drag-and-drop between zones
- Card flipping animation (ensure no interference)
- Multiple card operations in quick succession
- Error handling and optimistic update rollbacks

#### **Day 20-21: Cards Integration & Performance**
**Tasks**:
- [ ] Replace old cards hook with React Query version
- [ ] Performance testing and optimization
- [ ] Monitor for drag-and-drop performance impacts
- [ ] Document optimistic update patterns

---

### **Week 4: Users/Sessions & Final Optimization (Days 22-28)**

#### **Day 22-23: User Management Migration**
**Goal**: Migrate user tracking and session management to React Query

**Current System Analysis**:
- Complex user management with guest provisioning (useGuestUsers.js:831 LOC)
- Multiple polling loops for sessions and events
- Real-time active user tracking

**Migration Strategy**:
- Simplify polling with React Query intervals
- Consolidate multiple API calls where possible
- Preserve real-time user tracking capabilities

**Tasks**:
- [ ] Create `lib/hooks/useUsersQuery.js`
- [ ] Create `lib/hooks/useSessionsQuery.js`
- [ ] Implement smart polling with React Query intervals
- [ ] Migrate active users functionality
- [ ] Test user switching and session management

#### **Day 24-25: Final Integration Testing**
**Tasks**:
- [ ] End-to-end testing of all migrated systems
- [ ] Test user switching with conversation and card operations
- [ ] Test real-time updates across all systems
- [ ] Performance benchmarking of complete system
- [ ] Load testing with simulated concurrent users

#### **Day 26-28: Final Optimization & Documentation**
**Tasks**:
- [ ] Performance optimization based on benchmarks
- [ ] Final safety switch testing and configuration
- [ ] Complete migration documentation
- [ ] Create troubleshooting guide
- [ ] Update CLAUDE.md with new patterns

---

## Technical Implementation Details

### **React Query Configuration**
```javascript
// lib/providers/query-client.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### **Safety Switches Implementation**
```javascript
// lib/utils/safety-switches.js
export const SAFETY_SWITCHES = {
  reactQuery: process.env.NEXT_PUBLIC_USE_REACT_QUERY !== 'false',
  cardEvents: process.env.NEXT_PUBLIC_CARD_EVENTS_ENABLED !== 'false',
  userTracking: process.env.NEXT_PUBLIC_USER_TRACKING_ENABLED !== 'false',
  sessionEvents: process.env.NEXT_PUBLIC_SESSION_EVENTS_ENABLED !== 'false',
  conversationPolling: process.env.NEXT_PUBLIC_CONVERSATION_POLLING_ENABLED !== 'false',
};

export function useSafetySwitch(switchName) {
  return SAFETY_SWITCHES[switchName] ?? true;
}
```

### **Migration Pattern Example**
```javascript
// lib/hooks/useConversations.js
export function useConversations() {
  const useReactQuery = useSafetySwitch('reactQuery');
  
  if (useReactQuery) {
    return useConversationsQuery();
  } else {
    return useConversationsLegacy();
  }
}
```

---

## Risk Mitigation

### **Rollback Strategy**
- Environment variables to instantly disable React Query
- Keep legacy hooks as fallback during migration
- Feature flags for gradual rollout
- Monitoring alerts for performance regressions

### **Testing Strategy** 
- Unit tests for all new query hooks
- Integration tests for API interactions
- Manual testing of critical user workflows
- Performance regression testing
- Load testing with multiple concurrent users

### **Monitoring & Alerts**
- API response time monitoring
- Error rate tracking  
- Cache hit/miss ratios
- User experience metrics (card operations, page load times)

---

## Success Metrics

### **Performance Targets**
- **API Efficiency**: 50%+ reduction in duplicate API calls
- **Response Times**: Maintain <200ms for critical operations
- **Cache Performance**: 80%+ cache hit rate for repeated requests
- **Error Rate**: <1% increase during migration

### **Functionality Preservation**
- **Zero UI Changes**: All interfaces identical to users
- **Feature Parity**: 100% of current functionality preserved
- **Performance**: No regressions in drag-and-drop or real-time updates

### **Development Experience**
- **DevTools**: Comprehensive query debugging capabilities
- **Error Handling**: Improved error boundaries and recovery
- **Code Reduction**: 20%+ reduction in data fetching boilerplate

---

## Documentation Requirements

Following project standards, all changes will be documented in:

### **docs/project-hygiene/**
- `2025-08-18-react-query-migration-[phase].md` - Progress documentation for each phase
- Migration results and lessons learned
- Performance improvements achieved
- Any issues encountered and resolutions

### **docs/development/**
- Updated development practices for React Query patterns
- Query key conventions and best practices  
- Error handling and loading state patterns

### **CLAUDE.md Updates**
- New architectural patterns to remember
- React Query specific instructions and conventions
- Performance optimization patterns discovered

---

## Next Steps

1. **Get approval** for this implementation plan
2. **Start Week 1** with safety switches and React Query foundation
3. **Daily check-ins** to ensure progress and address any blockers
4. **Weekly reviews** to validate success criteria and adjust plan if needed

---

*Implementation plan created: 2025-08-18*  
*Following project standards: DATA FIRST, comprehensive testing, safeguards, documentation*

## AI Context

This migration follows the established project patterns:
- **DATA FIRST**: Implement data layer changes first, then verify UI capabilities
- **SAFEGUARDS**: Circuit breakers and rollback capabilities at each step  
- **TESTING**: Comprehensive testing before moving to next phase
- **DOCUMENTATION**: Document all changes in appropriate docs/ folders
- **INCREMENTAL**: One system at a time to minimize risk