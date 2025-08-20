/**
 * API Route Handler Factory
 * 
 * Standardizes API route creation with consistent error handling, validation,
 * and response patterns. Reduces code duplication across 45+ API routes.
 * 
 * Part of: Mini-Project 2 - Pattern Extraction & API Standardization
 */

import { NextResponse } from 'next/server';

/**
 * Standard API error responses
 */
const API_ERRORS = {
  NOT_FOUND: (resource = 'Resource') => ({
    error: `${resource} not found`,
    status: 404
  }),
  VALIDATION_ERROR: (message) => ({
    error: message || 'Validation failed',
    status: 400
  }),
  MISSING_ID: (resource = 'ID') => ({
    error: `${resource} is required`,
    status: 400
  }),
  SERVER_ERROR: (operation) => ({
    error: `Failed to ${operation}`,
    status: 500
  }),
  UNAUTHORIZED: () => ({
    error: 'Unauthorized access',
    status: 401
  }),
  FORBIDDEN: () => ({
    error: 'Forbidden operation',
    status: 403
  })
};

/**
 * Create standardized API response
 */
function createResponse(data, options = {}) {
  const { status = 200, headers = {} } = options;
  
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

/**
 * Create error response
 */
function createErrorResponse(error, operation) {
  console.error(`API Error in ${operation}:`, error);
  
  // Handle known error types
  if (error.status && error.error) {
    return NextResponse.json(
      { error: error.error },
      { status: error.status }
    );
  }
  
  // Handle unexpected errors
  const serverError = API_ERRORS.SERVER_ERROR(operation);
  return NextResponse.json(
    { error: serverError.error },
    { status: serverError.status }
  );
}

/**
 * Extract search parameters from request
 */
function getSearchParams(request) {
  try {
    const { searchParams } = new URL(request.url);
    return {
      get: (key) => searchParams.get(key),
      getAll: (key) => searchParams.getAll(key),
      has: (key) => searchParams.has(key),
      entries: () => Object.fromEntries(searchParams.entries())
    };
  } catch (error) {
    console.warn('Failed to parse search params:', error);
    return {
      get: () => null,
      getAll: () => [],
      has: () => false,
      entries: () => ({})
    };
  }
}

/**
 * Safely parse request body
 */
async function parseRequestBody(request) {
  try {
    const body = await request.json();
    return { success: true, data: body, error: null };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: API_ERRORS.VALIDATION_ERROR('Invalid JSON in request body')
    };
  }
}

/**
 * Validate required fields in data object
 */
function validateRequired(data, requiredFields = []) {
  const missing = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    return API_ERRORS.VALIDATION_ERROR(
      `Missing required fields: ${missing.join(', ')}`
    );
  }
  
  return null;
}

/**
 * Create CRUD API Route Handlers
 */
