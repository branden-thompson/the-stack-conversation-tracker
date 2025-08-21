# Quality Assurance Documentation

This folder contains quality assurance standards, procedures, and documentation for the conversation-tracker project.

## Folder Structure

### `/testing/`
Testing strategies, test cases, and automation documentation.

### `/quality-gates/`
SEV-based quality gate definitions and automation scripts.

### `/reviews/`
Code review guidelines, security checklists, and performance checklists.

## Current Testing Setup

- **Test Command**: `npm test`
- **Lint Command**: `npm run lint`
- **Build Command**: `npm run build`
- **Coverage**: `npm run test:coverage`

## Quality Standards

- **SEV-4/5**: Basic testing and lint checks
- **SEV-2/3**: Unit test coverage requirements
- **SEV-0/1**: Comprehensive testing including security and performance

## Related Documentation

- Build and deployment: `/docs/03_operations/`
- Development standards: `/docs/00_project/`
- Feature testing: Individual feature folders in `/docs/02_features/`