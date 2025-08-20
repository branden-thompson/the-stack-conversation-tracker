# Application Level Documentation

**Purpose**: Project-wide standards, practices, core architecture, and application-level troubleshooting  
**Scope**: Standards and practices that apply across the entire Conversation Tracker application

## Navigation

### 📊 1. Architecture 
`/1-Architecture/` - System architecture, data flows, and technical references
- `data-event-flow-human-readable.md` - Human-readable data flow diagrams
- `data-event-flow-technical.md` - Technical reference for AI agents
- `Real-Time-Collaboration-Options.md` - SSE implementation planning
- `repeated-constants-analysis.md` - Constants consolidation analysis

### ⚡ 2. Performance Monitoring
`/2-Performance-Monitoring/` - Performance tracking and safety controls
- `performance-monitoring-safety-controls.md` - Emergency controls and circuit breakers
- `realtime-runtime-perf-monitoring.md` - Real-time performance tracking

### 🛠️ 3. Development Infrastructure 
`/3-Development-Infrastructure/` - Development tools and automation
- `DEBUG_LOGGING.md` - Debug logging system
- `dev-pages-automation.md` - Automated development pages
- `git-hooks-safeguards.md` - Git hooks and safety checks
- `user-tracking.md` - User analytics and session tracking

### 🔧 4. Troubleshooting
`/4-Troubleshooting/` - Issue resolution and debugging guides
- `docker-build-issues.md` - Docker build troubleshooting
- `sse-troubleshooting.md` - Server-Sent Events issues
- `3d-card-flip-animation-restoration.md` - Animation debugging
- `user-dynamic-color-theme-issues.md` - Theme system issues

### 🧩 5. Component Systems
`/5-Component-Systems/` - Reusable component documentation
- `card-type-constants.md` - Card type system and constants
- `ui-constants.md` - Application-wide UI constants
- `compact-user-selector.md` - User selection components

### 📋 Application-Level Files
- `architecture-overview.md` - High-level application architecture
- `port-management.md` - Port configuration and conflict management  
- `project-organization-summary.md` - Project structure overview

### 🏗️ Major System Projects
- `system-analysis-and-cleanup/` - Major system cleanup project (6-folder structure)

## Key Application Concepts

### Real-Time Architecture
This application heavily relies on Server-Sent Events (SSE) for real-time cross-tab synchronization. Any changes to SSE infrastructure should be treated as **application-level architecture changes** requiring appropriate classification and safety protocols.

### Theme System  
The application uses a sophisticated theme system with both light/dark mode and color theme variations. All UI components must be theme-aware using the established theme constants.

### User Management
Unified user management system handles both registered users and guest users with comprehensive preference management and session tracking.

### Development Safety
Multiple safety systems are in place including circuit breakers, performance monitoring, emergency rollback procedures, and development server management scripts.

---

**Important**: Application-level documentation changes should be carefully reviewed as they affect project-wide standards and practices that all feature development must follow.

*Last updated: 2025-08-20 during documentation structure restoration*