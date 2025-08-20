# Development Standards and Best Practices

**Purpose**: Project-wide development standards, patterns, and architectural guidelines  
**Derived From**: Major system cleanup failure analysis and successful project patterns  
**Scope**: All development work in the Conversation Tracker application

## Core Development Principles

### 1. Functional Preservation is Non-Negotiable
- **Working System > Clean Architecture** - Always prioritize functionality over code aesthetics
- **Regression Prevention** - Any change that breaks existing functionality is unacceptable
- **User Experience First** - Technical improvements must not degrade user experience
- **Rollback Readiness** - Every significant change must have a documented rollback plan

### 2. Real-Time Features Require Special Handling
- **SSE as Critical Infrastructure** - Server-Sent Events are core to application functionality
- **Cross-Tab Testing Mandatory** - All real-time changes must be tested across browser tabs
- **Client-Server Pipeline** - Success on server-side does not guarantee client-side success
- **Performance Impact Assessment** - Real-time features affect overall application performance

### 3. Architecture Change Recognition
- **Consolidation ≠ Simple Refactoring** - Combining systems is architectural work, not maintenance
- **Infrastructure Impact Assessment** - Changes affecting multiple features = application-level work
- **Scope Escalation Awareness** - Implementation may reveal greater complexity than initially apparent
- **Classification Accuracy** - Match development process to actual risk and complexity

## Project Classification Guidelines

### Application-Level Changes
**Recognition Criteria**:
- Affects project-wide standards or practices
- Touches real-time infrastructure (SSE, WebSockets)
- Modifies core user management or authentication
- Changes build system, deployment, or performance critical paths
- Impacts multiple features or cross-cutting concerns

**Development Requirements**:
- SEV-1 classification minimum
- Complete documentation structure (6-folder system)
- Comprehensive testing including cross-tab synchronization
- Rollback plan documented before implementation
- Post-implementation validation across all affected features

### Feature-Level Changes
**Recognition Criteria**:
- Scoped to individual features or components
- UI/UX improvements within existing functionality
- New features that don't affect existing systems
- Bug fixes with isolated impact

**Development Requirements**:
- SEV-2 or SEV-3 classification typically
- Feature-specific documentation and testing
- Integration testing with related components
- Standard code review and approval process

### Hygiene-Level Changes  
**Recognition Criteria**:
- Code cleanup and refactoring without functional changes
- Documentation updates and improvements
- Development tooling and process improvements
- Dependency updates and maintenance

**Development Requirements**:
- SEV-4 or SEV-5 classification
- Minimal approval process
- Focus on documentation and maintainability
- Verify no functional impact

## SSE Development Standards

### Mandatory Requirements for SSE Changes
1. **Classification**: SEV-1 minimum for any SSE modification
2. **Cross-Tab Testing**: Test synchronization across multiple browser tabs
3. **Performance Monitoring**: Measure impact on application performance  
4. **Rollback Plan**: Document restoration procedure before implementation
5. **Emergency Procedures**: Reference SSE troubleshooting framework

### SSE Change Categories
**High-Risk Changes** (SEV-0 or SEV-1):
- EventSource connection management modifications
- Event consumption pipeline changes
- Real-time feature architecture changes
- SSE server infrastructure updates
- Performance optimizations affecting event delivery

**Medium-Risk Changes** (SEV-1):  
- Individual event handler modifications
- Component subscription pattern updates
- Event payload structure changes
- Error handling improvements

**Lower-Risk Changes** (SEV-1 minimum):
- Logging and debugging enhancements
- Event filtering improvements
- Connection status monitoring
- Performance metrics collection

### SSE Testing Requirements
- **Multi-Tab Testing**: Open 2+ tabs, verify real-time synchronization
- **Connection Stability**: Test connection recovery and reconnection
- **Performance Impact**: Monitor resource usage and response times
- **Error Scenarios**: Test network failures and recovery
- **Cross-Browser Compatibility**: Verify EventSource support

## Code Quality Standards

### Architecture Patterns
- **Separation of Concerns** - Clear boundaries between components
- **Dependency Injection** - Avoid tight coupling between systems
- **Error Handling** - Comprehensive error handling with user feedback
- **Performance Consideration** - Monitor and optimize resource usage
- **Security Best Practices** - No secrets in code, secure data handling

