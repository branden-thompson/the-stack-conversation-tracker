# Development Infrastructure Documentation

## Overview
This folder contains documentation for development tools, logging systems, automation, and infrastructure components that support the development workflow.

## Contents

### Logging & Debugging
- `DEBUG_LOGGING.md` - Debug logging system and configuration
- `essential-logging.md` - Core logging requirements and patterns

### Development Tools
- `dev-pages-automation.md` - Automated development page generation and test result integration
- `git-hooks-safeguards.md` - Git hooks for safety checks and automated processes
- `user-tracking.md` - User interaction tracking and analytics system

## Related Systems
- Performance monitoring (see `/2-Performance-Monitoring/`)
- Component documentation (see `/5-Component-Systems/`)
- Troubleshooting guides (see `/4-Troubleshooting/`)

## Quick Reference
- **Debug Mode**: Set `DEBUG=true` in environment
- **Git Hooks**: Pre-commit safety checks enabled
- **Dev Pages**: Auto-generated at `/dev/` routes
- **User Tracking**: Session-based analytics with privacy controls