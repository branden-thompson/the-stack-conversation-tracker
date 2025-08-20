# Component Systems Documentation

## Overview
This folder contains documentation for reusable component systems, UI constants, and component architecture patterns used throughout the application.

## Contents

### Core Component Systems
- `card-type-constants.md` - Card type definitions, colors, and styling constants
- `ui-constants.md` - Application-wide UI constants and theming system
- `compact-user-selector.md` - User selection component system

## Related Systems
- Theme system architecture (see `/1-Architecture/data-event-flow-human-readable.md`)
- UI troubleshooting (see `/4-Troubleshooting/`)
- Performance considerations (see `/2-Performance-Monitoring/`)

## Design Principles
- **Centralized Constants**: All UI constants defined in single source of truth
- **Theme Awareness**: All components support dynamic theming
- **Type Safety**: Strong typing for component props and constants
- **Backward Compatibility**: Legacy type mappings maintained

## Quick Reference
- **Card Types**: `topic`, `question`, `accusation`, `fact`, `guess`, `opinion`
- **Theme System**: Dynamic theme context with CSS class generation
- **Component Pattern**: Use `useDynamicAppTheme()` hook for theme-aware components