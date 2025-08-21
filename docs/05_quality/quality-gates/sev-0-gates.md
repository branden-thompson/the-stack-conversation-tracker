# SEV-0 Quality Gates - Critical Systems

## Overview
SEV-0 features represent critical systems with extreme complexity and potential for system-wide impact. These features require the highest level of quality assurance and validation.

## Mandatory Quality Gates

### Automated Gates
- **✅ BUILD CHECK**: `npm run build` must succeed without errors
- **✅ LINT CHECK**: `npm run lint` must pass with zero errors  
- **✅ TYPE CHECK**: `npm run typecheck` must pass (if TypeScript)
- **✅ UNIT TEST**: `npm test` must achieve 100% pass rate
- **✅ COV CHECK**: Test coverage must be ≥ 100% for modified code
- **✅ SEC SCAN**: Security vulnerability scan with zero tolerance
- **✅ PERF TEST**: Performance regression testing required
- **✅ LOAD TEST**: Load testing for scalability validation

### Manual Gates  
- **✅ SEC REV**: Security team review required
- **✅ ARCH REV**: Architecture review required
- **✅ PEER REV**: 2+ senior developer reviews required
- **✅ BIZ REV**: Business stakeholder approval required
- **✅ INT TEST**: Integration testing across all dependent systems

## Gate Execution Order

1. **Pre-Development**: ARCH REV, SEC REV, BIZ REV
2. **Development Phase**: BUILD CHECK, LINT CHECK, TYPE CHECK
3. **Testing Phase**: UNIT TEST, COV CHECK, INT TEST, PERF TEST
4. **Pre-Merge**: PEER REV, SEC SCAN, LOAD TEST
5. **Production Ready**: All gates must pass

## Examples - Conversation Tracker

### SEV-0 Features in Project
- **SSE Real-Time Collaboration**: Multi-tab synchronization system
  - Required all automated and manual gates
  - Extensive debugging phase documented
  - Comprehensive AAR completed

## Failure Response

**If any SEV-0 gate fails:**
1. **IMMEDIATE HOLD** on all deployment activities
2. **Root cause analysis** required before proceeding
3. **Fix verification** with full gate re-execution
4. **Documentation update** of failure and resolution

## Quality Standards

- **Zero defects** in production deployment
- **Complete rollback capability** must be demonstrated
- **Monitoring and alerting** must be operational before release
- **Emergency response procedures** must be documented and tested

## Related Documentation

- Security procedures: `../reviews/security-checklist.md`
- Performance standards: `../reviews/performance-checklist.md`
- Testing strategy: `../testing/testing-strategy.md`

---

**SEV Level**: Critical (0)  
**Last Updated**: 2025-08-21  
**Applies To**: Authentication, data integrity, security systems, core infrastructure