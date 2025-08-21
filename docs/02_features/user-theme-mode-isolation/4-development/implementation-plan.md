# User Theme Mode Isolation - Implementation Plan

**Feature**: User Theme Mode Isolation  
**Date**: 2025-08-21  
**SEV Level**: SEV-0 (System Stability Critical)

## Implementation Roadmap

### **PHASE 1: FOUNDATION** (Est. 3-4 hours)
*Zero breaking changes, establish core infrastructure*

#### Task 1.1: Create UserThemeProvider Component (60 min)
**Files to Create:**
- `/lib/contexts/UserThemeProvider.jsx`
- `/lib/hooks/useUserTheme.js`

**Implementation Details:**
```typescript
// UserThemeProvider component
- Wrap next-themes with user-specific logic
- Handle localStorage per-user storage
- Provide context for theme mode access
- Default fallbacks for missing data

// Core functionality
- getUserThemeMode(userId): string
- setUserThemeMode(userId, mode): void  
- syncThemeForUser(userId): void
- resetUserTheme(userId): void
```

**Dependencies**: None  
**Risk Level**: Low  
**Testing**: Unit tests for storage operations

#### Task 1.2: User-Specific localStorage Utilities (45 min)
**Files to Create:**
- `/lib/utils/user-theme-storage.js`

**Implementation Details:**
```typescript
// Storage key management
const getThemeModeKey = (userId) => `user_${userId}_theme_mode`;

// CRUD operations with error handling
const getUserThemeMode = (userId) => { /* safe localStorage read */ };
const setUserThemeMode = (userId, mode) => { /* safe localStorage write */ };
const removeUserThemeMode = (userId) => { /* cleanup on user deletion */ };
const getAllUserThemes = () => { /* admin/debug utility */ };

// Default value logic
const getDefaultThemeMode = (user) => user.isGuest ? 'dark' : 'dark';
```

**Dependencies**: None  
**Risk Level**: Low  
**Testing**: Storage operations, error conditions

#### Task 1.3: Feature Flag Infrastructure (30 min)
**Files to Modify:**
- `next.config.js` or environment config
- Create feature flag utilities

**Implementation Details:**
```typescript
// Environment variable control
NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION=true

// Runtime feature flag checking
const isUserThemeIsolationEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION === 'true' &&
         !localStorage.getItem('user_theme_isolation_disabled');
};
```

**Dependencies**: None  
**Risk Level**: Low  
**Testing**: Flag toggle behavior

#### Task 1.4: Unit Tests for Core Utilities (45 min)
**Files to Create:**
- `__tests__/unit/lib/utils/user-theme-storage.test.js`
- `__tests__/unit/lib/contexts/UserThemeProvider.test.jsx`

**Test Coverage:**
- Storage key generation
- CRUD operations with various user types
- Error handling and fallbacks
- Default value logic
- Feature flag behavior

**Dependencies**: Tasks 1.1, 1.2, 1.3  
**Risk Level**: Low

---

### **PHASE 2: INTEGRATION** (Est. 2-3 hours)
*SSE-safe integration into existing architecture*

#### Task 2.1: Integrate UserThemeProvider into App (45 min)
**Files to Modify:**
- `app/providers.jsx`

**Implementation Details:**
```jsx
// Enhanced provider hierarchy
<UserThemeProvider currentUser={currentUser}>
  <ThemeProvider {...existing}>
    <DynamicThemeProvider {...existing}>
      {children}
    </DynamicThemeProvider>
  </ThemeProvider>
</UserThemeProvider>

// Conditional rendering based on feature flag
{isUserThemeIsolationEnabled() ? (
  <UserThemeProvider>{existingProviders}</UserThemeProvider>
) : (
  existingProviders
)}
```

**Dependencies**: Task 1.1  
**Risk Level**: Medium (Provider chain modification)  
**Testing**: SSE connection stability, theme switching

#### Task 2.2: Enhance ThemeToggle Component (60 min)
**Files to Modify:**
- `components/ui/theme-toggle.jsx`

**Implementation Details:**
```jsx
// Enhanced ThemeToggle with user awareness
export function ThemeToggle() {
  const { theme, setTheme } = useTheme(); // next-themes
  const { setUserThemeMode, currentUser } = useUserTheme(); // NEW
  
  const handleThemeChange = (newTheme) => {
    if (isUserThemeIsolationEnabled() && currentUser) {
      setUserThemeMode(currentUser.id, newTheme);
    }
    setTheme(newTheme);
  };
  
  // Existing UI with enhanced handlers
}
```

