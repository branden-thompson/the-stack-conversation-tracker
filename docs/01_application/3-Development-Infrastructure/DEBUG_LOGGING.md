# Debug Logging and Performance Management

## Summary of Console.log Cleanup (2025-08-16)

### Problem Identified
The application was emitting excessive console.log statements which could potentially:
- Cause memory leaks in the browser
- Degrade performance, especially during rapid user interactions
- Clutter the console making real errors hard to identify
- Expose sensitive debugging information in production

### Actions Taken

#### 1. **Removed Debug Logs from Core Hooks**
- `lib/hooks/useUsers.js` - Removed ~10 debug logs tracking user fetching and switching
- `lib/hooks/useGuestUsers.js` - Removed ~20 debug logs for guest user management
- `lib/hooks/useHaxMode.js` - Removed 2 debug logs for preference loading/saving
- `lib/hooks/useBoardDnD.js` - Removed commented drag/drop debug logs

#### 2. **Cleaned Component Debug Logs**
- `components/ui/compact-user-selector.jsx` - Removed 6 debug logs for user selection
- `components/conversation-board/Board.jsx` - Removed 4 debug logs for conversation events
- `components/conversation-board/BoardCanvas.jsx` - Removed window sizing debug logs
- `components/conversation-board/Zone.jsx` - Removed commented zone state logs

#### 3. **Preserved Critical Logs**
We intentionally kept certain console statements that serve important purposes:

**Error Logging (kept):**
- API error responses (`console.error`)
- Failed network requests
- Data validation errors
- Critical operation failures

**Security Audit Logs (kept):**
- `app/api/auth/logout/route.js` - User logout events for security auditing

**Development-Only Logs (kept in test files):**
- Test scripts and debug utilities remain unchanged
- These don't run in production

## New Logging Strategy

### 1. **Environment-Based Logger Utility**
Created `lib/utils/logger.js` that provides:
- Environment-aware logging (development vs production)
- Log levels (DEBUG, INFO, WARN, ERROR)
- Feature-specific logging flags
- Grouped logging for related messages

### 2. **Usage Guidelines**

#### Instead of Direct console.log:
```javascript
// ❌ OLD WAY - Always logs
console.log('User switched to:', userId);

// ✅ NEW WAY - Environment aware
import logger from '@/lib/utils/logger';
logger.debug('User switched to:', userId);
```

#### Log Levels:
- **DEBUG**: Detailed debugging info (dev only)
- **INFO**: General information (dev only)
- **WARN**: Warning messages (dev + prod)
- **ERROR**: Error messages (always shown)

#### Feature-Specific Debugging:
```javascript
// Enable with NEXT_PUBLIC_DEBUG_AUTH=true
logger.feature('auth', 'Authentication flow:', data);
```

### 3. **Environment Variables**
Control logging via environment variables:
```bash
# Enable all debug logs in development
NEXT_PUBLIC_DEBUG=true

# Enable specific feature debugging
NEXT_PUBLIC_DEBUG_AUTH=true
NEXT_PUBLIC_DEBUG_DND=true
NEXT_PUBLIC_DEBUG_USERS=true
```

## Best Practices Going Forward

### 1. **Development Debugging**
- Use the logger utility instead of console.log
- Remove or convert debug statements before committing
- Use feature flags for module-specific debugging

### 2. **Production Logging**
- Only log errors and critical warnings
- Never log sensitive user data
- Consider using external logging services for production

### 3. **Performance Monitoring**
- Excessive logging impacts performance
- Browser console has memory limits
- Rapid logging during animations/interactions causes lag

### 4. **Code Review Checklist**
Before committing code, check for:
- [ ] Unnecessary console.log statements removed
- [ ] Debug logs converted to logger.debug()
- [ ] Sensitive data not being logged
- [ ] Error handling includes appropriate logging
- [ ] No commented-out console.logs

## Memory and Performance Impact

### Why Console Logs Cause Issues:
1. **Memory Retention**: Browser keeps logged objects in memory
2. **String Conversion**: Large objects converted to strings consume memory
3. **Console Buffer**: Console maintains a buffer of recent logs
4. **DOM Updates**: DevTools updates consume CPU when console is open

### Symptoms We Were Experiencing:
- Lag during rapid user switching
- Memory usage increasing over time
- Console becoming unresponsive
- Difficulty finding actual errors

### Results After Cleanup:
- Reduced memory footprint
- Smoother user interactions
- Cleaner console output
- Easier debugging of real issues

## Testing for Console Logs

### Quick Check Command:
```bash
# Find remaining console.log statements (excluding test files)
grep -r "console\.log" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --exclude-dir="__tests__" --exclude-dir="node_modules" --exclude="*test*" --exclude="*debug*" .
```

### Pre-commit Hook (Optional):
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
# Check for console.log in staged files
if git diff --cached --name-only | xargs grep -l "console\.log" 2>/dev/null; then
  echo "Warning: console.log found in staged files"
  echo "Consider using the logger utility instead"
  # Uncomment to block commit:
  # exit 1
fi
```

## Migration Guide

### Converting Existing Debug Logs:
1. Import the logger: `import logger from '@/lib/utils/logger';`
2. Replace console.log → logger.debug
3. Replace console.warn → logger.warn
4. Keep console.error → logger.error (for consistency)

### Adding New Debug Logs:
1. Always use the logger utility
2. Choose appropriate log level
3. Consider if it's needed in production
4. Add feature flag if module-specific

## Monitoring and Maintenance

### Regular Audits:
- Monthly: Search for new console.logs
- Quarterly: Review logger usage
- Before major releases: Full console audit

### Performance Monitoring:
- Use browser DevTools Performance tab
- Monitor memory usage over time
- Check for console-related performance issues

## Conclusion

By removing ~50+ debug console.log statements and implementing a proper logging strategy, we've:
- Improved application performance
- Reduced memory usage
- Created a sustainable debugging approach
- Maintained critical error and audit logging

This cleanup ensures the application runs smoothly even during intensive user interactions while preserving our ability to debug issues when needed.