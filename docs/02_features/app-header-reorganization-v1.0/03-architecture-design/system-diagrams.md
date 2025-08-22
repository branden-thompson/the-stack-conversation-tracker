# System Architecture Diagrams - App-Header Reorganization v1.0

**🎖️ BRTOPS v1.1.003 DOCUMENTATION**  
**Type**: MAJOR FEATURE LVL-1 SEV-1  
**Project**: App-Header Reorganization for v1.0 Release

## 📊 HEADER COMPONENT ARCHITECTURE

### Human-Readable Version

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          APP HEADER COMPONENT                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [☰] [APP TITLE]                    [CONTROLS GROUPS]              [USER]      │
│                                                                                 │
│  ┌─────┐ ┌─────────────┐           ┌─────────────────────────────┐ ┌─────────┐  │
│  │Menu │ │Conversation │           │     5 Control Groups       │ │User     │  │
│  │     │ │Tracker v1.0 │           │                             │ │Profile  │  │
│  └─────┘ └─────────────┘           └─────────────────────────────┘ └─────────┘  │
│                                                                                 │
│                                    ┌─ Card Controls Group ─────┐               │
│                                    │ [+] [↻] [⚏] [🗑️]        │               │
│                                    │ New Ref  Rst Clear        │               │
│                                    └───────────────────────────┘               │
│                                                                                 │
│                                    ┌─ Conversation Controls ──┐                │
│                                    │ [▶] [⏸] [⏹]             │                │
│                                    │ Play Paus Stop           │                │
│                                    └─────────────────────────┘                │
│                                                                                 │
│                                    ┌─ Active Users Display ──┐                 │
│                                    │ [👥] Active: 3          │                 │
│                                    │ Real-time user count    │                 │
│                                    └─────────────────────────┘                 │
│                                                                                 │
│                                    ┌─ Info & Help Controls ──┐                 │
│                                    │ [ℹ️] [?]                │                 │
│                                    │ Info Help               │                 │
│                                    └─────────────────────────┘                 │
│                                                                                 │
│                                    ┌─ User Profile Selector ─┐                 │
│                                    │ [User Avatar] [Theme] [⚙]│                 │
│                                    │ Profile    Colors  Prefs │                 │
│                                    └─────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy Diagram

```
AppHeader
├── Left Section
│   ├── Hamburger Menu Button [conditional]
│   └── Title & Subtitle
│       ├── App Title "The Stack"
│       ├── Guest Mode Badge [conditional]
│       └── Guest Count Badge [conditional]
│
├── Center Section - Control Groups
│   ├── Group 1: Card Controls
│   │   ├── New Card Button (primary action)
│   │   ├── Refresh Board Button
│   │   ├── Reset Layout Button
│   │   └── Clear Board Dialog (destructive, farthest right)
│   │
│   ├── Group 2: Conversation Controls [conditional]
│   │   ├── Resume/Start Button
│   │   ├── Pause Button
│   │   └── Stop Button
│   │
│   ├── Group 3: Active Users Display [conditional]
│   │   ├── Active Users Count
│   │   └── Real-time Status Indicator
│   │
│   ├── Group 4: Info & Help
│   │   ├── Info Dialog Button
│   │   └── Help Dialog Button
│   │
│   └── Overflow Menu [mobile only]
│       └── Collapsed Controls for Small Screens
│
└── Right Section
    └── User Profile Controls
        ├── User Selector Dropdown
        ├── Color Theme Selector
        └── Animations Toggle
```

## 🏗️ COMPONENT STRUCTURE BREAKDOWN

### Group 1: Card Controls (Primary Actions)
```
┌─────────────────────────────────────────┐
│           CARD CONTROLS GROUP           │
├─────────────────────────────────────────┤
│ Priority: High                          │
│ Visibility: Always visible             │
│ Actions: CRUD operations on cards      │
│                                         │
│ [+ New Card] - Primary action           │
│ [↻ Refresh]  - Maintenance action       │
│ [⚏ Reset]    - Layout action            │
│ [🗑️ Clear]    - Destructive action       │
└─────────────────────────────────────────┘
```

### Group 2: Conversation Controls (Context-Dependent)
```
┌─────────────────────────────────────────┐
│        CONVERSATION CONTROLS GROUP      │
├─────────────────────────────────────────┤
│ Priority: Medium                        │
│ Visibility: When conversations active   │
│ Actions: Conversation state management  │
│                                         │
│ [▶ Resume/Start] - Begin conversation   │
│ [⏸ Pause]       - Temporary halt       │
│ [⏹ Stop]        - End conversation     │
└─────────────────────────────────────────┘
```

### Group 3: Active Users Display (Real-time Status)
```
┌─────────────────────────────────────────┐
│         ACTIVE USERS DISPLAY GROUP     │
├─────────────────────────────────────────┤
│ Priority: Medium                        │
│ Visibility: When users are connected    │
│ Actions: Real-time user monitoring      │
│                                         │
│ [👥 Active: N] - Live user count        │
│ [Status LED]   - Connection indicator   │
└─────────────────────────────────────────┘
```

### Group 4: Info & Help (Support Functions)
```
┌─────────────────────────────────────────┐
│           INFO & HELP GROUP             │
├─────────────────────────────────────────┤
│ Priority: Low                           │
│ Visibility: Always visible             │
│ Actions: Information and assistance     │
│                                         │
│ [ℹ️ Info] - App information dialog      │
│ [? Help] - Help and documentation      │
└─────────────────────────────────────────┘
```

### Group 5: User Profile (Personal Controls)
```
┌─────────────────────────────────────────┐
│          USER PROFILE GROUP             │
├─────────────────────────────────────────┤
│ Priority: High                          │
│ Visibility: Always visible             │
│ Actions: User and preference management │
│                                         │
│ [Avatar] - User selector dropdown       │
│ [🎨]     - Color theme selector         │
│ [⚙️]      - Animation preferences       │
└─────────────────────────────────────────┘
```

## 📐 RESPONSIVE DESIGN ARCHITECTURE

### Large Screens (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [☰] [Title]        [Card Controls] [Conv Controls] [Users] [Info] [User Profile] │
│                    Full visibility of all control groups                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Medium Screens (768px - 1023px)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [☰] [Title]       [Card Controls] [Conv Controls] [Users] [⋯] [User Profile] │
│                   Some controls collapsed into overflow menu               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Small Screens (<768px)
```
┌─────────────────────────────────────────────────────────────┐
│ [☰]     [Essential Controls] [⋯] [User]                    │
│         Most controls in overflow menu                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 STATE MANAGEMENT ARCHITECTURE

### Component State Flow
```
Parent Component (Board.jsx)
        │
        ├── Props Flow ────────────► AppHeader Component
        │   ├── onOpenNewCard       ├── Local State
        │   ├── onRefreshCards      │   ├── dialogOpen
        │   ├── onResetLayout       │   ├── helpOpen
        │   ├── onClearBoard        │   └── overflowOpen
        │   ├── activeConversation  │
        │   └── currentUser         ├── Child Components
        │                           │   ├── ClearBoardDialog
        └── Event Callbacks ◄──────     ├── InfoDialog
            ├── Card operations          ├── CompactUserSelector
            ├── Layout changes           └── ActiveUsersDisplay
            └── User interactions
```

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-08-22  
**BRTOPS Compliance**: Enhanced 6-folder structure