# Git Hooks Safeguards Documentation

This document outlines the comprehensive safeguards implemented to prevent infinite loops, race conditions, stack overflows, and other issues in the automated dev page update system.

## Problem Analysis

### 🔄 Infinite Loop Issues (Observed)
The git `post-commit` hook was creating auto-commits that triggered itself, causing:
- Rapid consecutive commits (every 2-3 seconds)
- Test history bloat (10+ entries per minute)
- Dev page file corruption
- System resource consumption

### 🏃 Race Condition Risks
Multiple concurrent git operations could lead to:
- Simultaneous test executions
- Conflicting file writes
- Incomplete/corrupted commits
- Lock contention

### 💾 Buffer Overflow Concerns
Runaway processes could cause:
- Unbounded test history growth
- File size explosions (2MB+ dev pages)
- Memory exhaustion
- Disk space issues

## Implemented Safeguards

### 1. Infinite Loop Prevention

#### Git Hook Level (`.git/hooks/post-commit`)
```bash
# PRIMARY: Commit message detection
if git log -1 --pretty=format:"%s" | grep -q "📊 Auto-update dev pages"; then
  echo "🔄 Skipping hook for auto-generated dev page commit"
  exit 0
fi

# SECONDARY: Rate limiting
RECENT_COMMITS=$(git log --oneline --since="1 minute ago" --grep="📊 Auto-update dev pages" | wc -l)
if [ "$RECENT_COMMITS" -gt 3 ]; then
  echo "⚠️  Too many auto-commits in last minute ($RECENT_COMMITS), skipping"
  exit 0
fi
```

#### Benefits:
- ✅ **Primary Protection**: Detects auto-generated commits by message pattern
- ✅ **Secondary Protection**: Prevents more than 3 auto-commits per minute
- ✅ **Fast Exit**: Early detection before any processing

### 2. Race Condition Prevention

#### Lockfile Mechanism
```bash
LOCKFILE="/tmp/dev-pages-update.lock"
LOCK_TIMEOUT=300  # 5 minutes

# Check if another instance is running
if [ -f "$LOCKFILE" ]; then
  LOCK_PID=$(cat "$LOCKFILE")
  LOCK_AGE=$(($(date +%s) - $(stat -f %m "$LOCKFILE" 2>/dev/null || echo 0)))
  
  if kill -0 "$LOCK_PID" 2>/dev/null; then
    if [ "$LOCK_AGE" -lt "$LOCK_TIMEOUT" ]; then
      echo "🔒 Another update in progress (PID: $LOCK_PID), skipping"
      exit 0
    fi
  fi
fi

# Create lockfile with cleanup
echo $$ > "$LOCKFILE"
trap 'rm -f "$LOCKFILE"; exit' INT TERM EXIT
```

#### Benefits:
- ✅ **Mutual Exclusion**: Only one update process at a time
- ✅ **Stale Lock Detection**: Automatically cleans up dead processes
- ✅ **Timeout Protection**: Prevents indefinite locks
- ✅ **Signal Handling**: Proper cleanup on interruption

### 3. Timeout Protection

#### Test Execution Limits
```bash
timeout 300 npm run update-dev-data 2>/dev/null
UPDATE_RESULT=$?

if [ $UPDATE_RESULT -eq 124 ]; then
  echo "⏰ Test execution timed out after 5 minutes"
  exit 0
fi
```

#### Benefits:
- ✅ **Hard Limit**: Tests cannot run longer than 5 minutes
- ✅ **Resource Protection**: Prevents runaway test processes
- ✅ **Graceful Degradation**: System continues normally on timeout

### 4. Buffer Overflow Prevention

#### File Size Validation
```bash
for file in "app/dev/tests/page.jsx" "app/dev/coverage/page.jsx"; do
  FILE_SIZE=$(wc -c < "$file" 2>/dev/null || echo 0)
  if [ "$FILE_SIZE" -gt 1048576 ]; then  # 1MB limit
    echo "⚠️  File $file too large ($FILE_SIZE bytes), skipping"
    exit 0
  elif [ "$FILE_SIZE" -eq 0 ]; then
    echo "⚠️  File $file is empty, skipping"
    exit 0
  fi
done
```

#### Script-Level Protection
```javascript
// Check file size before processing
if (content.length > 2000000) { // 2MB limit
  throw new Error(`File too large: ${content.length} bytes`);
}

// Validate updated content
if (updatedContent.length > 2000000) {
  console.error('❌ Updated content too large, aborting write');
  return;
}
```

