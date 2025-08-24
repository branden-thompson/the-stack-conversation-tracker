# Build Cleanliness Audit Requirements
**MAJOR SYSTEM CLEANUP SEV-0 - LVL-1**

## Primary Objective
Achieve 100% clean Docker build log with zero linting warnings, zero build errors, and all security vulnerabilities resolved.

## Success Criteria
- [x] Docker container builds successfully
- [x] Application compiles without errors
- [ ] Zero ESLint warnings (currently 46 warnings)
- [ ] Zero npm security vulnerabilities (currently 10 vulnerabilities)
- [ ] 100% code quality compliance
- [ ] All anonymous exports converted to named exports
- [ ] All React Hook dependency arrays optimized

## Context & Requirements
Based on comprehensive audit executed 2025-08-24:

### Current Status
- **Build**: ✅ Successful compilation in 3.0s (local) / 9.0s (Docker)
- **Docker**: ✅ Clean container build, no errors
- **Linting**: ⚠️ 46 warnings across 16 files
- **Security**: ⚠️ 10 npm vulnerabilities (3 moderate, 2 high, 5 critical)

### Critical Issues Identified

#### 1. Anonymous Default Exports (10 instances)
- Files violating import/no-anonymous-default-export rule
- Impacts: Code maintainability, debugging, IDE support
- **Location**: `lib/constants/ui/layout.js`, `lib/design-system/`, `lib/factories/`

#### 2. React Hook Dependencies (35 instances)
- `useCallback`/`useMemo`/`useEffect` dependency array issues
- Impact: Performance degradation, potential infinite loops
- **Primary Files**: `lib/factories/`, `lib/hooks/useSSE*`

#### 3. Ref Cleanup Warnings (3 instances)
- Memory leak risk from improper ref cleanup
- **Files**: `useGuestUsers.js`, `usePerformanceMonitor.js`, `useSSESessionEvents.js`

#### 4. NPM Security Vulnerabilities (10 total)
- 5 Critical vulnerabilities
- 2 High vulnerabilities  
- 3 Moderate vulnerabilities
- **Resolution**: `npm audit fix` or manual package updates

## Quality Standards (SEV-0)
1. **Zero Tolerance**: No warnings/errors in production build
2. **Security First**: All vulnerabilities must be resolved
3. **Performance**: Optimized hook dependencies for minimal re-renders
4. **Maintainability**: Named exports for better debugging/refactoring
5. **Documentation**: Complete After Action Report required

## Constraints
- Must preserve all existing functionality
- Cannot break any current features
- Docker build must remain fast and efficient
- Changes must be backward compatible

## Dependencies
- ESLint configuration (current rules must pass)
- Next.js 15 build system
- Docker Alpine container environment
- All existing npm packages and their peer dependencies