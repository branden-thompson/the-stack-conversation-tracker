/**
 * Authentication Middleware
 * 
 * Provides middleware functions for protecting API routes and pages
 */

import { NextResponse } from 'next/server';
import { getSessionFromCookie } from './session';
import { requirePermission, requireRole } from './permissions';

/**
 * Authenticate user from request
 */
export async function authenticateRequest(request) {
  try {
    const session = getSessionFromCookie();
    
    if (!session.valid) {
      return {
        authenticated: false,
        error: session.error || 'Invalid session',
        user: null
      };
    }

    return {
      authenticated: true,
      user: session.user,
      session
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error.message,
      user: null
    };
  }
}

/**
 * Require authentication middleware
 */
export function withAuth(handler) {
  return async (request, context) => {
    const auth = await authenticateRequest(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // Add user to request context
    request.user = auth.user;
    request.session = auth.session;
    
    return handler(request, context);
  };
}

/**
 * Require specific permission middleware
 */
export function withPermission(permission) {
  return function(handler) {
    return withAuth(async (request, context) => {
      const permissionCheck = requirePermission(permission);
      const result = permissionCheck(request.user);
      
      if (!result.allowed) {
        return NextResponse.json(
          { 
            error: result.error,
            details: {
              userRole: result.userRole,
              requiredPermission: result.requiredPermission
            }
          },
          { status: 403 }
        );
      }
      
      return handler(request, context);
    });
  };
}

/**
 * Require specific role middleware
 */
export function withRole(roles) {
  return function(handler) {
    return withAuth(async (request, context) => {
      const roleCheck = requireRole(roles);
      const result = roleCheck(request.user);
      
      if (!result.allowed) {
        return NextResponse.json(
          { 
            error: result.error,
            details: {
              userRole: result.userRole,
              requiredRoles: result.requiredRoles
            }
          },
          { status: 403 }
        );
      }
      
      return handler(request, context);
    });
  };
}

/**
 * Combined authentication and authorization middleware
 */
export function withAuthAndPermission(permission) {
  return withPermission(permission);
}

export function withAuthAndRole(roles) {
  return withRole(roles);
}

/**
 * Optional authentication middleware (doesn't fail if not authenticated)
 */
export function withOptionalAuth(handler) {
  return async (request, context) => {
    const auth = await authenticateRequest(request);
    
    // Add user to request context (may be null)
    request.user = auth.user;
    request.session = auth.session;
    request.authenticated = auth.authenticated;
    
    return handler(request, context);
  };
}

/**
 * Error handler for authentication failures
 */
export function handleAuthError(error, request) {
  console.error('Authentication error:', error);
  
  // Determine appropriate response based on request type
  const acceptHeader = request.headers.get('accept') || '';
  
  if (acceptHeader.includes('application/json')) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
  
  // For browser requests, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url));
}

/**
 * API route wrapper that handles common authentication patterns
 */
export function createAuthenticatedHandler(handlers, options = {}) {
  const { 
    requireAuth = true, 
    permissions = [], 
    roles = [],
    allowSystemUser = true 
  } = options;

  return async (request, context) => {
    try {
      // Handle OPTIONS requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      // Authenticate if required
      if (requireAuth) {
        const auth = await authenticateRequest(request);
        
        if (!auth.authenticated) {
          return NextResponse.json(
            { error: auth.error },
            { status: 401 }
          );
        }

        request.user = auth.user;
        request.session = auth.session;

        // Check system user restriction
        if (!allowSystemUser && auth.user.isSystemUser) {
          return NextResponse.json(
            { error: 'System user access not allowed for this operation' },
            { status: 403 }
          );
        }

        // Check role requirements
        if (roles.length > 0) {
          const roleCheck = requireRole(roles);
          const result = roleCheck(auth.user);
          
          if (!result.allowed) {
            return NextResponse.json(
              { error: result.error },
              { status: 403 }
            );
          }
        }

        // Check permission requirements
        for (const permission of permissions) {
          const permissionCheck = requirePermission(permission);
          const result = permissionCheck(auth.user);
          
          if (!result.allowed) {
            return NextResponse.json(
              { error: result.error },
              { status: 403 }
            );
          }
        }
      }

      // Execute appropriate handler based on HTTP method
      const method = request.method.toLowerCase();
      const handler = handlers[method];
      
      if (!handler) {
        return NextResponse.json(
          { error: `Method ${request.method} not allowed` },
          { status: 405 }
        );
      }

      return await handler(request, context);

    } catch (error) {
      console.error('Handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}