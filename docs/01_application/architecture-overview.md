# Conversation Tracker - Architecture Overview

**Last Updated**: 2025-08-20  
**Purpose**: High-level system architecture and core design principles

## System Architecture

### Technology Stack
- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with theme system
- **State Management**: React Query for server state, React Context for app state  
- **Real-time**: Server-Sent Events (SSE) for cross-tab synchronization
- **Data Storage**: JSON file-based storage (development), extensible to database
- **Deployment**: Docker with standalone output mode

### Core Components

#### 1. Real-Time Communication Layer
**Server-Sent Events (SSE)** - Critical for cross-tab synchronization
- **Purpose**: Real-time updates across browser tabs for collaborative features
- **Key Features**: User presence (Active Stackers), card operations, real-time updates
- **Architecture**: Event-driven, unidirectional server-to-client communication
- **Risk Level**: HIGH - Any SSE changes affect core user experience

#### 2. User Management System
**Unified User Management** - Handles both registered and guest users
- **Registered Users**: Persistent preferences, session tracking
- **Guest Users**: 552x name/avatar combinations, temporary preferences
- **Session Management**: Unified session provider across app and dev pages
- **Theme Integration**: User preferences drive theme selection

#### 3. Theme System
**Dynamic Theme Provider** - Multi-dimensional theming
- **Light/Dark Mode**: System/manual toggle support via next-themes
- **Color Themes**: Multiple color scheme options (Gray, Blue, Synthwave84, etc.)
- **Theme Constants**: Centralized theme definitions in `/lib/utils/ui-constants.js`
- **Universal Coverage**: All components must be theme-aware

#### 4. Data Layer
**React Query Integration** - Server state management
- **Query Management**: Centralized query configurations and caching
- **Real-time Integration**: SSE events trigger cache invalidations
- **Performance**: Optimized caching with automatic background updates
- **Safety Controls**: Circuit breakers and fallback mechanisms

## Design Principles

### 1. Real-Time First
- All collaborative features must work in real-time across tabs
- SSE is core infrastructure, not optional enhancement
- Cross-tab synchronization is a primary requirement

### 2. User Experience Consistency
- Theme-aware components throughout the application
- Unified behavior between registered and guest users
- Consistent interaction patterns across all features

### 3. Safety and Reliability
- Circuit breaker patterns for critical operations
- Emergency rollback procedures for all major changes
- Performance monitoring with automatic protection
- Multiple safety switches for feature toggles

### 4. Development Efficiency
- Feature-based documentation structure
- Comprehensive troubleshooting guides
- Standardized development workflows
- Automated testing and quality checks

## Critical Architecture Decisions

### SSE as Core Infrastructure
**Decision**: Use Server-Sent Events for all real-time functionality  
**Rationale**: Simpler than WebSockets, better browser support, unidirectional fits use case  
**Risk**: Any SSE changes are high-risk and require careful handling  
**Mitigation**: Dedicated SSE troubleshooting framework and emergency protocols

### File-Based Data Storage
**Decision**: JSON file storage for development and prototyping  
**Rationale**: Simple, version-controllable, no database setup required  
**Limitation**: Not suitable for production scale  
**Future**: Extensible to database backend without API changes

### Theme System Complexity
**Decision**: Multi-dimensional theming (light/dark + color schemes)  
**Rationale**: Enhanced user experience and accessibility  
**Complexity**: All components must support theme variations  
**Mitigation**: Centralized theme constants and clear patterns

### Docker Standalone Mode
**Decision**: Next.js standalone output for Docker deployment  
**Rationale**: Smaller container size, better performance  
**Setup**: Docker files in `/docker/` directory  
**Benefits**: Production-ready containerization

## Performance Architecture

### Client-Side Performance
- React Query caching reduces unnecessary API calls
- Theme calculations optimized to avoid runtime costs
- Performance monitoring with circuit breakers
- Lazy loading and code splitting where appropriate

### Server-Side Performance  
- SSE connection pooling and management
- Efficient event broadcasting to connected clients
- JSON file operations optimized for read/write patterns
- Resource monitoring and automatic protection

### Development Performance
- Clean development server startup script prevents port conflicts
- Performance monitoring integrated into development workflow
- Automatic detection and mitigation of performance issues

## Security Considerations

### User Data Protection
- Guest user data isolated and temporary
- No sensitive data stored in JSON files
- Secure session management practices

### Development Security
- Environment variables for sensitive configuration
- No secrets in repository
- Docker security best practices

## Extensibility Points

### Database Integration
- Data layer abstracted for easy database migration
- API routes designed for database backend compatibility
- User management system ready for authentication integration

### Enhanced Real-Time Features
- SSE infrastructure ready for expanded real-time capabilities
- Event system designed for additional event types
- Real-time collaboration framework established

### Theme System Extensions
- Color theme system extensible for new themes
- Theme constants pattern supports additional theme dimensions
- Custom theme creation framework in place

## Development Guidelines

### Making Architecture Changes
1. **Assess Impact**: Determine if change affects application-level architecture
2. **Classification**: Use appropriate SEV classification (SSE changes = SEV-1 minimum)
3. **Safety Planning**: Document rollback plan before implementation
4. **Testing**: Verify all real-time functionality after changes
5. **Documentation**: Update application-level docs for significant changes

### Emergency Procedures
- SSE issues require immediate escalation and specialized troubleshooting
- Real-time functionality regression triggers emergency protocols
- Architecture changes affecting multiple features require application-level review

---

**Remember**: This application's architecture prioritizes real-time collaboration and user experience. Any changes that affect SSE, theming, or user management should be treated as high-risk application-level modifications requiring appropriate safety protocols.