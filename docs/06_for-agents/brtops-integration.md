# BRTOPS Integration - Conversation Tracker Project

## Framework Status
**🎖️ BRTOPS v1.0.000 ACTIVE**
- Framework: Military-precision development operations
- Integration: Complete with project-specific adaptations
- Repository: https://github.com/branden-thompson/brtops

## Project BRTOPS Configuration

### Default Settings
- **Guide Mode**: GUIDE AUTO (adaptive to user experience)
- **Collaboration Mode**: COLLAB (equal partnership default)
- **Quality Gates**: Enabled for all SEV levels
- **Emergency Procedures**: ABORT, OPSCHECK, ROLLBACK available

### Project-Specific SEV Classifications

#### SEV-0 (Critical) - Examples:
- User authentication system changes
- Database schema modifications
- SSE system alterations
- Security-related features
- Multi-tab collaboration core features

#### SEV-1 (High) - Examples:
- React Query migrations
- Theme system major changes
- User management system updates
- Performance-critical features

#### SEV-2 (Moderate) - Examples:
- UI component implementations
- Theme mode isolation features
- Dev tools enhancements
- Non-critical feature additions

#### SEV-3+ (Low/Minimal) - Examples:
- Documentation updates
- Minor styling adjustments
- Console.log cleanup
- Linting fixes

### Project-Specific Quality Gates

#### Automated Gates
- **BUILD CHECK**: `npm run build` must pass
- **LINT CHECK**: `npm run lint` must pass  
- **TYPE CHECK**: `npm run typecheck` must pass
- **TEST CHECK**: `npm run test` must pass

#### Manual Gates
- **PEER REV**: Code review for SEV-0, SEV-1 features
- **THEME TEST**: Cross-theme compatibility verification
- **BROWSER TEST**: Cross-browser compatibility check
- **SSE TEST**: Multi-tab collaboration verification (when applicable)

### Project Command Adaptations

#### Development Commands
```bash
# Project-specific implementations
GO CODE       → npm run dev (start development server)
BUILD CHECK   → npm run build
LINT CHECK    → npm run lint  
TYPE CHECK    → npm run typecheck
TEST CHECK    → npm run test
```

#### Docker Integration
```bash
# Docker-specific workflows
GO DEPLOY     → cd docker && docker-compose up
BUILD CHECK   → cd docker && docker-compose build
CONTAINER TEST → Docker container health verification
```

## BRTOPS Command Usage in This Project

### Phase Commands Applied
- **GO RCC**: Requirements gathering for new features
- **GO PLAN**: Architecture planning for major features
- **GO CODE**: Implementation with live reload development  
- **GO FINAL**: Quality checks including build, lint, typecheck
- **GO VAL**: Testing in development and Docker environments
- **DEBRIEF**: AAR generation with project-specific metrics

### Control Commands Applied  
- **GOFLIGHT**: Auto-proceed through development phases
- **SITREP**: Project status with current branch, recent changes
- **OPSCHECK**: System health including Docker, dev server, dependencies
- **HOLD/RESUME**: Pause/continue development work

### Collaboration Commands Applied
- **HUM LEAD**: Human-led for architecture and UX decisions
- **AI LEAD**: AI-led for implementation and testing tasks  
- **COLLAB**: Equal partnership for problem-solving and debugging

### Process Commands Applied
- **BAG TAG**: Legacy code cleanup after successful migrations
- **AAR**: After action reports in `/docs/04_after-action-reports/`

## Integration with Existing Project Conventions

### Documentation Integration
- BRTOPS AAR reports go in `/docs/04_after-action-reports/`
- Feature documentation follows existing structure in `/docs/02_features/`
- Hygiene work documented in `/docs/project-hygiene/` (existing pattern)

### Development Workflow Integration
- BRTOPS commands complement existing npm scripts
- Quality gates integrate with existing testing infrastructure
- Emergency procedures work with existing safety switches

### Git Integration
- Commit messages can reference BRTOPS phases and commands
- Branch naming can include SEV classifications
- Tags can reference BRTOPS version milestones

## Project-Specific Emergency Procedures

### ABORT Command Response
1. Stop development server (`Ctrl+C`)
2. Preserve current branch state
3. Document current status in SITREP format
4. Offer rollback to last stable commit
5. Check for unsaved changes

### OPSCHECK Command Response
1. Verify development server status
2. Check Docker container health (if running)
3. Validate database connection (if applicable)
4. Review recent git commits
5. Check npm dependencies status
6. Verify theme system status
7. Test SSE system health (if applicable)

## Success Metrics Integration

### Quality Metrics
- Build success rate
- Test coverage percentage  
- Lint error count
- TypeScript error count
- Theme compatibility score

### Development Metrics
- Feature completion time
- Bug resolution time
- Code review turnaround
- Documentation completeness

### Project Health Metrics
- Dependencies freshness
- Security vulnerability count
- Performance benchmark results
- Docker container efficiency

---

**BRTOPS Integration Status**: ✅ **OPERATIONAL**  
**Last Updated**: 2025-08-21  
**Framework Version**: 1.0.000  
**Project Compatibility**: Full integration with existing workflows