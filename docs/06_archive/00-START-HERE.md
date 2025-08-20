# Project Archive

**Purpose**: Preserved documentation for discontinued, failed, or rolled-back projects  
**Status**: Reference and learning materials only  
**Scope**: Projects that are not part of current application functionality

## Archive Contents

### Failed Projects
- **`major-system-cleanup/`** - SSE consolidation project that broke cross-tab sync (2025-08-20)
  - **Status**: Complete rollback to baseline
  - **Learning Value**: Emergency response protocols, SSE troubleshooting, project classification
  - **Key Documents**: Post-mortem analysis, technical root cause, protocol violations

## Purpose of Archived Documentation

### For Human Developers
- **Failure Analysis**: Understand what went wrong and why
- **Protocol Learning**: See how emergency response protocols were applied
- **Technical Insights**: Learn from architectural decisions that didn't work
- **Pattern Recognition**: Identify similar risks in future projects

### For AI Agents
- **Emergency Protocols**: Reference for handling similar crisis situations
- **Classification Guidelines**: Examples of proper SEV classification and escalation
- **SSE Special Handling**: Critical knowledge about Server-Sent Events complexity
- **Rollback Procedures**: Successful examples of project failure recovery

## Archive Principles

### What Gets Archived
- **Failed Projects**: Projects that were rolled back completely
- **Discontinued Features**: Features that were removed or superseded
- **Experimental Work**: Proof-of-concepts that didn't move to production
- **Emergency Responses**: Crisis situations with valuable learning outcomes

### What Stays Current
- **Active Features**: All working functionality remains in `/docs/02_features/`
- **Ongoing Development**: Current and planned feature work
- **Application Standards**: Core standards and practices in `/docs/01_application/`
- **Recent Learnings**: Fresh insights and improvements

## Accessing Archived Content

### Navigation Guidelines
- **Start with 00-START-HERE.md** in each archived project
- **Check Archive Status** - ensure you understand the project outcome
- **Focus on Learning Value** - extract insights rather than implementation details
- **Verify Current State** - don't assume archived functionality exists in the codebase

### Reference Patterns
- **For Similar Work**: Check archive before starting similar projects
- **For Emergency Response**: Use archived crisis responses as protocol examples
- **For Risk Assessment**: Learn from previous failure modes
- **For Documentation**: Follow established documentation patterns

## Archive Maintenance

### Regular Review
- **Annual Archive Review**: Assess continued learning value
- **Documentation Updates**: Maintain accurate archive status
- **Cross-Reference Updates**: Keep links to archived content accurate
- **Learning Extraction**: Convert archive insights into active guidelines

### Archive Lifecycle
1. **Active Project** - Lives in `/docs/02_features/`
2. **Project Failure/Discontinuation** - Moved to `/docs/06_archive/`
3. **Learning Integration** - Insights moved to active standards/protocols
4. **Long-term Archive** - Preserved for historical reference

---

**Key Principle**: Archive documentation preserves valuable learning while keeping active documentation focused on current functionality. Failed projects often provide the most valuable insights for future success.

*Archive established: 2025-08-20 with major-system-cleanup project failure documentation*