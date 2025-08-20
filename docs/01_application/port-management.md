# Port Management - Development Server Issues

**Issue**: Multiple Development Server Problem  
**Impact**: Cross-tab synchronization failures, Active Stackers not working  
**Solution**: Use `clean-start-dev.sh` script

## Problem Description

### The Multi-Server Issue
The Conversation Tracker project can inadvertently run multiple `npm run dev` instances on different ports (3000, 3001, 3002, etc.), causing **session data to be split across different backend instances**.

### Symptoms
- **Active Stackers showing incorrect counts**: Different tabs showing different user counts
- **Cross-tab synchronization broken**: Changes in one tab not appearing in others
- **SSE events not syncing**: Real-time features appear broken
- **Session inconsistencies**: User sessions appear/disappear randomly

### Root Cause
When multiple dev servers run simultaneously:
1. **Frontend connects to different backends**: Tab A → localhost:3000, Tab B → localhost:3001  
2. **Session data split**: Each backend maintains separate session state
3. **SSE connections isolated**: Events broadcast to different server instances
4. **Real-time features fail**: Cross-tab sync depends on shared backend state

## Solution: Clean Start Development Script

### Using the Script
```bash
# Recommended method
./dev-scripts/clean-start-dev.sh

# Alternative (if npm script added)
npm run clean-dev
```

### What the Script Does
1. **Kills existing dev servers** on ports 3000-3003
2. **Cleans up lingering processes** (npm, node, next dev)
3. **Verifies port cleanup** with status reporting
4. **Starts single clean dev server** on port 3000

### Script Location
`/dev-scripts/clean-start-dev.sh` (executable, committed to repository)

## Manual Port Management

### Check Running Processes
```bash
# Check specific ports
lsof -ti:3000
lsof -ti:3001
lsof -ti:3002

# Check all npm dev processes
ps aux | grep "npm.*run.*dev"
```

### Manual Cleanup
```bash
# Kill specific port
kill -9 $(lsof -ti:3000)

# Kill all npm dev processes
pkill -f "npm.*run.*dev"
pkill -f "next.*dev"
```

### Verify Clean State
```bash
# Ensure no processes on development ports
for port in 3000 3001 3002 3003; do
  echo "Port $port: $(lsof -ti:$port || echo 'clear')"
done
```

## Prevention Strategies

### 1. Always Use Clean Start Script
- **Default behavior**: Use `./dev-scripts/clean-start-dev.sh` instead of `npm run dev`
- **Team standard**: All developers should use the clean start script
- **Documentation**: Script usage documented in project README

### 2. Terminal Management
- **Close terminals properly**: Don't just close terminal windows with running dev servers
- **Use Ctrl+C**: Properly stop dev servers before starting new ones
- **Check before starting**: Run port check before starting development

### 3. Development Workflow
```bash
# Recommended daily workflow
1. ./dev-scripts/clean-start-dev.sh  # Clean start
2. Development work...
3. Ctrl+C                            # Proper shutdown
4. Close terminal
```

## Troubleshooting Port Issues

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
./dev-scripts/clean-start-dev.sh
```

### Issue: Active Stackers showing wrong counts
**Check**: Multiple dev servers running
```bash
ps aux | grep "next.*dev"
```
**Solution**: Kill all and clean start

### Issue: Cross-tab sync not working
**Check**: Frontend connecting to different backend ports  
**Verify**: Network tab in browser dev tools  
**Solution**: Ensure single dev server instance

### Issue: SSE connections failing
**Check**: EventSource connections in Network tab  
**Verify**: All tabs connecting to same port  
**Solution**: Clean restart and verify single server

## Monitoring and Verification

### Verify Single Server Instance
```bash
# Should show only one next dev process
ps aux | grep "next.*dev" | grep -v grep
```

### Check SSE Connections
1. Open browser dev tools → Network tab
2. Filter by "EventSource" or search for "sse"
3. Verify all tabs connect to same port (e.g., localhost:3000)

### Test Cross-Tab Sync
1. Open two tabs to the same conversation
2. Perform user action in Tab 1 (join/leave)
3. Verify Tab 2 updates within 2 seconds
4. Test card operations (flip, move)

## Emergency Procedures

### If Clean Start Script Fails
```bash
# Force kill everything on common ports
sudo lsof -ti:3000,3001,3002,3003 | xargs kill -9

# Nuclear option - kill all node processes
sudo pkill -f node

# Then start cleanly
npm run dev
```

### If Sessions Still Split
1. **Clear browser storage**: localStorage, sessionStorage
2. **Hard refresh**: Ctrl+Shift+R in all tabs  
3. **Restart browser**: Complete browser restart
4. **Verify single server**: Check ps output

## Integration with CI/CD

### Development Environment Checks
- Scripts should verify single dev server before running tests
- Port conflicts should fail build processes
- Clean environment requirements documented

### Docker Development
- Docker Compose ensures single instance
- Port mapping prevents conflicts
- Container isolation solves multi-server issues

---

**Key Takeaway**: The `clean-start-dev.sh` script is **critical infrastructure** for this project. Multiple development servers break core real-time functionality and should be treated as a serious development environment issue.

**Always use**: `./dev-scripts/clean-start-dev.sh` for development startup.