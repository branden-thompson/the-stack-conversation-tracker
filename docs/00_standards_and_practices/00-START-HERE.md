# Standards and Practices

**Purpose**: Project-wide standards, development practices, and organizational protocols  
**Scope**: Universal standards that apply to all development work  
**Authority**: These standards govern all project classifications and development approaches

## Navigation

### 📋 Development Standards
- `development-standards.md` - Core development practices and architectural guidelines
- `sev-classification.md` - Severity classification system for all work
- `emergency-procedures.md` - Emergency response protocols and circuit breakers

### 🏗️ Project Management
- `project-classification.md` - How to classify APPLICATION vs FEATURE level work
- `validation-frameworks.md` - Level-1, Level-2, Level-3 validation requirements
- `git-branch-strategies.md` - Branch management for different project types

### 🚨 Special Protocols
- `sse-special-handling.md` - Server-Sent Events special requirements
- `application-level-procedures.md` - Enhanced procedures for APPLICATION-LEVEL projects
- `mini-project-management.md` - DEV-SOP phase management and checkpoints

## Standards Hierarchy

### Universal Standards (Apply to All Work)
- Development practices and code quality
- Git branch strategy requirements
- Emergency procedures and circuit breakers
- SEV classification system

### Application-Level Standards (Major Projects)
- Enhanced validation with mini-project checkpoints
- Mandatory branch isolation and incremental commits
- Cross-phase GO/NO-GO decision gates
- Complete 6-folder documentation structure

### Feature-Level Standards (Standard Projects)
- Standard validation and approval processes
- Optional branch usage based on complexity
- Feature-specific testing and documentation

## Implementation Notes

### Relationship to Project Documentation
- **Standards live here** (`/docs/00_standards_and_practices/`)
- **APPLICATION-LEVEL projects** documented in `/docs/01_application/{project-name}/`
- **FEATURE-LEVEL projects** documented in `/docs/02_features/{project-name}/`
- **Failed/archived projects** moved to `/docs/06_archive/`

### Standards Evolution
- Standards updated based on project learnings and failures
- Major-system-cleanup failure analysis incorporated throughout
- Real-world application feedback drives continuous improvement
- Protocol effectiveness measured and refined

---

**Authority**: These standards are authoritative and must be followed for all development work. Deviations require explicit approval and documentation.

*Established: 2025-08-20 during APPLICATION-LEVEL project structure enhancement*