# 📚 Documentation Guide - Start Here

## 🤖 For AI Agents (Claude, GPT, etc.)

**Quick Start:** If you're an AI agent working on this codebase, prioritize reading these documents based on your task:

### 🔧 For Development Tasks:
1. **First:** Check `/docs/development/` for coding standards and practices
2. **Important:** Read `DEBUG_LOGGING.md` before adding any console.log statements
3. **Git Hooks:** Review `git-hooks-safeguards.md` for automated protections

### 🐛 For Debugging/Troubleshooting:
1. **Check:** `/docs/troubleshooting/` for known issues and solutions
2. **Example:** `SWITCHING-SOLUTION.md` shows how we fixed the user switching bug

### 🏗️ For Architecture Understanding:
1. **Check:** `/docs/architecture/` for system design (when available)

### 📝 For AI-Specific Instructions:
1. **Check:** `/docs/ai-context/` for AI agent guidelines
2. **Look for:** `CLAUDE.md` or similar files with model-specific instructions

## 👥 For Human Developers

### Directory Structure:
```
docs/
├── 00-START-HERE.md           # You are here!
├── architecture/              # System design & structure docs
├── development/               # Development practices & standards
│   ├── DEBUG_LOGGING.md      # Console logging strategy
│   ├── dev-pages-automation.md
│   └── git-hooks-safeguards.md
├── troubleshooting/           # Bug fixes & solutions
│   └── SWITCHING-SOLUTION.md
└── ai-context/                # Instructions for AI assistants
```

### Key Documents by Purpose:

#### Setting Up Development:
- Start with the main `README.md` for installation
- Check `development/` folder for coding practices

#### Understanding the Code:
- Architecture docs in `architecture/` (coming soon)
- Component-specific docs alongside code files

#### Fixing Issues:
- Check `troubleshooting/` for documented solutions
- `SWITCHING-SOLUTION.md` is a good example of our debugging process

#### Working with AI Assistants:
- Direct them to this file first
- They should check `ai-context/` for specific instructions

## 📋 Documentation Standards

### When Adding New Docs:
1. **Place in correct subfolder** based on content type
2. **Use clear naming** - prefer descriptive names over abbreviations
3. **Include examples** when explaining complex concepts
4. **Date important changes** for historical context

### File Naming Convention:
- `UPPERCASE.md` - Critical documents (e.g., DEBUG_LOGGING.md)
- `lowercase-kebab.md` - Standard documentation
- `00-PREFIX.md` - For ordering (00 = read first)

## 🔄 Recently Added/Updated:

- **2025-08-17:** Post-feature cleanup - Removed 200+ console.logs, organized test files
- **2025-08-17:** Added `/docs/ai-context/post-feature-work-cleanup.md` - Cleanup process guide
- **2025-08-17:** Added `/docs/development/essential-logging.md` - Documents remaining logs
- **2025-08-16:** Reorganized docs structure for better AI agent navigation
- **2025-08-16:** Added `DEBUG_LOGGING.md` - Critical for performance
- **2025-08-15:** Added `SWITCHING-SOLUTION.md` - User switching bug fix

## 🎯 Key Learnings from Recent Development:

### Post-Feature Cleanup is Essential
After implementing major features (like provisioned guest system), always:
1. **Remove debug console.logs** - They accumulate quickly during development
2. **Organize test files** - Don't leave test scripts in root directory
3. **Document what remains** - Explain why certain logs are kept
4. **Update documentation** - Reflect the current state of the codebase

See `/docs/ai-context/post-feature-work-cleanup.md` for detailed cleanup process.

### Console.log Best Practices
- **Keep**: Error handlers, auth events, cleanup operations
- **Remove**: Debug flow tracking, state logging, verbose initialization
- **Document**: Essential logs in `/docs/development/essential-logging.md`

## 💡 Quick Tips:

1. **For AI Agents:** Always check for a `CLAUDE.md` or similar file in `/docs/ai-context/` before starting work
2. **For Developers:** Run through `/docs/development/` before making your first commit
3. **For Debugging:** Check `/docs/troubleshooting/` first - your issue might already be solved
4. **For Cleanup:** Follow `/docs/ai-context/post-feature-work-cleanup.md` after feature work

---

*This guide helps both human developers and AI agents navigate our documentation efficiently. Keep it updated as the structure evolves.*