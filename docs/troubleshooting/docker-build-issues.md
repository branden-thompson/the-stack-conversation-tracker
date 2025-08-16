# Docker Build Issues - Troubleshooting Guide

This document details the Docker build issues encountered during project reorganization and their solutions.

## Issue Context

After reorganizing the project structure (moving Docker files from root to `docker/` directory and database to `data/` directory), the Docker build process failed with multiple Next.js build errors.

## Issues Encountered and Solutions

### 1. Missing Database Function Export

**Error:**
```
Attempted import error: 'getUsers' is not exported from '@/lib/db/database.js'
```

**Root Cause:**
The API route was importing a non-existent function name. The correct function was `getAllUsers`.

**Solution:**
Updated the import in `/app/api/debug/users/route.js`:
```javascript
// Before
import { getUsers } from '@/lib/db/database.js';

// After  
import { getAllUsers } from '@/lib/db/database.js';
```

### 2. Undefined Test Results Object

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'total')
at u (.next/server/app/dev/tests/page.js:1:3593)
```

**Root Cause:**
The test results page was trying to render a `uiRegression` property that didn't exist in the initial state object.

**Solution:**
1. Added the missing `uiRegression` property to the initial test state:
```javascript
uiRegression: {
  total: 0,
  passed: 0,
  failed: 0,
  duration: '0.00s',
  files: []
}
```

2. Added defensive null checking in the `TestResultsCard` component:
```javascript
if (!results) {
  results = { total: 0, passed: 0, failed: 0, duration: '0.00s', files: [] };
}
```

### 3. useSearchParams Without Suspense Boundary

**Error:**
```
useSearchParams() should be wrapped in a suspense boundary at page "/auth/login"
useSearchParams() should be wrapped in a suspense boundary at page "/auth/register"
```

**Root Cause:**
Next.js 13+ requires `useSearchParams()` to be wrapped in a Suspense boundary for static generation.

**Solution:**
Wrapped both login and register pages with Suspense:

```javascript
// Before
export default function LoginPage() {
  const searchParams = useSearchParams();
  // ... component logic
}

// After
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  // ... component logic
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginContent />
    </Suspense>
  );
}
```

### 4. Generic Container Names

**Issue:**
Docker containers were named with generic "docker-" prefix based on the directory name.

**Solution:**
Added explicit container names in `docker-compose.yml`:
```yaml
services:
  app:
    container_name: conversation-tracker-app
    # ... rest of config
    
  api:
    container_name: conversation-tracker-api
    # ... rest of config
```

## Key Learnings

1. **Next.js Static Generation Requirements**: When using client-side hooks like `useSearchParams()`, wrap components in Suspense boundaries for production builds.

2. **TypeScript/JavaScript Defensive Programming**: Always check for undefined/null objects before accessing properties, especially in components that might receive incomplete data during SSR/SSG.

3. **Docker Context Paths**: When moving Docker files to subdirectories, ensure build context is set correctly (`context: ..` to use parent directory).

4. **Explicit Container Naming**: Always set `container_name` in docker-compose.yml for clarity in Docker management tools.

## Prevention Strategies

1. **Run local builds before Docker**: Test with `npm run build` locally to catch Next.js build errors early.

2. **Use TypeScript**: Would have caught the missing export and undefined property issues at compile time.

3. **Add build validation to CI/CD**: Include build tests in continuous integration to catch these issues before deployment.

4. **Maintain migration checklist**: When moving files, maintain a checklist of all path references that need updating.

## Testing the Fix

After applying all fixes:

```bash
# Rebuild and run
docker-compose -f docker/docker-compose.yml up --build

# Verify containers are running
docker ps

# Check application
curl http://localhost:3001  # Should return 200
curl http://localhost:5051  # Should return 200

# View logs for any runtime errors
docker-compose -f docker/docker-compose.yml logs -f
```

## Related Documentation

- [Docker Configuration](../docker/README.md)
- [Database Migration Guide](../database/migration-guide.md)
- [Next.js Build Optimization](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)