#### Benefits:
- ✅ **Size Limits**: Files cannot exceed 1-2MB
- ✅ **Empty File Detection**: Prevents corruption from overwriting with empty content
- ✅ **Pre-commit Validation**: Checks before staging changes

### 5. History Runaway Prevention

#### Test History Trimming
```javascript
// Count test history entries
const historyCount = (updatedContent.match(/{ date: '/g) || []).length;
if (historyCount > 50) {
  console.warn(`⚠️  Too many history entries (${historyCount}), trimming to last 30`);
  // Keep only the most recent 30 entries
  const entries = historyMatch[2].split('\n').filter(line => line.trim().startsWith('{ date:'));
  const trimmedEntries = entries.slice(0, 30).join('\n');
}
```

#### Benefits:
- ✅ **Bounded Growth**: History limited to 30-50 entries
- ✅ **Automatic Cleanup**: Removes oldest entries when limit exceeded
- ✅ **Performance**: Prevents DOM bloat in dev pages

### 6. Change Validation

#### Diff Analysis
```bash
# Only run on relevant changes
if git diff --name-only HEAD~1 HEAD | grep -E "(\.(js|jsx|ts|tsx)$|package\.json|vitest\.config)"; then
  # Validate staged changes
  STAGED_LINES=$(git diff --cached --stat | tail -1 | grep -o '[0-9]\+' | head -1 || echo 0)
  if [ "$STAGED_LINES" -gt 10000 ]; then
    echo "⚠️  Too many changes staged ($STAGED_LINES lines), aborting"
    git reset
    exit 0
  fi
fi
```

#### Content Validation
```javascript
// Ensure content actually changed
if (updatedContent === content) {
  console.warn('⚠️  No changes detected, skipping write');
  return;
}

// Sanity check - file should be substantial
if (updatedContent.length < 1000) {
  console.error('❌ Content suspiciously small, aborting write');
  return;
}
```

#### Benefits:
- ✅ **Relevance Filtering**: Only runs on test-related changes
- ✅ **Change Detection**: Prevents unnecessary writes
- ✅ **Sanity Checks**: Validates content reasonableness

## Monitoring and Debugging

### Log Messages
The system provides detailed logging:
- `🔄 Skipping hook for auto-generated commit` - Infinite loop prevention
- `🔒 Another update in progress` - Race condition prevention  
- `⏰ Test execution timed out` - Timeout protection
- `⚠️  File too large` - Buffer overflow prevention

### Manual Overrides
```bash
# Bypass all hooks
git commit --no-verify

# Clean up locks manually
rm -f /tmp/dev-pages-update.lock

# Reset corrupted pages
git checkout HEAD -- app/dev/tests/page.jsx app/dev/coverage/page.jsx
```

## Best Practices

### For Future Hooks
1. **Always implement loop detection** for auto-committing hooks
2. **Use lockfiles** for operations that shouldn't run concurrently
3. **Set timeouts** for external command execution
4. **Validate file sizes** before writing large content
5. **Log all safeguard actions** for debugging

### For Maintenance
1. **Monitor log files** for safeguard activations
2. **Check test history growth** in dev pages
3. **Review lockfile directory** for stale locks
4. **Test hook behavior** in development branches

## Recovery Procedures

### If Infinite Loop Occurs
1. **Kill git processes**: `pkill -f "git.*post-commit"`
2. **Remove lockfile**: `rm -f /tmp/dev-pages-update.lock`
3. **Reset hook temporarily**: `chmod -x .git/hooks/post-commit`
4. **Clean up commits**: `git reset HEAD~10` (adjust number as needed)

### If Files Corrupted
1. **Restore from git**: `git checkout HEAD~1 -- app/dev/`
2. **Run manual update**: `npm run update-dev-data`
3. **Re-enable hook**: `chmod +x .git/hooks/post-commit`

## Conclusion

These safeguards provide **defense in depth** against:
- ✅ Infinite loops through commit message detection and rate limiting
- ✅ Race conditions through lockfile mechanisms
- ✅ Buffer overflows through file size validation
- ✅ Resource exhaustion through timeouts and limits
- ✅ Data corruption through content validation

The system is designed to **fail safely** - when safeguards activate, the system continues normally without the automated updates rather than causing system instability.