**Dependencies**: Task 2.1  
**Risk Level**: Low  
**Testing**: Theme button behavior, visual feedback

#### Task 2.3: User Switch → Theme Restore Logic (90 min)
**Files to Modify:**
- `lib/hooks/useUserManagement.js`
- `lib/hooks/useGuestUsers.js`

**Implementation Details:**
```typescript
// Enhanced user switching with theme restoration
const handleUserSwitch = async (userId) => {
  // Existing user switch logic
  await switchUser(userId);
  
  // NEW: Restore user's theme mode
  if (isUserThemeIsolationEnabled()) {
    const userThemeMode = getUserThemeMode(userId);
    next-themes.setTheme(userThemeMode);
  }
};

// Integration points
- useUserManagement.handleUserSelect()  
- useGuestUsers.switchToUser()
- User dropdown selection handlers
```

**Dependencies**: Task 2.2  
**Risk Level**: Medium (User switching is critical)  
**Testing**: User switch scenarios, theme persistence

#### Task 2.4: Guest Default Dark Mode Implementation (30 min)
**Files to Modify:**
- `lib/auth/guest-session.js`
- Guest user creation functions

**Implementation Details:**
```typescript
// Enhanced guest creation with theme defaults
const createGuestUser = (existingUsers, customName) => {
  const newGuest = { /* existing logic */ };
  
  // NEW: Set default dark mode for guest
  if (isUserThemeIsolationEnabled()) {
    setUserThemeMode(newGuest.id, 'dark');
  }
  
  return newGuest;
};
```

**Dependencies**: Task 2.1  
**Risk Level**: Low  
**Testing**: New guest creation, theme defaults

---

### **PHASE 3: USER EXPERIENCE** (Est. 2 hours)
*Enhanced UX features and production stability*

#### Task 3.1: Cross-Tab Synchronization (60 min)
**Files to Modify:**
- `lib/contexts/UserThemeProvider.jsx`

**Implementation Details:**
```typescript
// Storage event listeners for cross-tab sync
useEffect(() => {
  const handleStorageChange = (event) => {
    if (event.key.startsWith('user_') && event.key.endsWith('_theme_mode')) {
      const userId = extractUserIdFromKey(event.key);
      if (userId === currentUser.id && event.newValue) {
        next-themes.setTheme(event.newValue);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [currentUser.id]);
```

**Dependencies**: Phase 2 complete  
**Risk Level**: Low  
**Testing**: Multi-tab theme synchronization

#### Task 3.2: Performance Optimization and Caching (45 min)
**Files to Modify:**
- `lib/utils/user-theme-storage.js`
- `lib/contexts/UserThemeProvider.jsx`

**Implementation Details:**
```typescript
// In-memory cache for theme modes
const themeModeCache = new Map();

// Debounced storage writes
const debouncedSetUserThemeMode = debounce(setUserThemeMode, 100);

// Lazy loading and memoization
const useUserThemeMemo = useMemo(() => ({
  userThemeMode,
  setUserThemeMode: debouncedSetUserThemeMode
}), [userThemeMode]);
```

**Dependencies**: Phase 2 complete  
**Risk Level**: Low  
**Testing**: Performance benchmarks, memory usage

#### Task 3.3: Error Handling and Graceful Fallbacks (30 min)
**Files to Modify:**
- All theme-related components

**Implementation Details:**
```typescript
// Comprehensive error boundaries
const ThemeErrorBoundary = ({ children }) => {
  // Catch theme-related errors
  // Fallback to global theme behavior
  // Log errors for monitoring
};

// Safe operations with try-catch
const safeGetUserThemeMode = (userId) => {
  try {
    return getUserThemeMode(userId);
  } catch (error) {
    console.warn('[UserTheme] Error:', error);
    return 'dark'; // Safe fallback
  }
};
```

**Dependencies**: Phase 2 complete  
**Risk Level**: Low  
**Testing**: Error scenarios, fallback behavior

#### Task 3.4: Migration of Existing User Preferences (45 min)
**Files to Create:**
- `scripts/migrate-user-themes.js`

