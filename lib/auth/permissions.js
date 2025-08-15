/**
 * Permissions System
 * 
 * Handles user permissions, role-based access control, and authorization checks
 */

import { USER_ROLES, PERMISSIONS, ROLE_PERMISSIONS, hasPermission as baseHasPermission } from '@/lib/types/auth';

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;
  
  // System users have all permissions
  if (user.isSystemUser) return true;
  
  return baseHasPermission(user.role, permission);
}

/**
 * Check if a user can perform an action on a specific resource
 */
export function canPerformAction(user, action, resource = null) {
  if (!user) return false;

  switch (action) {
    case 'create_card':
      return hasPermission(user, PERMISSIONS.CARD_CREATE);
    
    case 'edit_card':
      if (!resource) return false;
      if (hasPermission(user, PERMISSIONS.CARD_EDIT_ALL)) return true;
      if (hasPermission(user, PERMISSIONS.CARD_EDIT_OWN)) {
        return resource.createdByUserId === user.id;
      }
      return false;
    
    case 'delete_card':
      if (!resource) return false;
      if (hasPermission(user, PERMISSIONS.CARD_DELETE_ALL)) return true;
      if (hasPermission(user, PERMISSIONS.CARD_DELETE_OWN)) {
        return resource.createdByUserId === user.id;
      }
      return false;
    
    case 'assign_card':
      return hasPermission(user, PERMISSIONS.CARD_ASSIGN);
    
    case 'control_conversation':
      return hasPermission(user, PERMISSIONS.CONVERSATION_CONTROL);
    
    case 'moderate_conversation':
      return hasPermission(user, PERMISSIONS.CONVERSATION_MODERATE);
    
    case 'manage_users':
      return hasPermission(user, PERMISSIONS.USER_MANAGE);
    
    case 'edit_user':
      if (!resource) return false;
      if (hasPermission(user, PERMISSIONS.USER_EDIT)) return true;
      // Users can edit their own profile
      return resource.id === user.id;
    
    case 'system_settings':
      return hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS);
    
    default:
      return false;
  }
}

/**
 * Get all permissions for a user role
 */
export function getUserPermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a user can access a specific route or feature
 */
export function canAccessRoute(user, route) {
  if (!user) return false;

  // Route-based access control
  const routePermissions = {
    '/admin': [USER_ROLES.ADMIN],
    '/admin/users': [USER_ROLES.ADMIN],
    '/admin/settings': [USER_ROLES.ADMIN],
    '/moderator': [USER_ROLES.ADMIN, USER_ROLES.FACILITATOR],
    '/dev': [USER_ROLES.ADMIN, USER_ROLES.FACILITATOR], // Dev tools for admins/facilitators
  };

  const allowedRoles = routePermissions[route];
  if (!allowedRoles) return true; // Open route

  return allowedRoles.includes(user.role);
}

/**
 * Filter cards based on user permissions
 */
export function filterCardsForUser(cards, user) {
  if (!user) return [];
  
  // Admins and facilitators can see all cards
  if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.FACILITATOR) {
    return cards;
  }
  
  // Participants can see all cards but with limited edit permissions
  if (user.role === USER_ROLES.PARTICIPANT) {
    return cards;
  }
  
  // Observers can see all cards (read-only)
  if (user.role === USER_ROLES.OBSERVER) {
    return cards;
  }
  
  return [];
}

/**
 * Add permission metadata to cards for UI rendering
 */
export function enrichCardsWithPermissions(cards, user) {
  return cards.map(card => ({
    ...card,
    permissions: {
      canEdit: canPerformAction(user, 'edit_card', card),
      canDelete: canPerformAction(user, 'delete_card', card),
      canAssign: canPerformAction(user, 'assign_card', card),
    }
  }));
}

/**
 * Middleware helper for API route protection
 */
export function requirePermission(permission) {
  return (user) => {
    if (!user) {
      return { allowed: false, error: 'Authentication required' };
    }
    
    if (!hasPermission(user, permission)) {
      return { 
        allowed: false, 
        error: `Permission required: ${permission}`,
        userRole: user.role,
        requiredPermission: permission
      };
    }
    
    return { allowed: true };
  };
}

/**
 * Middleware helper for role-based protection
 */
export function requireRole(roles) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (user) => {
    if (!user) {
      return { allowed: false, error: 'Authentication required' };
    }
    
    if (!roleArray.includes(user.role)) {
      return { 
        allowed: false, 
        error: `Role required: ${roleArray.join(' or ')}`,
        userRole: user.role,
        requiredRoles: roleArray
      };
    }
    
    return { allowed: true };
  };
}

/**
 * Filter users for display based on current user permissions
 */
export function filterUsersForDisplay(users, currentUser) {
  if (!currentUser) return [];
  
  // Admins can see all users with all details
  if (currentUser.role === USER_ROLES.ADMIN) {
    return users.map(user => ({
      ...user,
      // Remove sensitive data even for admins in API responses
      passwordHash: undefined,
      loginAttempts: undefined,
      lockedUntil: undefined
    }));
  }
  
  // Other users can see basic user info for collaboration purposes
  return users.map(user => ({
    id: user.id,
    name: user.name,
    profilePicture: user.profilePicture,
    role: user.role,
    isSystemUser: user.isSystemUser,
    isActive: user.isActive,
    createdAt: user.createdAt
  }));
}

/**
 * Get user capabilities for UI rendering
 */
export function getUserCapabilities(user) {
  if (!user) {
    return {
      canCreateCards: false,
      canEditAnyCard: false,
      canDeleteAnyCard: false,
      canAssignCards: false,
      canControlConversations: false,
      canModerateConversations: false,
      canManageUsers: false,
      canAccessSystemSettings: false,
      canAccessAdminArea: false,
      canAccessModeratorArea: false,
    };
  }

  return {
    canCreateCards: hasPermission(user, PERMISSIONS.CARD_CREATE),
    canEditAnyCard: hasPermission(user, PERMISSIONS.CARD_EDIT_ALL),
    canDeleteAnyCard: hasPermission(user, PERMISSIONS.CARD_DELETE_ALL),
    canAssignCards: hasPermission(user, PERMISSIONS.CARD_ASSIGN),
    canControlConversations: hasPermission(user, PERMISSIONS.CONVERSATION_CONTROL),
    canModerateConversations: hasPermission(user, PERMISSIONS.CONVERSATION_MODERATE),
    canManageUsers: hasPermission(user, PERMISSIONS.USER_MANAGE),
    canAccessSystemSettings: hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS),
    canAccessAdminArea: user.role === USER_ROLES.ADMIN,
    canAccessModeratorArea: [USER_ROLES.ADMIN, USER_ROLES.FACILITATOR].includes(user.role),
  };
}