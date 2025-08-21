# Testing Strategy - Conversation Tracker

## Overview

The conversation-tracker project uses a comprehensive testing approach covering unit tests, integration tests, and manual testing procedures.

## Current Test Infrastructure

- **Framework**: Jest (via Next.js built-in testing)
- **Coverage Tracking**: Built-in Jest coverage
- **Automation**: Post-commit hooks update dev pages with test results
- **Dev Integration**: `npm run update-dev-data` updates test metrics

## Test Categories

### Unit Tests
- Component functionality
- Hook behavior
- Utility functions
- API endpoints

### Integration Tests
- SSE connections
- Real-time synchronization
- Cross-tab communication
- Theme switching

### Manual Testing
- User experience flows
- Performance validation
- Multi-tab scenarios
- Theme consistency

## Coverage Standards by SEV Level

- **SEV-0**: 100% test coverage required
- **SEV-1**: 90%+ test coverage required  
- **SEV-2**: 80%+ test coverage required
- **SEV-3+**: 70%+ test coverage for modified code

## Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Update dev pages with results
npm run test:update-dev

# Run specific test file
npm test -- --testPathPattern=filename
```

## Quality Gates

All tests must pass before:
- Merging features
- Production deployments
- Major releases

## Related Documentation

- Quality gates: `/docs/05_quality/quality-gates/`
- Performance monitoring: `/docs/01_architecture/2-Performance-Monitoring/`
- Dev automation: `/docs/01_architecture/3-Development-Infrastructure/`