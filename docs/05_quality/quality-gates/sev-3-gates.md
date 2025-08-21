# SEV-3+ Quality Gates - Low Impact Systems

## Overview
SEV-3, SEV-4, and SEV-5 features represent low to minimal impact systems with simple to trivial complexity. These features require basic quality gates with minimal overhead.

## Mandatory Quality Gates

### Automated Gates
- **✅ BUILD CHECK**: `npm run build` must succeed without errors
- **✅ LINT CHECK**: `npm run lint` must pass with zero errors
- **✅ BASIC TEST**: Core functionality testing

### Manual Gates
- **⚠️ PEER REV**: Optional peer review (recommended for SEV-3, optional for SEV-4/5)

## Gate Execution Order

1. **Development Phase**: BUILD CHECK, LINT CHECK
2. **Testing Phase**: BASIC TEST (manual or automated)
3. **Pre-Merge**: Optional PEER REV
4. **Production Ready**: Automated gates must pass

## Coverage Requirements

- **SEV-3**: 70%+ test coverage for modified code
- **SEV-4**: 50%+ test coverage for modified code  
- **SEV-5**: Basic functionality validation

## Examples - Conversation Tracker

### SEV-3 Features in Project
- **User Selectable Themes**: Color theme selection system
  - Basic testing of theme switching functionality
  - Visual validation across different themes
  - Simple integration testing with user preferences

- **User Theme Mode Isolation**: Per-user theme management
  - Testing of theme isolation between users
  - Validation of theme persistence
  - Basic UI consistency checks

### SEV-4 Features in Project  
- **Dev Scripts Visual Polish**: Development interface improvements
  - Visual validation of UI improvements
  - Basic functionality testing of enhanced interfaces
  - Minimal regression testing

### SEV-5 Features (Tweaks and Fixes)
- Documentation updates
- Minor UI adjustments
- Cosmetic improvements
- Typo fixes

## Quality Standards

- **Basic functionality** must work as intended
- **No regressions** in existing functionality
- **Build stability** maintained
- **Code quality** standards met (linting)

## Failure Response

**If any SEV-3+ gate fails:**
1. **Quick fix** implementation
2. **Basic validation** of fix
3. **Re-run** failed gates
4. **Minimal documentation** of resolution

## Fast-Track Process

For SEV-4/5 features:
- **Expedited review** process
- **Minimal testing** requirements
- **Quick deployment** pipeline
- **Post-deployment monitoring** for unexpected issues

## Related Documentation

- Development workflow: `../../00_standards_and_practices/development-standards.md`
- Basic testing: `../testing/testing-strategy.md`

---

**SEV Levels**: Low (3), Minimal (4), Trivial (5)  
**Last Updated**: 2025-08-21  
**Applies To**: UI tweaks, minor features, documentation, cosmetic improvements