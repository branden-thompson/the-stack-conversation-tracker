# SEV Classification System

**Purpose**: Severity classification framework for issues, changes, and projects  
**Derived From**: Major system cleanup failure analysis and emergency response protocols  
**Scope**: All development work, changes, and incident response

## SEV Level Definitions

### SEV-0: Critical System Threats
**Impact**: System stability threats, security incidents, complete functionality loss  
**Response Time**: Immediate (0-15 minutes)  
**Approval Level**: Automatic emergency protocols  
**Examples**:
- Complete application failure
- Security vulnerabilities  
- Data loss incidents
- Real-time infrastructure complete failure

### SEV-1: High Impact / High Risk
**Impact**: Core functionality affected, user experience significantly impacted  
**Response Time**: Within 1 hour  
**Approval Level**: Project lead approval required  
**Examples**:
- **ANY SSE modification or change** (minimum classification)
- Cross-tab synchronization issues
- Real-time feature degradation
- Performance issues affecting all users

### SEV-2: Moderate Impact / Moderate Risk  
**Impact**: Feature functionality issues, some user experience impact  
**Response Time**: Within 4 hours  
**Approval Level**: Team review recommended  
**Examples**:
- Individual feature bugs
- UI/UX issues affecting workflow
- Non-critical performance problems
- Integration issues

### SEV-3: Low Impact / Low Risk
**Impact**: Minor functionality issues, cosmetic problems  
**Response Time**: Within 24 hours  
**Approval Level**: Standard development process  
**Examples**:
- UI styling issues
- Minor usability improvements
- Documentation updates
- Non-critical bug fixes

### SEV-4: Minimal Impact
**Impact**: Cosmetic issues, nice-to-have improvements  
**Response Time**: Within 1 week  
**Approval Level**: Individual developer discretion  
**Examples**:
- Color scheme adjustments
- Text corrections
- Minor layout improvements

### SEV-5: Trivial Impact
**Impact**: Documentation, maintenance, housekeeping  
**Response Time**: As time permits  
**Approval Level**: No approval required  
**Examples**:
- Documentation fixes
- Code comments
- Development tool updates
- Dependency maintenance

## Special Classification Rules

### Server-Sent Events (SSE) Special Handling
**Rule**: All SSE changes = **SEV-1 minimum classification**  
**Rationale**: SSE is critical infrastructure for real-time features  
**Requirements**:
- Cross-tab synchronization testing mandatory
- Rollback plan required before implementation
- Performance impact assessment required
- Emergency response plan documented

**SSE Change Types Requiring SEV-1+**:
- EventSource connection modifications
- Event handler changes
- SSE server endpoint updates
- Event consumption pipeline changes
- Real-time feature modifications
- Performance optimizations affecting SSE

### Real-Time Infrastructure Changes
**Rule**: Real-time infrastructure = **Application-level work**  
**Classification**: SEV-1 minimum, SEV-0 for major changes  
**Scope**: Changes affecting cross-tab synchronization, user presence, collaborative features  
**Requirements**:
- Comprehensive testing across multiple browser tabs
- User impact assessment
- Emergency rollback procedures
- Performance monitoring

### Architecture and Consolidation Projects
**Rule**: Infrastructure consolidation ≠ Simple refactoring  
**Classification**: Based on impact scope, not perceived complexity  
**Considerations**:
- **Application-level changes**: SEV-1 minimum
- **Real-time feature impact**: SEV-0 or SEV-1
- **Multiple system integration**: SEV-1 minimum
- **Performance critical paths**: SEV-1 minimum

## Project Classification Framework

### Application-Level Work (SEV-0 or SEV-1)
**Criteria**: Changes affecting project-wide standards, core infrastructure, or multiple features  
**Examples**:
- Real-time infrastructure changes
- Authentication system modifications  
- Database schema changes
- Build system updates
- Performance critical optimizations

### Feature-Level Work (SEV-1 to SEV-3)
**Criteria**: Changes scoped to individual features or components  
**Examples**:
- New UI components
- Individual feature enhancements
- Specific bug fixes
- Component-level optimizations

