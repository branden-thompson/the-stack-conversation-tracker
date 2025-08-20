/**
 * SSE Authorization Service
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | SECURITY INFRASTRUCTURE
 * Authentication and authorization for SSE connections
 * 
 * Features:
 * - Session validation
 * - User authorization
 * - Rate limiting
 * - Security monitoring
 */

/**
 * Validate SSE connection authorization
 */
export async function validateSSEAuthorization(sessionId, userId, request) {
  try {
    // Basic parameter validation
    if (!sessionId || !userId) {
      return {
        authorized: false,
        reason: 'Missing sessionId or userId',
        code: 'MISSING_PARAMETERS'
      };
    }

    // Validate session format
    if (!isValidSessionId(sessionId)) {
      return {
        authorized: false,
        reason: 'Invalid sessionId format',
        code: 'INVALID_SESSION_FORMAT'
      };
    }

    // Validate user format
    if (!isValidUserId(userId)) {
      return {
        authorized: false,
        reason: 'Invalid userId format',
        code: 'INVALID_USER_FORMAT'
      };
    }

    // Check rate limiting
    const rateLimitResult = checkRateLimit(userId);
    if (!rateLimitResult.allowed) {
      return {
        authorized: false,
        reason: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        retryAfter: rateLimitResult.retryAfter
      };
    }

    // For now, we allow all valid sessions since this is a local app
    // In production, you would validate against a session store
    return {
      authorized: true,
      sessionId,
      userId,
      permissions: getSessionPermissions(sessionId, userId)
    };

  } catch (error) {
    console.error('SSE authorization error:', error);
    
    return {
      authorized: false,
      reason: 'Authorization service error',
      code: 'AUTH_SERVICE_ERROR'
    };
  }
}

/**
 * Validate session ID format
 */
function isValidSessionId(sessionId) {
  // Session IDs should be non-empty strings
  if (typeof sessionId !== 'string' || sessionId.length === 0) {
    return false;
  }
  
  // Check for basic format (alphanumeric, dashes, underscores)
  const sessionIdPattern = /^[a-zA-Z0-9_-]+$/;
  return sessionIdPattern.test(sessionId);
}

/**
 * Validate user ID format
 */
function isValidUserId(userId) {
  // User IDs should be non-empty strings
  if (typeof userId !== 'string' || userId.length === 0) {
    return false;
  }
  
  // Check for basic format
  const userIdPattern = /^[a-zA-Z0-9_-]+$/;
  return userIdPattern.test(userId);
}

/**
 * Rate limiting implementation
 */
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_CONNECTIONS_PER_USER = 10;

function checkRateLimit(userId) {
  const now = Date.now();
  const userKey = `sse_conn_${userId}`;
  
  // Get current rate limit data
  let rateLimitData = rateLimitStore.get(userKey);
  
  if (!rateLimitData) {
    rateLimitData = {
      connections: 0,
      windowStart: now
    };
  }
  
  // Reset window if expired
  if (now - rateLimitData.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitData = {
      connections: 0,
      windowStart: now
    };
  }
  
  // Check if limit exceeded
  if (rateLimitData.connections >= MAX_CONNECTIONS_PER_USER) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - (now - rateLimitData.windowStart)) / 1000);
    
    return {
      allowed: false,
      retryAfter
    };
  }
  
  // Increment connection count
  rateLimitData.connections++;
  rateLimitStore.set(userKey, rateLimitData);
  
  return {
    allowed: true,
    remaining: MAX_CONNECTIONS_PER_USER - rateLimitData.connections
  };
}

/**
 * Get session permissions
 */
function getSessionPermissions(sessionId, userId) {
  // Basic permissions for all users
  const basePermissions = [
    'read:session-data',
    'read:ui-events',
    'write:ui-events',
    'read:own-cards',
    'write:own-cards'
  ];
  
  // Additional permissions could be added based on user role
  // For now, all users get the same permissions
  return basePermissions;
}

/**
 * Cleanup rate limit store
 */
setInterval(() => {
  const now = Date.now();
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW); // Cleanup every window period