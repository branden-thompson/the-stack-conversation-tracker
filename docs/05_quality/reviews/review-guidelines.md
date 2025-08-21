# Code Review Guidelines - Conversation Tracker

## Overview
Code review guidelines for maintaining code quality, consistency, and knowledge sharing across the conversation-tracker project.

## Review Requirements by SEV Level

### SEV-0 (Critical)
- **Reviewers**: 2+ senior developers required
- **Scope**: Complete architectural and security review
- **Timeline**: No time pressure - thorough review priority
- **Focus**: Security, performance, system stability

### SEV-1 (High)  
- **Reviewers**: 1+ senior developer required
- **Scope**: Architectural review for major changes
- **Timeline**: 1-2 business days for review
- **Focus**: Architecture consistency, integration impacts

### SEV-2 (Moderate)
- **Reviewers**: 1 developer required
- **Scope**: Code quality and functionality review
- **Timeline**: 24 hours for review
- **Focus**: Code quality, testing adequacy

### SEV-3+ (Low/Minimal)
- **Reviewers**: Optional peer review
- **Scope**: Basic functionality and standards check
- **Timeline**: Same-day or expedited review
- **Focus**: Standards compliance, no regressions

## Review Checklist

### Code Quality
- [ ] Code follows established patterns and conventions
- [ ] Variable and function names are clear and descriptive
- [ ] Code is properly commented where necessary
- [ ] No hardcoded values that should be constants
- [ ] Error handling is appropriate and comprehensive
- [ ] No console.log statements in production code

### Testing
- [ ] Unit tests cover new functionality
- [ ] Integration tests updated if needed
- [ ] Test cases cover edge cases and error conditions
- [ ] Test coverage meets SEV-level requirements
- [ ] Mock data is realistic and comprehensive

### Performance
- [ ] No obvious performance regressions
- [ ] Database queries are optimized
- [ ] Large data sets handled appropriately
- [ ] Memory leaks avoided
- [ ] Expensive operations are cached or optimized

### Security
- [ ] Input validation and sanitization
- [ ] Authentication and authorization checks
- [ ] No sensitive data in logs or responses
- [ ] SQL injection prevention
- [ ] XSS prevention measures

### Architecture
- [ ] Changes align with existing architecture
- [ ] Dependencies are appropriate and minimal
- [ ] Separation of concerns maintained
- [ ] Proper abstractions and interfaces
- [ ] No circular dependencies introduced

## Conversation Tracker Specific Guidelines

### React/Next.js Standards
- [ ] React hooks used appropriately (no rules of hooks violations)
- [ ] Next.js routing and API patterns followed
- [ ] Server-side rendering considerations addressed
- [ ] Client-side state management is appropriate

### SSE Implementation
- [ ] SSE connections managed properly (no memory leaks)
- [ ] Event handling is robust and error-tolerant  
- [ ] Connection state managed correctly
- [ ] Fallback mechanisms in place

### Theme System
- [ ] Theme constants used instead of hardcoded colors
- [ ] Theme switching tested across all components
- [ ] Dark/light mode compatibility maintained
- [ ] User theme preferences respected

### Database Operations
- [ ] Database transactions used appropriately
- [ ] Data validation on both client and server
- [ ] No N+1 query problems
- [ ] Database schema changes documented

## Review Process

### 1. Pre-Review (Author)
- [ ] Self-review completed
- [ ] All automated tests passing
- [ ] Documentation updated
- [ ] Commit messages are clear and descriptive

### 2. Review Submission
- [ ] Pull request description explains changes
- [ ] Links to related issues or documentation
- [ ] Screenshots for UI changes
- [ ] Test plan described

### 3. Review Execution (Reviewer)
- [ ] Code changes understood
- [ ] Testing strategy verified
- [ ] Standards compliance checked
- [ ] Questions and concerns raised

### 4. Review Resolution
- [ ] All reviewer feedback addressed
- [ ] Re-review requested if major changes
- [ ] Approval given with confidence
- [ ] Merge authorized

## Common Issues to Watch For

### React/Next.js Specific
- Improper use of useEffect dependencies
- Missing error boundaries
- Incorrect state management patterns  
- API route security vulnerabilities
- Hydration mismatches

### SSE Specific
- Connection not properly closed
- Memory leaks in event listeners
- Missing error handling for connection failures
- Race conditions in state updates

### Performance Issues
- Unnecessary re-renders in React components
- Large bundle sizes
- Blocking database queries
- Missing indexes on database queries

## Review Documentation

### Required Documentation
- [ ] Code comments for complex logic
- [ ] API documentation for new endpoints
- [ ] Architecture decisions documented
- [ ] Breaking changes highlighted

### Optional Documentation
- [ ] Implementation notes for future reference
- [ ] Performance benchmarks for optimizations
- [ ] Known limitations or technical debt

---

**Project**: Conversation Tracker  
**Last Updated**: 2025-08-21  
**Review Standards**: BRTOPS v1.1.002