# Application Level Documentation

**Purpose**: Project-wide standards, practices, core architecture, and application-level troubleshooting  
**Scope**: Standards and practices that apply across the entire Conversation Tracker application

## Navigation

### 📋 Application Standards
- `development-standards.md` - Coding standards, patterns, and best practices
- `architecture-overview.md` - High-level system architecture and design principles
- `performance-standards.md` - Performance monitoring and optimization guidelines

### 🔧 Development Environment
- `local-development-setup.md` - Complete local development environment setup
- `docker-deployment.md` - Docker configuration and deployment procedures
- `testing-standards.md` - Testing approaches, frameworks, and coverage requirements

### 🛠️ Troubleshooting
- `common-issues.md` - Frequently encountered issues and their solutions
- `sse-troubleshooting.md` - Server-Sent Events specific troubleshooting
- `port-management.md` - Development server port conflicts and management
- `cross-tab-sync-issues.md` - Real-time cross-tab synchronization troubleshooting

### 🚨 Emergency Procedures
- `emergency-rollback.md` - Emergency rollback procedures and protocols
- `sev-classification.md` - Severity classification system for issues
- `circuit-breaker-protocols.md` - Development circuit breaker and safety procedures

### 📊 Project Health
- `health-monitoring.md` - Application health monitoring and alerting
- `performance-baselines.md` - Performance baselines and regression detection
- `dependency-management.md` - Package management and security practices

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