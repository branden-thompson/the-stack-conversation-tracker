# Docker Performance Optimization - 2025-08-18

## Issue
Navigation to dev pages in Docker container takes several seconds to load, while navigation works immediately in local development.

## Analysis

### Docker Container Investigation
- Container status: ✅ Running correctly
- Build: ✅ Multi-stage build with optimized layers
- Standalone mode: ✅ Configured for production
- Bundle analysis: Large chunks (up to 341KB for 6232.2f0f4b8b21b6e96e.js)

### Dev Pages Performance Bottlenecks

#### Heavy Hook Usage
Dev pages use multiple expensive hooks simultaneously:
1. **useUserTracking** - Real-time polling/SSE for session data
2. **useGuestUsers** - Complex user management with browser session sync
3. **useConversations** - Real-time conversation tracking
4. **useButtonTracking** - Global button interaction tracking
5. **useTabVisibility** - Tab visibility detection

#### Specific Performance Issues

**user-tracking/page.jsx**:
- Loads 5+ complex hooks on mount
- Real-time polling with 2s intervals
- Large session datasets
- Complex state management

**convos/page.jsx**:
- Heavy conversation data processing
- Event filtering and JSON preview
- Large payload summarization

### Docker-Specific Factors

1. **Network Latency**: Container-to-container API calls
2. **Resource Constraints**: Shared Docker daemon resources
3. **File System**: Docker overlay filesystem overhead
4. **Memory**: Limited container memory allocation

## Optimization Strategies

### 1. Bundle Optimization
```javascript
// next.config.js - Add bundle splitting for dev pages
experimental: {
  optimizePackageImports: ['lucide-react', '@/components/ui']
}
```

### 2. Lazy Loading for Dev Pages
```javascript
// Wrap heavy components in dynamic imports
const UserTrackingContent = dynamic(() => import('./content'), {
  loading: () => <div>Loading...</div>
});
```

### 3. Docker Optimizations
```dockerfile
# Add performance optimizations
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1
```

### 4. Selective Hook Loading
```javascript
// Load hooks conditionally
const useTracking = process.env.NODE_ENV === 'development' ? 
  useUserTracking : () => ({ loading: false });
```

### 5. API Caching
```javascript
// Add aggressive caching for Docker
const dockerCacheConfig = {
  revalidate: 10, // 10s cache for Docker
  headers: { 'Cache-Control': 'public, max-age=10' }
};
```

## Recommended Actions

### Immediate (Low Risk)
1. ✅ **Add bundle analysis** - Identify large chunks
2. ✅ **Add lazy loading** - For heavy dev page components  
3. ✅ **Optimize Docker memory** - Increase container limits

### Medium Term (Medium Risk)
1. **Implement selective loading** - Only load tracking hooks when needed
2. **Add dev page caching** - Cache API responses in Docker
3. **Bundle splitting** - Separate dev page chunks

### Long Term (Higher Risk)
1. **Restructure dev pages** - Break into smaller components
2. **Implement virtualization** - For large session lists
3. **Add service worker** - For offline dev page functionality

## Performance Targets
- **Initial Load**: < 2s for dev pages in Docker
- **Navigation**: < 500ms between dev pages  
- **Bundle Size**: < 100KB per dev page chunk
- **Memory**: < 512MB container usage

## Implementation Priority
1. 🔥 **High Priority**: Bundle optimization and lazy loading
2. 🟡 **Medium Priority**: Docker container optimization
3. 🟢 **Low Priority**: Architectural changes

---

**Analysis Date**: 2025-08-18  
**Issue Type**: Docker Performance  
**Impact**: Medium (dev pages only)  
**Status**: Investigation Complete, Implementation Pending

*Navigation works correctly but performance optimization needed for Docker deployment*