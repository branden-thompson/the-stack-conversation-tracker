# Agent Terminology Dictionary

## Authorization Terms

### GOFLIGHT
**Definition**: User authorization term meaning "Proceed", "Go", "Approved to Next Step"  
**Usage**: When user says "GOFLIGHT", proceed immediately with next planned action without additional confirmation  
**Context**: Flight operations terminology adopted for development workflow approval  
**Application**: Auto-proceed with current task, phase, or implementation step

**Examples**:
- User: "GOFLIGHT" → Begin Phase 1 debugging immediately
- User: "Debug plan looks good, GOFLIGHT" → Start implementation without further approval
- User: "GOFLIGHT to production" → Deploy to production environment

## Development Process Terms

### Bag-n-Tag / Bag and Tag / Bag n Tag
**Definition**: Post-success legacy code cleanup process  
**Applied**: After successful major feature implementation or migration  
**Process**: Move legacy code to `/deprecated` folders with proper headers

### AN-SOP, PLAN-SOP, DEV-SOP, PDSOP
**Definition**: Standard Operating Procedures for development lifecycle
- **AN-SOP**: Analysis Standard Operating Procedures
- **PLAN-SOP**: Planning Standard Operating Procedures  
- **DEV-SOP**: Development Operating Procedures
- **PDSOP**: Post Development Standard Operating Procedures

### SEV Classification
**Definition**: Severity-Based Enhancement classification system
- **SEV-0**: System stability threats, security incidents
- **SEV-1**: Performance issues, data integrity problems
- **SEV-2**: Feature functionality issues
- **SEV-3**: UI/UX issues
- **SEV-4**: Cosmetic issues
- **SEV-5**: Documentation fixes

## Feature Classifications

### MAJOR Features
**Definition**: Complex features requiring full lifecycle (AN-SOP → PLAN-SOP → DEV-SOP → PDSOP)
**Examples**: SSE Real-Time Collaboration, User Authentication System

### MINOR Features  
**Definition**: Standard features with streamlined process (DEV-SOP → PDSOP)
**Examples**: New UI components, API endpoint additions

### TWEAKS
**Definition**: Simple modifications (DEV-SOP → PDSOP)
**Examples**: Bug fixes, styling updates, text changes

## Project-Specific Terms

### Phase 4 SSE
**Definition**: Server-Sent Events implementation phase for real-time collaboration
**Status**: Currently debugging optimized infrastructure

### API Runaway
**Definition**: Excessive API requests occurring at millisecond intervals instead of intended seconds
**Context**: Major system stability threat requiring emergency intervention

### Active Stackers
**Definition**: Users currently active in the conversation tracking system
**Component**: Displays active users with real-time updates

---

**Last Updated**: 2025-08-21  
**Purpose**: Standardized terminology for AI agents working on this project