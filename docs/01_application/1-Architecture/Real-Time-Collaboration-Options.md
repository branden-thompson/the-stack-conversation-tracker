# Real-Time Collaboration (RTC) Options Analysis

**Document Type**: Architecture Analysis & Recommendation  
**Date**: 2025-08-19  
**Status**: Proposed  
**Priority**: High - Resource Safety Critical  

## Executive Summary

This document analyzes Server-Sent Events (SSE) vs WebSockets for implementing Real-Time Collaboration (RTC) in the conversation board system. **Recommendation: Hybrid approach starting with SSE foundation**, based on API runaway incident learnings and resource safety requirements.

---

## Requirements Analysis

### Core RTC Requirements
1. **Board State Synchronization**
   - Card positions & zone changes (Active→Parking, etc.)
   - Card content updates
   - Visual indicators for ongoing actions

2. **User Presence & Interaction**
   - User cursors and presence indicators
   - Drag state indicators ("Alice is moving Card #123")
   - Live editing indicators

3. **Performance Targets**
   - Support 5-20 concurrent users
   - Minimal performance regression for single users
   - Sub-second update latency

### Critical Constraints
- **Resource Safety Priority**: Must avoid API runaway scenarios
- **Docker Environment**: Resource-constrained containers
- **Development Time**: Tolerance for longer dev cycles for stability
- **Production Stability**: Zero tolerance for CPU/memory issues

---

## Current Architecture Analysis

### Strengths
- **React Query** for optimistic updates and caching
- **DnD Kit** for drag-and-drop with precise card positioning
- **Zone-based board** with 4 distinct areas
- **Event-driven system** via GlobalSessionProvider
- **Safety switches** and performance monitoring infrastructure
- **User management** with guest and registered user support

### API Runaway Incident Learnings
**Date**: 2025-08-19  
**Root Cause**: Polling-based real-time collaboration caused 100%+ CPU usage across multiple Next.js processes

**Key Learnings**:
- Polling systems are dangerous even with circuit breakers
- Circuit breakers focused on processing time, not CPU/memory usage
- Production vs development environments behave differently
- Need CPU/memory monitoring in addition to request timing

---

## Technology Comparison

### Server-Sent Events (SSE)

#### Technical Profile
```javascript
// SSE Resource Characteristics
{
  memoryPerConnection: "~2-5KB",        // HTTP request context
  cpuPerMessage: "Low",                 // HTTP response writing
  connectionOverhead: "Minimal",        // HTTP keep-alive
  scalingPattern: "Linear",             // Predictable resource usage
  emergencyShutdown: "HTTP close",      // Clean disconnect
  monitoringComplexity: "Simple"        // Standard HTTP metrics
}
```

#### Implementation Pattern
```javascript
// Client: Simple EventSource
const eventSource = new EventSource('/api/board/events');
eventSource.onmessage = (event) => {
  const boardUpdate = JSON.parse(event.data);
  queryClient.setQueryData(['cards'], boardUpdate.cards);
};

// Server: Standard HTTP response
export async function GET() {
  const stream = createBoardEventStream();
  return new Response(stream, SSE_HEADERS);
}
```

#### Advantages ✅
- **Simpler implementation** - HTTP-based, easier debugging
- **Automatic reconnection** - Browser handles connection drops
- **Lower resource overhead** - No connection upgrade handshake
- **Better for unidirectional updates** (server pushing board state)
- **Built-in backpressure handling** - HTTP/2 flow control
- **Easier to monitor** - Standard HTTP requests
- **Predictable resource usage** - HTTP-based, well-understood patterns
- **Connection limits prevent runaway** - Browser enforces 6 connections/domain
- **Graceful degradation** - Automatic fallback to polling if connection fails

#### Limitations ❌
- **One-way communication** - Client must use separate API calls for actions
- **Limited concurrent connections** - HTTP connection limits (6 per domain)
- **No binary data support** - Text-based events only
- **Higher latency** for bi-directional interactions

### WebSockets

