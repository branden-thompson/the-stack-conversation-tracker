# Documentation

## Overview
This directory contains all project documentation for the Conversation Tracker application.

## Directory Structure

### 📁 `/features/`
Feature-specific documentation including:
- Implementation details
- Architecture decisions
- Feature specifications
- User guides

### 📁 `/project-hygiene/` ⚠️ IMPORTANT FOR AI ASSISTANTS
**All cleanup and maintenance documentation MUST go here:**
- Build cleanup summaries
- Linting and error fixes
- Performance optimizations
- Code refactoring logs
- Technical debt reduction
- Security fixes

**AI Instructions**: When documenting any cleanup, optimization, or hygiene activities, ALWAYS save files in `/project-hygiene/` with the naming format: `YYYY-MM-DD-description.md`

### 📁 `/api/` (if exists)
API documentation and endpoint specifications

### 📁 `/architecture/` (if exists)
System architecture and design documents

## Quick Links
- [Project Hygiene Guidelines](./project-hygiene/README.md)
- [Expanded Guest System](./features/expanded-guest-system.md)
- [Unified User Management](./features/unified-user-management.md)

## For Contributors
When adding new documentation:
1. Place feature docs in `/features/`
2. Place cleanup/hygiene docs in `/project-hygiene/`
3. Use descriptive filenames
4. Include dates in hygiene documentation
5. Update this README with new sections as needed

## For AI Assistants
### Critical Instructions:
1. **Hygiene Work**: Always document in `/project-hygiene/`
2. **Features**: Document in `/features/`
3. **Naming**: Use `YYYY-MM-DD-` prefix for hygiene docs
4. **Metrics**: Include before/after metrics in cleanup docs
5. **Linking**: Update relevant READMEs when adding new docs

---

*Last updated: 2025-08-18*