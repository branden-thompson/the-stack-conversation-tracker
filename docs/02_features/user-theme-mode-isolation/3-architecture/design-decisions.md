# User Theme Mode Isolation - Architecture Design

**Feature**: User Theme Mode Isolation  
**Date**: 2025-08-21  
**SEV Level**: SEV-0 (System Stability Critical)

## System Architecture Overview

### High-Level Architecture Design

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER THEME ISOLATION LAYER                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌───────────────┐  ┌─────────────────┐  ┌───────────────────────┐│
│ │ User Context  │→ │UserThemeProvider│→ │Per-User Theme Storage││
│ │               │  │                 │  │                      ││
│ │ currentUser   │  │• Storage Layer  │  │localStorage keys:     ││
│ │ switchUser()  │  │• Mode Isolation │  │user_${id}_theme_mode ││
│ │ isGuest       │  │• SSE Safe       │  │                      ││
│ └───────────────┘  │• Default Mgmt   │  │Defaults: 'dark'       ││
│                    └─────────────────┘  └───────────────────────┘│
│                            │                                    │
│                            v                                    │
├─────────────────────────────────────────────────────────────────┤
│                EXISTING THEME ARCHITECTURE (PRESERVED)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┐  ┌──────────────────┐  ┌────────────────────────┐│
│ │ next-themes │→ │DynamicThemeProvider│→│ getCurrentAppTheme()   ││
│ │             │  │                  │  │                        ││
│ │setTheme()   │  │• Color Themes    │  │Combines:               ││
│ │HTML classes │  │• User-specific   │  │• Mode (L/D/S)         ││
│ │SSR support  │  │• Persistence     │  │• Color Theme (per user)││
│ └─────────────┘  └──────────────────┘  │• System detection      ││
│                                        └────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### 1. User Theme Mode Storage Strategy

**Storage Key Namespace Design:**
```typescript
// Storage key pattern: user_{userId}_theme_mode
const getThemeModeKey = (userId: string): string => {
  if (userId.startsWith('guest_')) {
    return `user_${userId}_theme_mode`;
  }
  return `user_${userId}_theme_mode`;
};

// Default values per user type
const getDefaultThemeMode = (user): 'light' | 'dark' | 'system' => {
  if (user.isGuest) return 'dark';           // New requirement
  return user.preferences?.themeMode || 'dark'; // Existing users default dark
};
```

**Storage Operations:**
```typescript
// Save user theme mode
setUserThemeMode(userId: string, mode: string) => {
  localStorage.setItem(getThemeModeKey(userId), mode);
  // Optional: SSE event for cross-tab sync
}

// Load user theme mode
getUserThemeMode(userId: string) => {
  return localStorage.getItem(getThemeModeKey(userId)) || getDefaultThemeMode(user);
}
```

### 2. Theme Synchronization Flow

**User Switch → Theme Restore Flow:**
```
┌─────────────────────┐
│ User Switch Event   │
│ (currentUser.id)    │
└──────────┬──────────┘
           │
           v
┌─────────────────────────────────────┐
│ UserThemeProvider.syncThemeForUser  │
│ • Get userId from context           │
│ • Read localStorage[user_X_mode]    │
│ • Handle missing keys (defaults)    │
└─────────────┬───────────────────────┘
              │
              v
┌─────────────────────────────────────┐
│ next-themes.setTheme(userMode)      │
│ • Updates HTML class                │
│ • Triggers provider re-renders      │
│ • Maintains SSR compatibility       │
└─────────────┬───────────────────────┘
              │
              v
┌─────────────────────────────────────┐
│ DynamicThemeProvider responds       │
│ • Color theme remains user-specific │
│ • Combines mode + color → final     │
│ • No SSE connection disruption      │
└─────────────────────────────────────┘
```

**Theme Change → Storage Flow:**
```
┌─────────────────────┐
│ User clicks theme   │
│ button (L/D/S)      │
└──────────┬──────────┘
           │
           v
┌─────────────────────────────────────┐
│ ThemeToggle → UserThemeProvider     │
│ • Intercept theme change            │
│ • Store in user-specific key        │
│ • Call next-themes.setTheme()       │
└─────────────┬───────────────────────┘
              │
              v
┌─────────────────────────────────────┐
│ Optional: Cross-tab SSE event       │
│ • Notify other tabs of same user    │
│ • Update theme in background tabs   │
│ • Preserve different users' themes  │
└─────────────────────────────────────┘
```

## Component Design Architecture

### UserThemeProvider Component Design

**Provider Hierarchy:**
```jsx
// New architecture
<UserThemeProvider currentUser={currentUser}>
  <ThemeProvider {...nextThemesConfig}> {/* next-themes preserved */}
    <DynamicThemeProvider {...existingProps}> {/* existing color theme logic */}
      <GlobalSessionProvider>
        <App />
      </GlobalSessionProvider>
    </DynamicThemeProvider>
  </ThemeProvider>
</UserThemeProvider>
```

