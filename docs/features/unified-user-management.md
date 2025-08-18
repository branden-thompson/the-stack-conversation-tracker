# Unified User Management System

## Overview
Consolidated the user management functionality so that both app-header and dev-header use the exact same user selector dropdown component and management logic.

## Key Components

### 1. Unified Hook: `useUserManagement`
**Location**: `/lib/hooks/useUserManagement.js`

Single source of truth for all user management operations:
- User selection/switching
- User creation (guests and registered)
- User editing
- User deletion
- Context-aware behavior (app vs dev pages)

### 2. Shared Component: `CompactUserSelector`
**Location**: `/components/ui/compact-user-selector.jsx`

Used by both headers:
- AppHeader (`/components/ui/app-header.jsx`)
- DevHeader (`/components/ui/dev-header.jsx`)

## Features

### Context-Aware Behavior
The unified hook automatically detects the context and adjusts behavior:

**In App Pages (`/`):**
- Create/Edit users opens a dialog
- Manage users opens create dialog
- Smooth UX for end users

**In Dev Pages (`/dev/*`):**
- Create/Edit navigates to `/dev/users`
- Manage users goes to user management page
- Developer-friendly workflow

### Guest User Support
- Guests can create additional guest users
- Guests can edit their own name
- Limited management capabilities with appropriate messaging

## Benefits

1. **Single Source of Truth**: One hook manages all user operations
2. **Consistency**: Same UI/UX across all pages
3. **Maintainability**: Changes in one place affect everything
4. **Less Code**: Removed duplicate `useDevUserManagement` hook
5. **Flexibility**: Pages can still override handlers if needed

## Usage

### Basic Usage (Headers)
```jsx
// Both headers now use the same approach internally
<DevHeader 
  onOpenTray={handleOpenTray}
  rightControls={customControls}
/>

<AppHeader
  onOpenTray={handleOpenTray}
  // ... other props
/>
```

### Direct Hook Usage
```jsx
const {
  allUsers,
  currentUser,
  handleUserSelect,
  handleCreateUser,
  handleEditUser,
  handleManageUsers,
  // ... other handlers
} = useUserManagement();
```

## Migration Summary

### Before
- Two separate hooks: `useGuestUsers` + `useDevUserManagement`
- Different behavior in app vs dev contexts
- Props passed through multiple layers

### After
- Single `useUserManagement` hook
- Automatic context detection
- Headers handle their own user management
- Cleaner component interfaces

---

*Last updated: 2025-08-18*