#### Technical Profile
```javascript
// WebSocket Resource Characteristics  
{
  memoryPerConnection: "~8-15KB",       // Socket buffer + state
  cpuPerMessage: "Higher",              // Frame parsing, broadcasting
  connectionOverhead: "Higher",         // Persistent TCP + upgrade
  scalingPattern: "Non-linear",         // Memory/CPU can spike
  emergencyShutdown: "Socket.close()",  // Requires proper cleanup
  monitoringComplexity: "Complex"       // Custom WebSocket metrics needed
}
```

#### Implementation Pattern
```javascript
// Client: Manual connection management
const ws = new WebSocket('/api/websocket');
ws.onopen = () => joinRoom(boardId);
ws.onmessage = handleBoardUpdate;
ws.onclose = () => attemptReconnection(); // Manual reconnection

// Server: Connection upgrade + room management
const rooms = new Map(); // Manual room state management
const sockets = new Set(); // Manual connection tracking
```

#### Advantages ✅
- **True bi-directional communication** - Ideal for drag interactions
- **Lower latency** - No HTTP request/response overhead
- **Better for high-frequency updates** - Cursor tracking, drag events
- **Real-time interaction** - Immediate user action broadcasting
- **No HTTP connection limits** - Independent persistent connections
- **Binary data support** - Efficient for complex payloads

#### Limitations ❌
- **More complex implementation** - Connection management, heartbeats
- **Manual reconnection handling** - Must implement reconnection logic
- **Higher resource usage** - Persistent connections, memory per socket
- **More difficult debugging** - Binary protocol, connection state issues
- **Higher memory footprint** - Persistent connections consume more RAM
- **Complex resource monitoring** - Need custom metrics for WebSocket health
- **Potential for connection leaks** - Improper cleanup = memory leaks
- **Broadcast amplification** - 1 action → N user broadcasts (CPU spike risk)

---

## Feature Requirement Analysis

| Requirement | SSE Fit | WebSocket Fit | Winner |
|-------------|---------|---------------|---------|
| **Card position updates** | ✅ Good - Push updates | ✅ Excellent - Real-time | **WebSocket** |
| **Zone changes** | ✅ Good - Event-driven | ✅ Good - Event-driven | **Tie** |
| **User presence/cursors** | ⚠️ OK - Server-driven | ✅ Excellent - Immediate | **WebSocket** |
| **Drag indicators** | ❌ Poor - High frequency | ✅ Excellent - Real-time | **WebSocket** |
| **Live editing** | ⚠️ OK - Debounced | ✅ Excellent - Character-level | **WebSocket** |
| **5-20 concurrent users** | ✅ Good - Scalable | ⚠️ OK - Resource heavy | **SSE** |

## Critical Constraint Analysis

| Constraint | SSE Impact | WebSocket Impact | Winner |
|------------|------------|------------------|---------|
| **Resource Safety** | ✅ Low risk - Predictable | ❌ Higher risk - Complex | **SSE** |
| **API Runaway Prevention** | ✅ Push-only, no loops | ⚠️ Feedback loop potential | **SSE** |
| **Docker Environment** | ✅ Lower memory/CPU | ❌ Higher resource usage | **SSE** |
| **Development Time** | ✅ Faster implementation | ❌ Longer dev cycle | **SSE** |
| **Production Stability** | ✅ HTTP reliability | ⚠️ Connection complexity | **SSE** |

---

## Recommended Implementation Approaches

### Approach 1: Minimal Viable Collaboration (SSE-Only)
**Priority: Stability > Features**

#### Phase 1 Implementation
1. **SSE Server** (`/api/board/events`)
   - Built-in connection limiting (max 10 concurrent)
   - CPU/memory monitoring with auto-disconnect
   - Room-based isolation (one board per room)

