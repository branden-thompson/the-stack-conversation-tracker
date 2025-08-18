# Claude Code Memory - Conversation Tracker Project

## Important Project Information

### Docker Setup
**⚠️ IMPORTANT**: Docker files are located in the `/docker` directory, NOT in the root:
- `/docker/dockerfile` - Main Dockerfile for the application
- `/docker/docker-compose.yml` - Docker Compose configuration
- `/docker/README.md` - Docker setup documentation

Do NOT create Docker files in the project root - they already exist in `/docker/`.

### Project Structure
- Next.js 15 application with App Router
- Standalone output mode enabled for Docker deployment
- Main application on port 3000 (3001 when using docker-compose)

### Key Directories
- `/app` - Next.js app directory (pages and API routes)
- `/components` - React components
- `/lib` - Utilities, hooks, and services
- `/data` - Static data files
- `/dev-scripts` - Development and testing scripts
- `/docker` - Docker configuration files
- `/docs` - Project documentation
  - `/docs/project-hygiene/` - **IMPORTANT**: All cleanup and hygiene summaries go here
  - `/docs/features/` - Feature documentation

### Testing Commands
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run build` - Build for production

### Recent Work Completed
1. Consolidated user management system (unified `useUserManagement` hook)
2. Expanded guest name/avatar system (552x increase in combinations)
3. Fixed dev-header user selector dropdown consistency
4. Cleaned up console.log statements (66% reduction)
5. Fixed Next.js 15 async params/cookies warnings
6. Fixed build errors in /dev/tests page
7. Enhanced SessionCard styling with proper visual hierarchy (2025-08-18)
8. Added card background colors to UI theme constants (2025-08-18)
9. **React Query Migration** - Successfully migrated all hooks to React Query with safety switches (2025-08-18)
10. **Bag n Tag Cleanup** - Deprecated legacy hooks after successful React Query migration (2025-08-18)
11. **Synthwave84 Theme** - Implemented custom dark-mode exclusive retro-futuristic theme (2025-08-18)

### Development Notes
- NEVER NEVER NEVER add unprompted features unless you specifically ask to create them
- When making changes, always check if files already exist before creating new ones
- Use the existing project structure and conventions
- Docker configuration is already set up in `/docker/` directory
- The project uses a unified user management system for both app and dev pages
- **Theme System**: Always use theme constants from `/lib/utils/ui-constants.js`
  - `THEME.colors.background.card` for card backgrounds in dev pages
  - `APP_THEME.colors.background.card` for card backgrounds in main app
  - Never hardcode colors directly in components
- **CSS Values**: Avoid CSS calc() functions when possible - use direct rem/px values instead
  - ❌ Bad: `'calc(1rem - 4px)'` (expensive calculation)
  - ✅ Good: `'0.75rem'` (direct value, since 1rem = 16px, 0.75rem = 12px)
  - Calculations are expensive and should only be used when absolutely necessary

### Documentation Guidelines
**📁 Project Hygiene Documentation**
- **ALWAYS** save cleanup summaries in `/docs/project-hygiene/`
- Use descriptive filenames with dates (e.g., `2025-08-18-build-cleanup.md`)
- Include before/after metrics when doing cleanup work
- Document all linting, build fixes, and optimization work in this folder
- This keeps cleanup work organized and trackable over time

### "Bag n Tag" Process
**🏷️ Post-Success Legacy Code Cleanup**
When a major migration or refactor is successfully completed, use the "Bag n Tag" process:

1. **Determine** if legacy code is still needed after the successful implementation
2. **Create** `/deprecated` folders in appropriate directories (e.g., `hooks/deprecated`)
3. **Move** legacy code to deprecated folders with proper headers:
   ```javascript
   /**
    * DEPRECATED: Legacy [ComponentName]
    * 
    * MOVED: [Date]
    * REASON: [Migration completed successfully]
    * RESTORE: Move back to parent directory if [condition] needs rollback
    */
   ```
4. **Clean up** main files to only contain migration wrappers
5. **Add** `**/deprecated/` to `.gitignore` once successfully deprecated
6. **Document** the process in project hygiene docs
7. **Remember**: Files can be restored by moving them out of `/deprecated` folders if needed

**Terminology**: "Bag n Tag", "Bag and Tag", or "Bag-n-Tag" all refer to this deprecation process.

### Custom Theme Implementation
**🎨 Adding New Color Themes**
When implementing custom themes, follow this established pattern:

1. **Create theme file** in `/lib/themes/color-themes/[theme-name].js`
2. **Follow mathematical color generation** - use existing theme ratios for consistency
3. **Add import and registration** in `/lib/themes/theme-loader.js`
4. **Update color previews** in `/components/ui/color-theme-selector.jsx`
5. **Consider dark-only themes** with `darkOnly: true` flag for specialized aesthetics
6. **Test across all theme-aware components** to ensure universal coverage
7. **Document in project hygiene** for implementation tracking

**Example: Synthwave84 Theme (2025-08-18)**
- Dark-mode exclusive retro-futuristic theme
- Base colors: Blue-Purple backgrounds, Hot-Pink borders, Hot Teal text
- Balanced approach: Maintains readability while preserving aesthetic
- Universal application: All theme-aware elements styled consistently

## Commands to Remember
```bash
# Build Docker container
cd docker && docker-compose build

# Run with Docker
cd docker && docker-compose up

# Clean build
npm run build

# Development server
npm run dev
```

---

*Last updated: 2025-08-18*
*This file helps Claude Code remember important project details across sessions*