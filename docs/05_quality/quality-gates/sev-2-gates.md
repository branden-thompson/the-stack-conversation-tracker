# SEV-2 Quality Gates - Moderate Impact Systems

## Overview
SEV-2 features represent moderate-impact systems with manageable complexity. These features require essential quality gates with streamlined processes.

## Mandatory Quality Gates

### Automated Gates
- **✅ BUILD CHECK**: `npm run build` must succeed without errors
- **✅ LINT CHECK**: `npm run lint` must pass with zero errors
- **✅ UNIT TEST**: `npm test` must achieve 100% pass rate
- **✅ COV CHECK**: Test coverage must be ≥ 80% for modified code
- **✅ SEC SCAN**: Security vulnerability scan (moderate tolerance)

### Manual Gates
- **✅ PEER REV**: 1 developer review required
- **✅ SMOKE TEST**: Basic smoke testing of functionality

## Gate Execution Order

1. **Development Phase**: BUILD CHECK, LINT CHECK
2. **Testing Phase**: UNIT TEST, COV CHECK, SMOKE TEST
3. **Pre-Merge**: PEER REV, SEC SCAN
4. **Production Ready**: All gates must pass

## Examples - Conversation Tracker

### SEV-2 Features in Project
- **Card Flip SSE Safe Implementation**: Enhanced card interaction system
  - Focused testing on card interaction flows
  - Basic security review for SSE integration
  - Smoke testing across different user scenarios

- **SSE Conversation Polling Elimination**: Performance optimization
  - Unit testing of SSE connection handling
  - Performance validation of polling elimination
  - Integration testing with existing SSE infrastructure

- **Unified User Management**: User system consolidation
  - Testing of user switching and state management
  - Review of user data handling procedures
  - Validation of dev/prod environment consistency

## Quality Standards

- **Reliable functionality** for target use cases
- **Adequate test coverage** for modified components
- **Basic security validation** for user-facing features
- **Smoke testing** to ensure core functionality works

## Failure Response

**If any SEV-2 gate fails:**
1. **Fix and re-test** affected components
2. **Validate** fix addresses root cause
3. **Re-execute** failed gates
4. **Document** resolution if significant

## Related Documentation

- Development standards: `../../00_standards_and_practices/development-standards.md`
- Testing strategy: `../testing/testing-strategy.md`
- Review guidelines: `../reviews/review-guidelines.md`

---

**SEV Level**: Moderate (2)  
**Last Updated**: 2025-08-21  
**Applies To**: Standard features, UI enhancements, workflow improvements