# The Stack Conversation Tracker

A Next.js web application designed to help track and manage conversation evolution in real-time. It's a sophisticated digital conversation board that combines visual organization with detailed event tracking.

## Core Functionality

### 1. Visual Conversation Board
- **4-Zone Drag-and-Drop Interface**: Active Conversation, Parking Lot, Resolved, and Unresolved zones
- **Resizable panels** that can be customized and reset
- **Card-based system** where each conversation element is represented as a movable card
- **Real-time drag-and-drop** with collision detection and auto-stacking

### 2. Card Types System
The app supports 6 different types of conversation cards, each color-coded:
- **TOPIC** (gray) - Main conversation subjects
- **QUESTION** (blue) - Open questions being discussed
- **ACCUSATION** (red) - Claims or allegations made
- **FACT** (yellow) - Factual statements or objective information
- **GUESS** (purple) - Hypotheses or speculative statements
- **OPINION** (pink) - Personal viewpoints or subjective statements

### 3. Real-Time Conversation Tracking
- **Start/Pause/Resume/Stop** conversation sessions with timing
- **Event logging** that tracks every action (card creation, moves, updates, deletions)
- **Live runtime display** showing how long conversations have been active
- **Persistent conversation history** with timestamps

### 4. Developer Console
- **Dev page** (`/dev/convos`) for monitoring conversation data
- **Real-time event stream** showing all card operations
- **Event filtering and searching** by type, content, or timeframe
- **Timeline visualization** of conversation flow
- **JSON payload inspection** for debugging

### 5. Keyboard Shortcuts
- `Ctrl+N` - New topic card
- `Ctrl+Q` - New question card  
- `Ctrl+A` - New accusation card
- `Ctrl+F` - New fact card
- `Ctrl+O` - New opinion card
- `Ctrl+G` - New guess card
- Layout reset and deletion shortcuts

## Technical Architecture

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with dark mode support
- **Drag & Drop**: @dnd-kit for sophisticated DnD interactions
- **UI Components**: Radix UI primitives with custom styling
- **Database**: LowDB (JSON file-based) for local data persistence
- **Testing**: Vitest with comprehensive test coverage
- **State Management**: Custom React hooks for centralized logic

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development Tools

- **Main App**: [http://localhost:3000](http://localhost:3000) - The main conversation board
- **Dev Console**: [http://localhost:3000/dev/convos](http://localhost:3000/dev/convos) - Monitor conversations and events

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Use Cases

This tool is designed for scenarios like:
- **Meeting facilitation** - Track discussion topics and their resolution status
- **Conflict resolution** - Organize accusations, facts, and opinions systematically  
- **Investigation tracking** - Categorize information as it emerges
- **Workshop facilitation** - Manage ideas and questions during collaborative sessions
- **Therapy or counseling sessions** - Track conversation themes and progress
- **Project planning** - Organize tasks and decisions across different states

## Key Features

- **Local-first**: All data stored locally (no external dependencies)
- **Real-time**: Live updates and timing
- **Visual**: Intuitive drag-and-drop interface
- **Persistent**: Conversations and events are saved
- **Extensible**: Well-architected for adding new features
- **Accessible**: Keyboard shortcuts and proper UI patterns

The app essentially turns conversations into a visual, trackable, and organizeable workflow - perfect for anyone who needs to manage complex discussions or decision-making processes systematically.