**UserThemeProvider Interface:**
```typescript
interface UserThemeProviderProps {
  currentUser: User | null;
  children: React.ReactNode;
  enableCrossTabSync?: boolean; // Default: true
  onThemeChange?: (userId: string, mode: string) => void; // Optional SSE callback
}

interface UserThemeContextValue {
  userThemeMode: 'light' | 'dark' | 'system';
  setUserThemeMode: (mode: string) => void;
  isUserThemeLoaded: boolean;
  resetToDefault: () => void;
}
```

### Integration Points

**1. Integration with useUserManagement:**
```typescript
// Enhanced useUserManagement to include theme restoration
const useUserManagement = () => {
  const userThemeContext = useUserThemeContext();
  
  const handleUserSwitch = async (userId) => {
    // Existing user switch logic...
    await switchUser(userId);
    
    // NEW: Restore user's theme mode
    userThemeContext.syncThemeForUser(userId);
  };
  
  return { ...existing, handleUserSwitch };
};
```

**2. Integration with Guest Provisioning:**
```typescript
// Enhanced guest provisioning with dark mode default
const createNewGuestUser = () => {
  const newGuest = createGuestUser(allUsers);
  
  // NEW: Set default dark mode for guest
  localStorage.setItem(`user_${newGuest.id}_theme_mode`, 'dark');
  
  return newGuest;
};
```

**3. ThemeToggle Component Enhancement:**
```jsx
// Enhanced ThemeToggle to work with UserThemeProvider
export function ThemeToggle() {
  const { theme, setTheme } = useTheme(); // next-themes
  const { setUserThemeMode } = useUserThemeContext(); // NEW
  
  const handleThemeChange = (newTheme) => {
    setUserThemeMode(newTheme); // Store per-user
    setTheme(newTheme);         // Update UI immediately
  };
  
  return (
    // Existing UI with enhanced click handlers
    <Button onClick={() => handleThemeChange('light')}>Light</Button>
    // ... etc
  );
}
```

## SSE Integration Architecture

### SSE Safety Design Principles

**1. State Isolation:**
- Theme state managed independently from SSE connection lifecycle
- No shared state between theme context and SSE contexts
- Theme changes trigger component re-renders, NOT SSE re-initialization

**2. Event Coordination (Optional Enhancement):**
```typescript
// Optional SSE events for cross-tab theme sync
interface ThemeChangeEvent {
  type: 'theme_mode_changed';
  userId: string;
  newThemeMode: 'light' | 'dark' | 'system';
  timestamp: number;
  tabId: string; // Prevent echo
}

// SSE event handling
const handleThemeSSEEvent = (event: ThemeChangeEvent) => {
  if (event.userId === currentUser.id && event.tabId !== currentTabId) {
    // Same user in different tab changed theme
    next-themes.setTheme(event.newThemeMode);
  }
};
```

**3. Connection Preservation:**
- Theme provider changes do NOT trigger SSE hook re-initialization
- SSE connections remain stable during theme switching
- Independent error handling for theme vs SSE failures

## Performance Architecture

### Optimization Strategies

**1. Theme Mode Caching:**
```typescript
// In-memory cache for theme modes to reduce localStorage reads
const themeModeCache = new Map<string, string>();

const getCachedUserThemeMode = (userId: string) => {
  if (themeModeCache.has(userId)) {
    return themeModeCache.get(userId);
  }
  const mode = localStorage.getItem(getThemeModeKey(userId));
  if (mode) themeModeCache.set(userId, mode);
  return mode;
};
```

**2. Debounced Storage Writes:**
```typescript
// Prevent localStorage thrashing during rapid theme changes
const debouncedStorageWrite = debounce((userId: string, mode: string) => {
  localStorage.setItem(getThemeModeKey(userId), mode);
}, 100);
```

**3. Lazy Theme Loading:**
- Only load theme mode when user context is available
- Skip theme operations during SSR
- Graceful fallbacks for missing localStorage data

## Security and Data Management

### Data Privacy Design
- **User Isolation**: Each user's theme mode stored independently
- **Guest Privacy**: Guest theme preferences cleared on session end
- **Storage Cleanup**: Remove theme modes when users are deleted

### Error Handling Architecture
```typescript
// Comprehensive error handling
const safeGetUserThemeMode = (userId: string) => {
  try {
    return localStorage.getItem(getThemeModeKey(userId)) || 'dark';
  } catch (error) {
    console.warn('[UserTheme] localStorage access failed:', error);
    return 'dark'; // Safe fallback
  }
};

// Rollback capability
const revertToGlobalTheme = () => {
  // Emergency rollback: disable user theme isolation
  localStorage.setItem('user_theme_isolation_disabled', 'true');
  window.location.reload(); // Force reset to global theme behavior
};
```

## Migration Strategy

### Backward Compatibility Plan
1. **Phase 1**: Deploy UserThemeProvider without changing existing behavior
2. **Phase 2**: Enable per-user storage with feature flag
3. **Phase 3**: Migrate existing users' theme preferences
4. **Phase 4**: Enable cross-tab sync and SSE events

### Rollback Architecture
- **Feature Flag**: `ENABLE_USER_THEME_ISOLATION` for instant disable
- **Graceful Degradation**: Falls back to existing next-themes behavior
- **Data Preservation**: User theme preferences preserved for future re-enable

---

**Architecture Status**: ✅ **DESIGN COMPLETE**  
**Next Phase**: Task breakdown and dependency mapping