2. **Real-Time Events**
   - Card position updates (x, y coordinates)
   - Card zone transfers (active → parking, etc.)
   - Basic presence indicators (who's online)

3. **Safety Controls**
   - Feature flag: `NEXT_PUBLIC_RTC_ENABLED`
   - Circuit breaker: Disconnect on >50% CPU usage
   - Rate limiting: Max 10 events/second per user
   - Automatic fallback to polling-less mode

4. **State Synchronization**
   - Leverage existing React Query optimistic updates
   - SSE events trigger query invalidation
   - No state duplication - SSE only for notifications

**Benefits**: ✅ Minimal risk, builds on existing architecture, quick rollback  
**Drawbacks**: ❌ Limited features, basic collaboration only

### Approach 2: Enhanced Collaboration (WebSocket)
**Priority: Features > Development Speed**

#### Additional Features on top of Approach 1
1. **Advanced Presence**
   - Real-time cursor tracking
   - User drag indicators ("Alice is moving Card #123")
   - Live editing indicators for card content

2. **Real-Time Editing**
   - Live text updates as users type
   - Conflict resolution for simultaneous edits
   - Version reconciliation

3. **Enhanced Safety**
   - Graduated connection limits (3 → 5 → 10 users)
   - Memory usage monitoring with automatic cleanup
   - Heartbeat system with dead connection cleanup

**Benefits**: ✅ Full collaboration experience, matches requirements  
**Drawbacks**: ❌ Higher complexity, longer development time

### Approach 3: Hybrid Push/Pull System
**Priority: Safety > Real-time Responsiveness**

#### Architecture
1. **SSE for High-Priority Events**
   - Card movements (immediate visual feedback needed)
   - User presence (join/leave notifications)

2. **Smart Polling for Low-Priority**
   - Card content updates (less time-sensitive)
   - User preference changes
   - Background state synchronization

3. **Adaptive Behavior**
   - Monitor system resources
   - Gracefully degrade to polling-only under load
   - Auto-upgrade back to SSE when stable

**Benefits**: ✅ Best of both worlds, graceful degradation  
**Drawbacks**: ❌ Complex implementation, dual maintenance overhead

---

## Final Recommendation: Hybrid SSE Foundation

### Recommended Approach: SSE with Selective WebSocket Enhancement

#### Phase 1: SSE Foundation (Months 1-2)
```javascript
// Primary: SSE for board state synchronization
const boardEvents = new EventSource('/api/board/sse');
boardEvents.addEventListener('card:moved', updateCardPosition);
boardEvents.addEventListener('user:joined', showUserPresence);
boardEvents.addEventListener('board:state', syncBoardState);

// Actions: Use existing React Query API calls
const moveCard = useMutation({
  mutationFn: (cardData) => updateCard(cardData.id, cardData),
  onSuccess: () => {
    // SSE will broadcast to other users
    // No WebSocket needed for core functionality
  }
});
```

#### Phase 2: WebSocket for High-Frequency Features (Month 3+)
```javascript
// Enhanced: WebSocket only for cursor tracking & drag indicators
const cursorSocket = new WebSocket('/api/cursor-tracking');
cursorSocket.onmessage = (event) => {
  const { userId, x, y, action } = JSON.parse(event.data);
  updateUserCursor(userId, { x, y, action });
};

// Drag indicators during active dragging
const handleDragStart = (cardId) => {
  cursorSocket.send(JSON.stringify({
    type: 'drag:start',
    cardId,
    userId: currentUser.id
  }));
};
```

### Why This Hybrid Approach Is Optimal

#### Addresses Critical Constraints ✅
1. **Resource Safety First** - SSE foundation has predictable, low resource usage
2. **API Runaway Prevention** - Push-only SSE eliminates feedback loops
3. **Development Time** - SSE implementation is significantly faster
4. **Production Stability** - HTTP-based SSE is battle-tested and reliable

#### Meets Core Requirements ✅
1. **Card positions & zones** - SSE handles perfectly with sub-second updates  
2. **User presence** - SSE broadcasts join/leave events efficiently
3. **Board state sync** - SSE excels at pushing state changes
4. **5-20 users** - SSE scales well within this range
5. **Future enhancement path** - Add WebSocket for advanced features later

#### Incident Learnings Applied ✅
1. **No polling** - Pure push-based architecture
2. **Resource monitoring** - HTTP metrics are well-established
3. **Emergency shutdown** - Simply close SSE connections
4. **Gradual rollout** - Can disable SSE with feature flag instantly

---

## Implementation Timeline

### Phase 1: SSE Infrastructure (Weeks 1-2)
- Board event streaming with resource monitoring
- Basic card movement synchronization
- User presence indicators

### Phase 2: SSE Enhancement (Weeks 3-4)
- Card zone transfer broadcasting
- Board state consistency
- Connection management & recovery

### Phase 3: Optional WebSocket Layer (Month 2+)
- Only if cursor tracking/drag indicators are critical
- Separate service from core board functionality
- Independent resource monitoring

---

## Technical Specifications

### Board Events
```javascript
const BOARD_EVENTS = {
  CARD_MOVED: 'card:moved',           // x,y position + zone changes
  CARD_UPDATED: 'card:updated',       // content changes
  USER_CURSOR: 'user:cursor',         // cursor position tracking
  USER_DRAGGING: 'user:dragging',     // drag state indicators
  USER_JOINED: 'user:joined',         // presence management
  USER_LEFT: 'user:left',
  BOARD_LOCKED: 'board:locked'        // Emergency lockout
};
```

### Safety Controls
```javascript
// Enhanced circuit breaker beyond previous implementation
class CollaborationCircuitBreaker {
  monitors = ['cpu', 'memory', 'connectionCount', 'eventRate'];
  
  checkThresholds() {
    // Unlike previous 15ms threshold - monitor resources
    const cpu = this.getCPUUsage();
    const memory = this.getMemoryUsage();
    
    if (cpu > 50 || memory > 256) {
      this.emergencyDisconnect();
    }
  }
}
```

### Integration Points

#### React Query Integration
- SSE events trigger `queryClient.invalidateQueries(['cards'])`
- Maintain optimistic updates for local actions
- Server events override local state only on conflicts

#### Existing Event System
- Extend `GlobalSessionProvider` with SSE event emission
- Reuse `SESSION_EVENT_TYPES` for consistency
- Bridge SSE events to session tracking

### Emergency Controls
```javascript
const EMERGENCY_CONTROLS = {
  DISABLE_RTC: 'NEXT_PUBLIC_RTC_DISABLED=true',
  KILL_SSE_CONNECTIONS: 'pkill -f sse',
  CIRCUIT_BREAKER_OVERRIDE: 'FORCE_READONLY_MODE=true'
};
```

---

## Testing Strategy

### Load Testing
- **SSE connection testing** with actual event streams
- **Resource monitoring** during tests
- **Docker container testing** to match production
- **Gradual user rollout** (1 → 3 → 5 → 10 users)

### Safety Testing
- CPU/memory threshold testing
- Connection limit enforcement
- Emergency shutdown procedures
- Feature flag disable/enable cycles

### Integration Testing
- React Query cache invalidation
- Session event system integration
- User management system compatibility
- Board state consistency validation

---

## Risk Mitigation

### High-Risk Scenarios
1. **Memory leaks** from unclosed SSE connections
2. **Event loops** from circular event broadcasts
3. **Resource exhaustion** from too many concurrent users
4. **State inconsistency** between optimistic updates and server state

### Mitigation Strategies
1. **Connection lifecycle management** with automatic cleanup
2. **Event deduplication** and loop detection
3. **Hard connection limits** with queuing for excess users
4. **Server-authoritative state** with client reconciliation

---

## Success Metrics

### Phase 1 (SSE Foundation)
- ✅ Zero API runaway incidents
- ✅ <50MB memory usage per 10 concurrent users
- ✅ <2 second update latency for card movements
- ✅ 99.9% connection uptime

### Phase 2 (Enhanced Features)
- ✅ Real-time cursor tracking with <100ms latency
- ✅ Conflict-free collaborative editing
- ✅ Support for 20 concurrent users
- ✅ <1% CPU usage increase per additional user

---

## Conclusion

**SSE provides 80% of the collaboration value with 20% of the resource risk and implementation complexity.** Given the API runaway incident history and stability requirements, SSE is the optimal starting point.

The hybrid approach provides an **immediate stable foundation** with a **clear enhancement path** once SSE is proven in production. This strategy balances the need for real-time collaboration features with the critical requirement for system stability and resource safety.

---

**Document Prepared By**: Claude (AI Assistant)  
**Review Status**: Awaiting Technical Review  
**Implementation Priority**: High  
**Next Actions**: Begin Phase 1 SSE implementation planning

*This document follows the project's documentation standards for architecture analysis and technical decision-making.*