### Component Development
- **Theme Awareness** - All UI components must support theme variations
- **Accessibility** - Follow WCAG guidelines for user accessibility
- **Responsive Design** - Components work across device sizes
- **Testing Coverage** - Unit tests for logic, integration tests for interactions
- **Documentation** - Clear documentation for component APIs

### Data Management
- **React Query Integration** - Use established query patterns for server state
- **Cache Management** - Proper cache invalidation and updates
- **State Management** - Clear patterns for local vs server state
- **Data Validation** - Client and server-side validation
- **Error Recovery** - Graceful handling of data loading failures

## Development Workflow Standards

### Pre-Development Phase
1. **Requirement Clarity** - Clear understanding of what needs to be built
2. **Risk Assessment** - Identify potential complications and dependencies
3. **Classification Decision** - Proper SEV classification based on actual impact
4. **Planning Documentation** - Architecture decisions and implementation plan
5. **Success Criteria** - Clear definition of what constitutes successful completion

### Implementation Phase
1. **Incremental Development** - Small, testable increments with frequent commits
2. **Safety Controls** - Circuit breakers and emergency shutoffs where appropriate
3. **Testing Integration** - Testing throughout development, not just at the end
4. **Documentation Updates** - Keep documentation current with implementation
5. **Progress Communication** - Regular updates on development progress

### Validation Phase
1. **Functional Testing** - Verify all requirements met
2. **Integration Testing** - Ensure compatibility with existing systems
3. **Performance Testing** - Measure impact on application performance
4. **User Experience Testing** - Validate user workflow and experience
5. **Rollback Testing** - Verify rollback procedures work correctly

## Emergency Development Standards

### Crisis Response Principles
- **Stop Adding Complexity** - Emergency fixes should simplify, not complicate
- **Single Focus** - Address one specific issue at a time
- **User Directive Compliance** - Follow user instructions immediately
- **Documentation Continuation** - Maintain documentation even during crisis
- **Preservation Planning** - Prepare to preserve work if rollback needed

### Prohibited During Emergencies
- **Feature Addition** - No new capabilities during crisis response
- **Architecture Changes** - No structural modifications
- **Multiple Parallel Approaches** - One fix attempt at a time
- **Scope Expansion** - Stick to original problem only

### Permitted During Emergencies
- **Targeted Fixes** - Address specific broken functionality
- **Safety Additions** - Add circuit breakers or emergency controls
- **Debugging Enhancement** - Add logging for troubleshooting
- **Rollback Preparation** - Prepare restoration procedures

## Quality Assurance Standards

### Code Review Requirements
- **Architecture Review** - For application-level changes
- **Security Review** - For authentication, data handling, or API changes
- **Performance Review** - For changes affecting critical paths
- **SSE Special Review** - For any real-time feature modifications
- **Documentation Review** - Ensure documentation matches implementation

### Testing Standards
- **Unit Testing** - Business logic and utility functions
- **Integration Testing** - Component interactions and API integrations
- **End-to-End Testing** - User workflows and critical paths
- **Performance Testing** - Response times and resource usage
- **Cross-Tab Testing** - Real-time feature synchronization

### Documentation Standards
- **API Documentation** - Clear documentation for all public APIs
- **Component Documentation** - Usage examples and prop documentation
- **Architecture Documentation** - System design and decision rationale
- **Troubleshooting Guides** - Common issues and resolution procedures
- **Learning Documentation** - Capture insights and lessons learned

## Continuous Improvement

### Learning Integration
- **Post-Project Reviews** - What worked well, what could be improved
- **Process Refinement** - Regular updates to development standards
- **Knowledge Sharing** - Team learning from individual experiences
- **Documentation Updates** - Keep standards current with best practices

### Standards Evolution
- **Regular Review** - Quarterly assessment of standards effectiveness
- **Industry Best Practices** - Incorporate external learnings
- **Tool Updates** - Adapt to new development tools and technologies
- **Team Feedback** - Incorporate developer experience feedback

---

**Key Principle**: Development standards should enable high-quality, maintainable code while preventing the types of failures experienced in past projects. Standards evolve based on real project experience and lessons learned.

**Remember**: "Working system" > "Clean architecture" always. These standards support building reliable, maintainable systems that preserve user experience above all else.

*Last updated: 2025-08-20 incorporating major-system-cleanup failure analysis and successful project patterns*