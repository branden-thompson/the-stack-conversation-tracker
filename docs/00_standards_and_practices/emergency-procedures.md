# Emergency Procedures and Protocols

**Purpose**: Emergency response protocols for critical failures and crisis situations  
**Derived From**: Major system cleanup failure analysis (2025-08-20)  
**Scope**: Application-level emergency response for all project types

## Development Circuit Breaker Protocol

### Automatic Escalation Triggers
- **3+ consecutive failed fix attempts** on same issue
- **Debugging becomes harder instead of easier** after attempted fixes
- **User directive "NO STOP"** or "HALT WORK" issued
- **Functional regression** in core features detected
- **Emergency fixes creating architectural chaos**

### Circuit Breaker Response
1. **IMMEDIATE HALT**: Stop all implementation work
2. **Assessment Window**: 15-minute maximum for rollback decision
3. **Escalation Options**:
   - **Clear fix identified + testable within 30 minutes**: Proceed with single targeted fix
   - **Root cause unclear or complex**: IMMEDIATE ROLLBACK to last working state
   - **Multiple systems needed**: IMMEDIATE ROLLBACK (architectural problem)
4. **Override Requirements**: Explicit user approval + time-boxed constraint

### User Directive Compliance

#### "NO STOP" Protocol
- **Immediate Action**: Halt all current implementation
- **No Exceptions**: Do not attempt alternative approaches
- **Assessment Only**: Analyze situation but make no code changes
- **User Communication**: Report status and await further direction

#### "HALT WORK" / "FAIL STATE" Protocol  
- **Emergency Stop**: All development work ceases immediately
- **Preserve State**: Save current work to branch for analysis
- **Documentation**: Begin failure analysis documentation
- **Rollback Assessment**: Evaluate rollback options and present to user

## Emergency Fix Scope Control

### Prohibited During Emergencies
- **Feature Addition**: No new features or capabilities
- **Architecture Changes**: No structural modifications
- **Multiple Parallel Systems**: No competing implementations
- **Scope Expansion**: No expanding beyond immediate issue

### Permitted During Emergencies
- **Single Targeted Fix**: Address specific broken component only
- **Safety Controls**: Add circuit breakers or emergency shutoffs
- **Logging Enhancement**: Add debugging information only
- **Rollback Preparation**: Prepare restoration procedures

## Rollback Decision Framework

### Early Rollback Indicators
- **2+ failed attempts** at fixing same core issue
- **User impact expanding** beyond original scope
- **Debugging complexity increasing** rather than decreasing
- **Core functionality regression** detected
- **Time investment > potential benefit**

### Rollback Execution
1. **Immediate**: Identify last known working commit
2. **Preserve**: Save failed work to analysis branch  
3. **Restore**: Execute clean rollback procedure
4. **Validate**: Verify functionality restoration
5. **Document**: Complete failure analysis for learning

## Crisis Communication Protocols

### Internal Escalation
- **Status Updates**: Report situation immediately upon detection
- **Decision Points**: Present clear options with trade-offs
- **User Approval**: Seek explicit approval for any continued work
- **Regular Check-ins**: Update status every 15-30 minutes during crisis

### Documentation During Crisis
- **Real-time Logging**: Document all actions taken
- **Decision Rationale**: Record reasoning for each decision
- **Timeline Tracking**: Maintain chronological record
- **Learning Capture**: Note insights for post-crisis analysis

## Post-Emergency Procedures

### Immediate Post-Crisis (First Hour)
1. **Functionality Validation**: Verify all systems working
2. **Impact Assessment**: Document what was affected
3. **Timeline Creation**: Chronological account of events
4. **Initial Lessons**: Capture immediate insights

### Follow-up Analysis (Within 24 Hours)
1. **Root Cause Analysis**: Technical deep dive
2. **Process Review**: Emergency response effectiveness
3. **Prevention Planning**: How to avoid similar issues
4. **Documentation Updates**: Incorporate learnings into standards

## Project-Specific Emergency Protocols

### SSE-Related Emergencies
- **Immediate Classification**: All SSE issues = SEV-1 minimum
- **Cross-tab Testing**: Mandatory for all SSE changes
- **Server vs Client**: Isolate failure location immediately
- **Rollback Readiness**: SSE rollback plan required before any changes

### Real-time Feature Emergencies
- **User Impact**: Real-time failures immediately visible to users
- **Collaborative Disruption**: Loss of collaborative functionality
- **Multi-tab Synchronization**: Test across browser tabs required
- **Performance Monitoring**: Resource impact assessment

### Infrastructure Emergencies
- **Application-level Impact**: Infrastructure changes affect entire system
- **Classification Escalation**: Infrastructure = Application-level work
- **Safety Controls**: Multiple circuit breakers required
- **Rollback Complexity**: More complex restoration procedures

## Emergency Contacts and Resources

### Internal Resources
- **Clean Start Script**: `./dev-scripts/clean-start-dev.sh`
- **SSE Troubleshooting**: `/docs/05_for-agents/sev-0-sse-troubleshooting-framework.md`
- **Port Management**: `/docs/01_application/port-management.md`
- **Git Rollback Procedures**: Standard git operations

### Emergency Documentation
- **Document Location**: `/docs/06_archive/` for failed projects
- **After Action Reports**: `/docs/04_after-action-reports/`
- **Agent Guidelines**: `/docs/05_for-agents/`
- **Application Standards**: `/docs/01_application/`

## Training and Preparation

### Regular Drills
- **Rollback Practice**: Regular git rollback exercises
- **Emergency Response**: Practice emergency protocols
- **Documentation Review**: Quarterly review of procedures
- **Scenario Planning**: Consider potential failure modes

### Knowledge Maintenance
- **Protocol Updates**: Incorporate learnings from actual emergencies
- **Tool Familiarity**: Maintain proficiency with emergency tools
- **Communication Practice**: Clear crisis communication patterns
- **Decision Making**: Practice rapid decision-making under pressure

---

**Key Principle**: Emergency response prioritizes system stability and user functionality over architectural idealism. Quick, decisive action with proper documentation prevents small issues from becoming major failures.

**Remember**: "Working system" > "Clean architecture" always. Rollback courage is good engineering practice, not failure.

*Last updated: 2025-08-20 based on major-system-cleanup failure analysis*