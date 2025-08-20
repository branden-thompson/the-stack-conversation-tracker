# CompactUserSelector Component

A reusable, space-efficient user selector component that displays only a profile picture (50x50) that when clicked shows a dropdown below with user selection options.

## Features

- **Fixed 50x50 size** maintains consistent layout
- **Profile picture with fallback** to user initials
- **Right-aligned dropdown** positioning
- **System user indicators** (crown badge)
- **Click outside to close**
- **Keyboard accessible**
- **Integrated theme controls** (Light, Dark, Auto)
- **Extensible user preferences** for future controls
- **Optional management actions** (create, edit, manage)

## Usage

```jsx
import { CompactUserSelector } from '@/components/ui/compact-user-selector';
import { useTheme } from 'next-themes';

const { theme, setTheme, systemTheme } = useTheme();
const themeControls = {
  theme,
  setTheme,
  systemTheme,
  currentTheme: theme === 'system' ? systemTheme : theme
};

<CompactUserSelector
  users={users}
  currentUserId={currentUser?.id}
  onUserSelect={handleUserSelect}
  onCreateUser={handleCreateUser}     // Optional
  onEditUser={handleEditUser}         // Optional
  onManageUsers={handleManageUsers}   // Optional
  themeControls={themeControls}       // Optional, for theme controls
  showManagementActions={true}        // Optional, default: true
  showUserPreferences={true}          // Optional, default: true
  additionalPreferences={[]}          // Optional, for future preferences
  disabled={false}                    // Optional, default: false
  className="custom-class"            // Optional
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `users` | `Array` | ✅ | `[]` | Array of user objects |
| `currentUserId` | `string` | ✅ | - | ID of currently selected user |
| `onUserSelect` | `Function` | ✅ | - | Callback when user is selected `(user) => void` |
| `onCreateUser` | `Function` | ❌ | - | Callback for create user action |
| `onEditUser` | `Function` | ❌ | - | Callback for edit user action `(user) => void` |
| `onManageUsers` | `Function` | ❌ | - | Callback for manage users action |
| `showManagementActions` | `boolean` | ❌ | `true` | Whether to show create/edit/manage actions |
| `showUserPreferences` | `boolean` | ❌ | `true` | Whether to show user preference controls |
| `themeControls` | `Object` | ❌ | - | Theme control props from useTheme() |
| `additionalPreferences` | `Array` | ❌ | `[]` | Additional preference controls to render |
| `disabled` | `boolean` | ❌ | `false` | Whether the selector is disabled |
| `className` | `string` | ❌ | - | Additional CSS classes |

## User Object Structure

```javascript
{
  id: 'user-id',
  name: 'User Name',
  profilePicture: '/path/to/image.jpg', // Optional
  isSystemUser: false // Optional, for system user indicators
}
```

## Examples

### Basic Usage (User Selection Only)
```jsx
<CompactUserSelector
  users={users}
  currentUserId={currentUserId}
  onUserSelect={setCurrentUser}
  showManagementActions={false}
/>
```

### Full Featured (With Management)
```jsx
<CompactUserSelector
  users={users}
  currentUserId={currentUserId}
  onUserSelect={handleUserSwitch}
  onCreateUser={() => setCreateUserDialogOpen(true)}
  onEditUser={(user) => setEditUser(user)}
  onManageUsers={() => router.push('/admin/users')}
/>
```

### With Theme Controls
```jsx
// Full-featured with theme controls
const { theme, setTheme, systemTheme } = useTheme();
const themeControls = { theme, setTheme, systemTheme, currentTheme: theme === 'system' ? systemTheme : theme };

<CompactUserSelector
  users={users}
  currentUserId={currentUserId}
  onUserSelect={switchUser}
  themeControls={themeControls}
/>
```

### With Additional Preferences (Future)
```jsx
// Example of adding custom preference controls
const notificationPreference = (
  <div className="space-y-2">
    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
      Notifications
    </div>
    <Button size="sm" variant="outline" onClick={toggleNotifications}>
      {notifications ? 'Disable' : 'Enable'} Notifications
    </Button>
  </div>
);

<CompactUserSelector
  users={users}
  currentUserId={currentUserId}
  onUserSelect={switchUser}
  themeControls={themeControls}
  additionalPreferences={[notificationPreference]}
/>
```

### In Navigation Bars
```jsx
// App Header (no longer needs separate ThemeToggle)
<header className="flex items-center justify-between p-4">
  <div>Logo</div>
  <div className="flex items-center gap-4">
    <CompactUserSelector 
      users={users} 
      currentUserId={currentUserId} 
      onUserSelect={switchUser}
      themeControls={themeControls}
    />
  </div>
</header>

// Sidebar (minimal)
<aside className="w-64 p-4">
  <div className="flex items-center justify-between mb-6">
    <h2>Menu</h2>
    <CompactUserSelector 
      users={users} 
      currentUserId={currentUserId} 
      onUserSelect={switchUser}
      showManagementActions={false}
      showUserPreferences={false}
    />
  </div>
</aside>
```

## Styling

The component uses Tailwind CSS classes and follows the design system patterns. It automatically adapts to light/dark themes.

The dropdown is positioned relative to the profile picture button and will appear below and right-aligned to the button.