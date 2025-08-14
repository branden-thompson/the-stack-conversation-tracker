# Testing Guide

This project uses **Vitest** with **React Testing Library** for comprehensive testing.

## Directory Structure

```
__tests__/
├── __mocks__/              # Global mocks (lowdb, etc.)
├── fixtures/               # Test data and mock objects
├── utils/                  # Test utilities and helpers
├── unit/                   # Unit tests
│   ├── hooks/             # Custom hook tests
│   ├── components/        # Component tests  
│   └── utils/             # Utility function tests
└── integration/           # Integration tests
    ├── api/               # API route tests
    └── workflows/         # End-to-end workflow tests
```

## Test Scripts

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage

# Watch mode with specific pattern
npm run test -- --watch hooks
```

## Writing Tests

### Unit Tests
- **Hooks**: Test custom hooks in isolation with `@testing-library/react-hooks`
- **Components**: Test component rendering and user interactions
- **Utils**: Test pure functions and utilities

### Integration Tests
- **API Routes**: Test full request/response cycles
- **Workflows**: Test complete user workflows (create card → UI update → API call)

## Test Utilities

### Custom Render
```typescript
import { render } from '../utils/test-utils'
// Renders with all necessary providers (Theme, DnD context)
```

### Fixtures
```typescript
import { mockCard, mockCards } from '../fixtures/cards'
// Pre-built test data for consistent testing
```

### API Mocking
```typescript
import { handlers } from '../utils/api-mocks'
// MSW handlers for API route mocking
```

## Coverage Goals

- **Branches**: 70%
- **Functions**: 70%  
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

1. **Arrange-Act-Assert** pattern
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test edge cases and error conditions**
6. **Keep tests focused and independent**