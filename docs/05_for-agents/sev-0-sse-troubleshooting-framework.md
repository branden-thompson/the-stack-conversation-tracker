# SEV-0 SSE Troubleshooting Framework

**Purpose**: Emergency protocols and troubleshooting framework for Server-Sent Events (SSE) critical failures  
**Created**: 2025-08-20  
**Context**: Major system cleanup failure analysis  
**Classification**: SEV-0 Emergency Response Protocol

## SSE Critical Failure Recognition

### Immediate Escalation Triggers
- **Cross-tab synchronization broken**: Real-time features not updating across browser tabs
- **Event consumption failure**: Server broadcasting but client components not receiving events
- **Active Stackers non-functional**: User presence not syncing in real-time
- **Card operations not syncing**: Card flips, moves, creates not appearing in other tabs

### SEV-0 Classification Criteria for SSE
- Any SSE change affecting cross-tab real-time functionality
- Real-time infrastructure consolidation projects  
- EventSource connection or event consumption pipeline changes
- Performance optimizations touching SSE event delivery

## Emergency Response Protocol

### Phase 1: Immediate Assessment (First 15 minutes)
1. **STOP ALL IMPLEMENTATION** - Halt current work immediately
2. **Verify Baseline Functionality** - Test cross-tab sync in current state
3. **Identify Last Working Commit** - Find last known good state
4. **User Impact Assessment** - Document what functionality is broken

### Phase 2: Rapid Diagnosis (Next 15 minutes)
1. **Server-Side Test**: Verify SSE events being sent to clients
2. **Client-Side Test**: Verify EventSource receiving events
3. **Component Test**: Verify React components receiving SSE events
4. **Pipeline Isolation**: Identify where SSE → React bridge is broken

### Phase 3: Fix or Rollback Decision (15 minutes maximum)
- **If clear fix identified and testable within 30 minutes**: Proceed with single targeted fix
- **If root cause unclear or complex**: IMMEDIATE ROLLBACK to last working state
- **If multiple fixes needed**: IMMEDIATE ROLLBACK (architectural problem)
- **NO SCOPE CREEP**: Do not add features, complexity, or alternate systems

### Phase 4: User Communication and Documentation
- Report status and decision immediately
- Document technical findings for future reference  
- If rolling back: Preserve failed work for analysis in separate branch

## Diagnostic Checklist

### Server-Side SSE Health
- [ ] SSE endpoints responding with correct headers
- [ ] Events being generated for user actions (joins, leaves, card operations)
- [ ] EventSource connections being established
- [ ] Server logs showing events broadcast to connected clients

### Client-Side EventSource Health  
- [ ] `EventSource.readyState === 1` (OPEN)
- [ ] Network tab showing SSE connection active
- [ ] Console showing no connection errors
- [ ] Event listeners registered on EventSource

### React Integration Health
- [ ] SSE event handlers executing when events received
- [ ] React Query cache invalidations triggering
- [ ] Component re-renders occurring from SSE updates
- [ ] UI updates visible in cross-tab testing

### Cross-Tab Synchronization Test
- [ ] Open two tabs to same conversation
- [ ] Perform user action in Tab 1 (join/leave)
- [ ] Verify Tab 2 updates in real-time (within 2 seconds)
- [ ] Perform card action in Tab 1 (flip/move)
- [ ] Verify Tab 2 shows card change in real-time

## Common Failure Patterns

### 1. EventSource → React Pipeline Break
**Symptoms**: 
- EventSource connected (readyState === 1)
- No console errors
- Events not reaching React components

**Causes**:
- Event handler registration broken
- Event subscription management flawed
- React context/provider issues

### 2. Server Broadcasting but No Client Reception
**Symptoms**:
- Server logs showing events sent
- No events appearing in Network tab
- EventSource connection issues

**Causes**:
- CORS issues
- Event format problems
- Connection management failures

### 3. Events Received but No UI Updates
**Symptoms**:
- Console shows events being received
- React components not re-rendering
- UI appears frozen/stale

**Causes**:
- React Query not invalidating
- Component subscription issues
- State management problems

## Emergency Rollback Procedure

### Quick Rollback (Under 5 minutes)
1. `git status` - Check current state
2. `git stash` - Save any important changes for analysis  
3. `git restore .` - Restore all tracked files
4. `git clean -fd` - Remove untracked files
5. Test cross-tab sync functionality immediately

### Comprehensive Rollback (If needed)
1. Identify last working commit with `git log --oneline`
2. Create backup branch: `git checkout -b backup-failed-sse-work`  
3. Return to main: `git checkout main`
4. Hard reset: `git reset --hard <last-working-commit>`
5. Verify functionality restoration

## Prevention Protocols

### Mandatory Pre-Change Testing
- [ ] Automated cross-tab synchronization test
- [ ] All real-time features verification
- [ ] Performance baseline measurement
- [ ] Rollback plan documented

### Development Circuit Breaker
- **Trigger**: 3 consecutive unsuccessful fix attempts
- **Action**: Automatic rollback consideration
- **Override**: Requires explicit user approval and time-boxed constraint

### Classification Requirements
- **Any SSE modification**: Minimum SEV-1 classification
- **SSE consolidation/refactoring**: Minimum SEV-0 classification  
- **Real-time infrastructure changes**: Application-level classification
- **Performance optimization touching SSE**: SEV-1 classification

## Emergency Contacts and Escalation

### Internal Escalation
- **User directive "NO STOP"**: Immediate halt of all work
- **User declares "FAIL STATE"**: Execute emergency protocols
- **Debugging becoming harder**: Stop and assess rollback

### Documentation Requirements
- All SSE failures must be documented in `/docs/05_for-agents/`
- Technical analysis in relevant feature `/5-debugging/` folder
- Post-mortem in `/6-key_learnings/` folder
- After Action Report in `/docs/04_after-action-reports/`

## Special SSE Considerations

### SSE is High-Risk by Nature
- Real-time features are core user experience
- Cross-browser compatibility issues
- Network connectivity dependencies
- Complex client-side state synchronization

### Architecture Change Recognition
- **Consolidation ≠ Simple refactoring**
- **Working individual components ≠ Working consolidated system**
- **Server success ≠ Client success**
- **Code reduction ≠ Functionality preservation**

### User Experience Impact
- Broken real-time features immediately visible
- User workflow disruption
- Loss of collaborative functionality
- Debugging difficulty compounds user frustration

---

**Remember**: SSE failures are never "simple bugs" - they indicate systematic issues requiring careful analysis and often complete rollback. Preserve working systems over architectural idealism.

**Last Updated**: 2025-08-20 based on major-system-cleanup failure analysis