export function createCRUDRoutes(config) {
  const {
    resource,
    operations = {},
    validation = {},
    middleware = {},
    cache = null
  } = config;

  const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);

  const handlers = {};

  // GET handler
  if (operations.get || operations.getAll) {
    handlers.GET = async (request) => {
      try {
        // Apply middleware
        if (middleware.auth) {
          const authResult = await middleware.auth(request);
          if (!authResult.success) {
            return createErrorResponse(API_ERRORS.UNAUTHORIZED(), 'GET');
          }
        }

        const params = getSearchParams(request);
        const id = params.get('id');

        if (id) {
          // Single resource fetch
          if (!operations.get) {
            return createErrorResponse(
              API_ERRORS.NOT_FOUND(resourceName),
              'GET single'
            );
          }

          const item = await operations.get(id, { request, params });
          
          if (!item) {
            return createErrorResponse(
              API_ERRORS.NOT_FOUND(resourceName),
              'GET single'
            );
          }

          return createResponse(item);
        } else {
          // Multiple resources fetch
          if (!operations.getAll) {
            return createErrorResponse(
              API_ERRORS.SERVER_ERROR('fetch all'),
              'GET all'
            );
          }

          // Check cache first
          if (cache) {
            const cached = cache.get();
            if (cached) {
              return createResponse(cached);
            }
          }

          const items = await operations.getAll({ request, params });
          
          // Update cache
          if (cache) {
            cache.set(items);
          }

          return createResponse(items);
        }
      } catch (error) {
        return createErrorResponse(error, `GET ${resource}`);
      }
    };
  }

  // POST handler
  if (operations.create) {
    handlers.POST = async (request) => {
      try {
        // Apply middleware
        if (middleware.auth) {
          const authResult = await middleware.auth(request);
          if (!authResult.success) {
            return createErrorResponse(API_ERRORS.UNAUTHORIZED(), 'POST');
          }
        }

        const bodyResult = await parseRequestBody(request);
        if (!bodyResult.success) {
          return createErrorResponse(bodyResult.error, 'POST');
        }

        const body = bodyResult.data;

        // Validate required fields
        if (validation.create) {
          const validationError = validateRequired(body, validation.create);
          if (validationError) {
            return createErrorResponse(validationError, 'POST');
          }
        }

        // Custom validation
        if (validation.customCreate) {
          const customError = await validation.customCreate(body);
          if (customError) {
            return createErrorResponse(customError, 'POST');
          }
        }

        const newItem = await operations.create(body, { request });

        // Invalidate cache
        if (cache) {
          cache.invalidate();
        }

        return createResponse(newItem, { status: 201 });
      } catch (error) {
        return createErrorResponse(error, `POST ${resource}`);
      }
    };
  }

  // PUT handler
  if (operations.update || operations.updateMany) {
    handlers.PUT = async (request) => {
      try {
        // Apply middleware
        if (middleware.auth) {
          const authResult = await middleware.auth(request);
          if (!authResult.success) {
            return createErrorResponse(API_ERRORS.UNAUTHORIZED(), 'PUT');
          }
        }

        const bodyResult = await parseRequestBody(request);
        if (!bodyResult.success) {
          return createErrorResponse(bodyResult.error, 'PUT');
        }

        const body = bodyResult.data;

        // Handle batch updates
        if (Array.isArray(body) && operations.updateMany) {
          const updatedItems = await operations.updateMany(body, { request });
          
          // Invalidate cache
          if (cache) {
            cache.invalidate();
          }
          
          return createResponse(updatedItems);
        }

        // Single update
        if (!operations.update) {
          return createErrorResponse(
            API_ERRORS.SERVER_ERROR('update'),
            'PUT'
          );
        }

        const { id, ...updates } = body;

        if (!id) {
          return createErrorResponse(
            API_ERRORS.MISSING_ID(`${resourceName} ID`),
            'PUT'
          );
        }

        // Validate update fields
        if (validation.update) {
          const validationError = validateRequired(updates, validation.update);
          if (validationError) {
            return createErrorResponse(validationError, 'PUT');
          }
        }

        const updatedItem = await operations.update(id, updates, { request });

        if (!updatedItem) {
          return createErrorResponse(
            API_ERRORS.NOT_FOUND(resourceName),
            'PUT'
          );
        }

        // Invalidate cache
        if (cache) {
          cache.invalidate();
        }

        return createResponse(updatedItem);
      } catch (error) {
        return createErrorResponse(error, `PUT ${resource}`);
      }
    };
  }

  // DELETE handler
  if (operations.delete) {
    handlers.DELETE = async (request) => {
      try {
        // Apply middleware
        if (middleware.auth) {
          const authResult = await middleware.auth(request);
          if (!authResult.success) {
            return createErrorResponse(API_ERRORS.UNAUTHORIZED(), 'DELETE');
          }
        }

        const params = getSearchParams(request);
        const id = params.get('id');

        if (!id) {
          return createErrorResponse(
            API_ERRORS.MISSING_ID(`${resourceName} ID`),
            'DELETE'
          );
        }

        const deleted = await operations.delete(id, { request, params });

        if (!deleted) {
          return createErrorResponse(
            API_ERRORS.NOT_FOUND(resourceName),
            'DELETE'
          );
        }

        // Invalidate cache
        if (cache) {
          cache.invalidate();
        }

        return createResponse(
          { message: `${resourceName} deleted successfully` }
        );
      } catch (error) {
        return createErrorResponse(error, `DELETE ${resource}`);
      }
    };
  }

  return handlers;
}

/**
 * Create simple API route with standardized error handling
 */
export function createSimpleRoute(handler, operation = 'operation') {
  return async (request) => {
    try {
      const result = await handler(request);
      
      if (result && result.error) {
        return createErrorResponse(result, operation);
      }
      
      return createResponse(result);
    } catch (error) {
      return createErrorResponse(error, operation);
    }
  };
}

/**
 * Middleware helpers
 */
export const middleware = {
  /**
   * Simple auth check middleware
   */
  requireAuth: async (request) => {
    // Add your auth logic here
    const token = request.headers.get('authorization');
    if (!token) {
      return { success: false, error: 'Missing authorization' };
    }
    return { success: true, user: null }; // Replace with actual user
  },

  /**
   * Rate limiting middleware
   */
  rateLimit: (limit = 100, window = 60000) => {
    const requests = new Map();
    
    return async (request) => {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      const userRequests = requests.get(ip) || [];
      
      // Clean old requests
      const recentRequests = userRequests.filter(time => now - time < window);
      
      if (recentRequests.length >= limit) {
        return { success: false, error: 'Rate limit exceeded' };
      }
      
      recentRequests.push(now);
      requests.set(ip, recentRequests);
      
      return { success: true };
    };
  },

  /**
   * CORS middleware
   */
  cors: (options = {}) => {
    const { origin = '*', methods = 'GET,POST,PUT,DELETE', headers = '*' } = options;
    
    return async (request) => {
      return {
        success: true,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': methods,
          'Access-Control-Allow-Headers': headers,
        }
      };
    };
  },
};

/**
 * Cache helpers
 */
export function createSimpleCache(ttl = 300000) { // 5 minutes default
  let cache = null;
  let timestamp = 0;

  return {
    get() {
      if (cache && Date.now() - timestamp < ttl) {
        return cache;
      }
      return null;
    },
    
    set(data) {
      cache = data;
      timestamp = Date.now();
    },
    
    invalidate() {
      cache = null;
      timestamp = 0;
    }
  };
}

export { API_ERRORS, createResponse, createErrorResponse, getSearchParams, parseRequestBody, validateRequired };