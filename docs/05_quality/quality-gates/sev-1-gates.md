# SEV-1 Quality Gates - High Impact Systems

## Overview
SEV-1 features represent high-impact systems with significant complexity. These features require comprehensive quality assurance with reduced manual overhead compared to SEV-0.

## Mandatory Quality Gates

### Automated Gates
- **✅ BUILD CHECK**: `npm run build` must succeed without errors
- **✅ LINT CHECK**: `npm run lint` must pass with zero errors
- **✅ TYPE CHECK**: `npm run typecheck` must pass (if TypeScript)
- **✅ UNIT TEST**: `npm test` must achieve 100% pass rate
- **✅ COV CHECK**: Test coverage must be ≥ 90% for modified code
- **✅ SEC SCAN**: Security vulnerability scan required
- **✅ PERF TEST**: Performance regression testing required

### Manual Gates
- **✅ ARCH REV**: Architecture review required for major changes
- **✅ PEER REV**: 1+ senior developer review required
- **✅ INT TEST**: Integration testing with dependent systems

## Gate Execution Order

1. **Pre-Development**: ARCH REV (for major architectural changes)
2. **Development Phase**: BUILD CHECK, LINT CHECK, TYPE CHECK
3. **Testing Phase**: UNIT TEST, COV CHECK, INT TEST, PERF TEST
4. **Pre-Merge**: PEER REV, SEC SCAN
5. **Production Ready**: All gates must pass

## Examples - Conversation Tracker

### SEV-1 Features in Project
- **React Query Migration**: Complete data management system refactor
  - Required architectural review for migration strategy
  - Comprehensive testing of all data flows
  - Performance validation to ensure no regressions

- **Guest System Expansion**: User management system expansion
  - Integration testing with authentication systems
  - Security review for guest access patterns

## Quality Standards

- **High reliability** in production deployment
- **Comprehensive testing** of all affected systems
- **Performance benchmarking** to prevent regressions
- **Rollback procedures** documented and validated

## Failure Response

**If any SEV-1 gate fails:**
1. **HOLD** deployment until resolution
2. **Root cause identification** and fix implementation
3. **Gate re-execution** with validation
4. **Impact assessment** on dependent systems

## Related Documentation

- Architecture reviews: `../../01_application/1-Architecture/`
- Performance monitoring: `../../01_application/2-Performance-Monitoring/`
- Testing strategy: `../testing/testing-strategy.md`

---

**SEV Level**: High (1)  
**Last Updated**: 2025-08-21  
**Applies To**: Major features, system integrations, performance-critical components