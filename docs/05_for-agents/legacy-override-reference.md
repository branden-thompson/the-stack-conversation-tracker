# Legacy Override Reference - BRTOPS Priority

## CRITICAL: BRTOPS Takes Absolute Priority

When BRTOPS v1.0.000 is enabled, **ALL** legacy terminology and workflows are superseded by BRTOPS commands and procedures. This document provides the complete mapping for agents to ensure proper override behavior.

## Legacy Terminology Mapping

### Phase Commands (SUPERSEDED)
| Legacy Term | BRTOPS Command | Override Rule |
|-------------|----------------|---------------|
| **"AN-SOP"** | **"GO RCC"** | Requirements & Context Collection |
| **"PLAN-SOP"** | **"GO PLAN"** | Strategic Planning & Architecture |
| **"DEV-SOP"** | **"GO CODE"** | Development & Implementation |
| **"PDSOP"** | **"GO FINAL"** | Quality Assurance & Completion |
| **"Validate"** | **"GO VAL"** | Post-deployment Validation |
| **"Execute AAR"** | **"DEBRIEF"** | Retrospective & Lessons Learned |

### Process Commands (SUPERSEDED)
| Legacy Term | BRTOPS Command | Override Rule |
|-------------|----------------|---------------|
| **"Bag-n-Tag"** | **"BAG TAG"** | Legacy code cleanup |
| **"Bag and Tag"** | **"BAG TAG"** | Legacy code cleanup |
| **"Bag n Tag"** | **"BAG TAG"** | Legacy code cleanup |
| **"After Action Report"** | **"DEBRIEF"** | Generate AAR via DEBRIEF |
| **"Operations Check"** | **"OPSCHECK"** | System verification |

### Classification System (SUPERSEDED)
| Legacy Term | BRTOPS Command | Override Rule |
|-------------|----------------|---------------|
| **"Next MAJOR Feature"** | **"MAJOR SEV-X [name]"** | Use BRTOPS classification |
| **"Next MINOR Feature"** | **"MINOR SEV-X [name]"** | Use BRTOPS classification |
| **"Next TWEAKS"** | **"TWEAK SEV-X [name]"** | Use BRTOPS classification |

### Control Commands (SUPERSEDED)
| Legacy Term | BRTOPS Command | Override Rule |
|-------------|----------------|---------------|
| **"Current Status"** | **"SITREP"** | Situation Report format |
| **"Status Report"** | **"SITREP"** | Situation Report format |
| **"System Check"** | **"OPSCHECK"** | Comprehensive verification |

## Agent Behavior Rules

### When User Uses Legacy Terms
1. **Recognize** the legacy command intent
2. **Map** to appropriate BRTOPS command
3. **Inform** user of BRTOPS equivalent (if GUIDE mode active)
4. **Execute** using BRTOPS procedures

### Example Responses
```
User: "Let's start AN-SOP"
AI: "🎖️ BRTOPS: Mapping to GO RCC (Requirements & Context Collection)
Proceeding with Requirements & Context Collection..."

User: "Execute Bag-n-Tag"
AI: "🎖️ BRTOPS: Mapping to BAG TAG
Executing legacy code cleanup procedure..."

User: "What's our current status?"
AI: "🎖️ BRTOPS: Generating SITREP
-------------------------------------------------------------
[SITREP format response]
-------------------------------------------------------------"
```

## Documentation Override Rules

### File Creation
- **BRTOPS AAR**: Generate via DEBRIEF command
- **BRTOPS Documentation**: Follow BRTOPS structure
- **Legacy Documentation**: Convert to BRTOPS format

### Terminology Usage
- **In Code Comments**: Use BRTOPS terminology
- **In Documentation**: Use BRTOPS terminology  
- **In Commit Messages**: Use BRTOPS terminology
- **In File Names**: Use BRTOPS terminology

### Process References
- **Workflow Documentation**: Reference BRTOPS phases
- **Quality Gates**: Use BRTOPS gate terminology
- **Status Updates**: Use SITREP format

## Integration Override Rules

### TodoWrite Integration
```
LEGACY: "AN-SOP Phase 1: Context gathering"
BRTOPS: "GO RCC Phase 1: Requirements & Context Collection"

LEGACY: "PDSOP: Final quality check"
BRTOPS: "GO FINAL: Quality Assurance & Completion"
```

### Git Integration
```
LEGACY: "AN-SOP: User authentication analysis"
BRTOPS: "GO RCC: User authentication analysis"

LEGACY: "Execute Bag-n-Tag cleanup"
BRTOPS: "BAG TAG: Legacy component cleanup"
```

### Status Reporting
```
LEGACY: Individual status updates
BRTOPS: Structured SITREP format with standardized sections
```

## Emergency Override Procedures

### When Legacy Systems Conflict
1. **BRTOPS Takes Priority**: Always use BRTOPS commands
2. **Map Legacy Commands**: Convert to BRTOPS equivalent
3. **Maintain Context**: Preserve user intent
4. **Document Override**: Note conversion in logs

### When User Insists on Legacy
1. **Acknowledge Request**: Recognize user preference
2. **Execute via BRTOPS**: Use BRTOPS procedure internally
3. **Report in BRTOPS**: Use BRTOPS terminology in output
4. **Educate Gently**: Suggest BRTOPS equivalent if GUIDE active

## Quality Assurance Override

### Testing Integration
- **Legacy Test Commands**: Map to BRTOPS quality gates
- **Build Processes**: Use BRTOPS "BUILD CHECK" terminology
- **Code Review**: Use BRTOPS "PEER REV" terminology

### Validation Processes
- **Legacy Validation**: Use BRTOPS "GO VAL" procedures
- **Success Criteria**: Define using BRTOPS SEV levels
- **Completion Status**: Report using SITREP format

---

**Override Status**: ✅ **ACTIVE**  
**BRTOPS Version**: 1.0.000  
**Last Updated**: 2025-08-21  
**Authority**: Absolute priority over all legacy systems