**Implementation Details:**
```typescript
// One-time migration script
const migrateExistingUserThemes = async () => {
  // Read existing user preferences
  // Migrate to new per-user storage format
  // Preserve user expectations
  // Log migration results
};

// Runtime migration check
const ensureUserThemeMigration = () => {
  if (!localStorage.getItem('user_theme_migration_complete')) {
    migrateExistingUserThemes();
  }
};
```

**Dependencies**: Phase 2 complete  
**Risk Level**: Medium (Data migration)  
**Testing**: Migration accuracy, rollback capability

---

### **PHASE 4: ENHANCEMENT** (Est. 1-2 hours)
*Optional advanced features*

#### Task 4.1: SSE Events for Theme Coordination (60 min)
**Files to Modify:**
- `lib/contexts/UserThemeProvider.jsx`
- SSE event handlers

**Implementation Details:**
```typescript
// SSE event integration
const emitThemeChangeEvent = (userId, themeMode) => {
  if (sseConnection) {
    sseConnection.emit({
      type: 'theme_mode_changed',
      userId,
      themeMode,
      timestamp: Date.now()
    });
  }
};

// Handle incoming theme events
const handleThemeSSEEvent = (event) => {
  if (event.userId === currentUser.id) {
    next-themes.setTheme(event.themeMode);
  }
};
```

**Dependencies**: Phase 3 complete, SSE system stable  
**Risk Level**: Medium (SSE integration)  
**Testing**: SSE event flow, cross-tab coordination

#### Task 4.2: Advanced Storage Cleanup (30 min)
**Implementation**: User deletion cleanup, storage size limits  
**Risk Level**: Low

#### Task 4.3: Analytics and Monitoring Integration (30 min)
**Implementation**: Theme usage metrics, performance tracking  
**Risk Level**: Low

## Testing Strategy

### **Testing Phases Aligned with Implementation**

**Phase 1 Testing:**
- Unit tests for storage utilities
- Feature flag toggle testing
- Error condition handling

**Phase 2 Testing:**
- Integration testing with existing theme system
- SSE connection stability during theme changes  
- User switch scenarios with theme restoration
- Guest user creation with dark mode defaults

**Phase 3 Testing:**
- Multi-tab synchronization scenarios
- Performance benchmarking
- Error boundary behavior
- User preference migration

**Phase 4 Testing:**
- SSE event coordination
- Advanced feature integration
- End-to-end user experience testing

### **Critical Test Scenarios**

1. **SSE Stability Test**: Rapid theme switching while monitoring SSE connections
2. **Multi-Tab Isolation**: User A (tab 1) + User B (tab 2) + theme changes
3. **User Switch Performance**: Measure theme restoration time during user switching
4. **Guest Default Verification**: New guest → verify dark mode default
5. **Storage Cleanup**: User deletion → verify theme mode cleanup
6. **Error Recovery**: localStorage unavailable → verify graceful fallback

## Risk Mitigation During Implementation

### **Phase-by-Phase Risk Controls**

**Phase 1 Risks:**
- Risk: localStorage errors → Mitigation: Comprehensive error handling
- Risk: Feature flag failures → Mitigation: Default to existing behavior

**Phase 2 Risks:**
- Risk: SSE disruption → Mitigation: Isolate theme state from SSE lifecycle
- Risk: User switching breaks → Mitigation: Fallback to existing user switch logic

**Phase 3 Risks:**
- Risk: Performance degradation → Mitigation: Performance benchmarking gates
- Risk: Cross-tab conflicts → Mitigation: Graceful conflict resolution

### **Rollback Plan Per Phase**

**Phase 1**: Disable feature flag → No impact  
**Phase 2**: Revert provider changes → Restore existing theme behavior  
**Phase 3**: Disable advanced features → Keep basic isolation  
**Phase 4**: Disable SSE integration → Maintain local-only theme isolation

## Success Metrics

### **Per-Phase Success Criteria**

**Phase 1**: Core utilities pass all unit tests, feature flag controls work  
**Phase 2**: SSE connections stable, user theme isolation functional  
**Phase 3**: Multi-tab sync works, performance within 200ms threshold  
**Phase 4**: SSE theme events work, monitoring data accurate

### **Overall Implementation Success**

- Theme isolation: 100% success in multi-tab testing scenarios
- SSE stability: Zero connection drops during theme operations  
- Performance: Theme switching < 100ms average response time
- User experience: Seamless theme restoration on user switching
- Default compliance: All new guests start with dark mode

---

**Implementation Plan Status**: ✅ **COMPLETE**  
**Next Phase**: Safety planning and rollback mechanisms