### Hygiene Work (SEV-3 to SEV-5)
**Criteria**: Maintenance, cleanup, documentation, and non-functional improvements  
**Examples**:
- Code cleanup
- Documentation updates
- Development tool improvements
- Dependency updates

## Classification Escalation Protocols

### Escalation Triggers
- **Scope Expansion**: Work scope grows beyond original classification
- **Technical Complexity**: Implementation reveals higher complexity
- **Risk Discovery**: New risks identified during development
- **User Impact**: Greater user impact than initially assessed
- **Integration Requirements**: More system integration needed

### Escalation Procedure
1. **Stop Current Work**: Halt implementation immediately
2. **Reassess Classification**: Evaluate new scope/complexity/risk
3. **Update Requirements**: Upgrade safety controls and procedures
4. **Seek Approval**: Get appropriate approval for new classification
5. **Document Changes**: Record classification change and rationale

## Validation Level Framework

### Level-1 Validation (SEV-0, SEV-1)
**Requirements**: Full phase safety checks and approval gates  
**Git Strategy**: **MANDATORY** - Work must occur in dedicated git branch  
**Process**: AN-SOP → PLAN-SOP → DEV-SOP → PDSOP with approvals  
**Documentation**: Complete 6-folder structure required  
**Testing**: Comprehensive testing including cross-tab synchronization

### Level-2 Validation (SEV-2, some SEV-1)
**Requirements**: Analysis and planning validation only  
**Git Strategy**: Branch recommended for complex SEV-2, optional for simple SEV-2  
**Process**: AN-SOP validation + PLAN-SOP recommendation only  
**Documentation**: Analysis and architecture docs required  
**Testing**: Feature-specific testing with integration verification

### Level-3 Validation (SEV-3, SEV-4, SEV-5)
**Requirements**: No approval gates required  
**Git Strategy**: Direct commits to main allowed for simple changes  
**Process**: Auto-proceed with standard development workflow  
**Documentation**: Implementation notes and hygiene tracking  
**Testing**: Standard unit/integration testing

## Emergency Classification

### Crisis Situations
During emergency response, classification may be temporarily elevated:
- **Working Fixes**: Maintain current classification
- **Expanding Scope**: Auto-escalate to next SEV level
- **Multiple Attempts**: Consider SEV-0 escalation
- **User Directive**: Follow user classification override

### Post-Emergency Review
After crisis resolution:
1. **Review Classification**: Was original classification appropriate?
2. **Update Guidelines**: Incorporate new classification insights
3. **Process Improvement**: Enhance classification accuracy
4. **Training Updates**: Share classification lessons learned

## Common Classification Mistakes

### Under-Classification Risks
- **"Simple" Consolidation**: Treating architecture changes as simple refactoring
- **Infrastructure Impact**: Missing application-level implications
- **Real-time Features**: Not recognizing SSE special handling requirements
- **User Experience**: Underestimating collaborative feature importance

### Over-Classification Risks
- **Documentation Changes**: Treating trivial updates as high-risk
- **Cosmetic Improvements**: Over-engineering minor UI changes
- **Development Tools**: Excessive process for internal tooling
- **Maintenance Work**: Complex procedures for routine updates

## Classification Review Process

### Regular Review
- **Monthly Review**: Assessment of classification accuracy
- **Post-Project Analysis**: Did classification match actual complexity?
- **Trend Analysis**: Are we consistently over/under-classifying?
- **Process Refinement**: Improve classification guidelines

### Training and Calibration
- **Classification Examples**: Maintain library of correctly classified projects
- **Decision Trees**: Flowcharts for common classification decisions
- **Team Alignment**: Regular calibration sessions
- **Historical Analysis**: Learn from past classification decisions

---

**Key Principle**: Classification should match actual risk and impact, not perceived simplicity. Better to over-classify and discover lower complexity than under-classify and encounter crisis situations.

**SSE Special Rule**: When in doubt about SSE-related work, always classify as SEV-1 minimum. Real-time features are critical infrastructure requiring special handling.

*Last updated: 2025-08-20 incorporating major-system-cleanup failure learnings*