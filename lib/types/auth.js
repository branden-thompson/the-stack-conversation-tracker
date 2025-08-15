/**
 * Authentication and Multi-User Types
 * 
 * Defines the data structures for the authentication system,
 * user roles, permissions, and session management.
 */

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',           // Full system access, user management
  FACILITATOR: 'facilitator', // Can manage conversations, moderate discussions
  PARTICIPANT: 'participant', // Can create cards, participate in discussions
  OBSERVER: 'observer'       // Read-only access, can view but not modify
};

// Permissions
export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',
  
  // Card Management
  CARD_CREATE: 'card:create',
  CARD_EDIT_OWN: 'card:edit:own',
  CARD_EDIT_ALL: 'card:edit:all',
  CARD_DELETE_OWN: 'card:delete:own',
  CARD_DELETE_ALL: 'card:delete:all',
  CARD_ASSIGN: 'card:assign',
  
  // Conversation Management
  CONVERSATION_CREATE: 'conversation:create',
  CONVERSATION_CONTROL: 'conversation:control',
  CONVERSATION_MODERATE: 'conversation:moderate',
  
  // System Management
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_RESET: 'system:reset',
  SYSTEM_EXPORT: 'system:export'
};

// Role-Permission Mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [USER_ROLES.FACILITATOR]: [
    PERMISSIONS.CARD_CREATE,
    PERMISSIONS.CARD_EDIT_ALL,
    PERMISSIONS.CARD_DELETE_ALL,
    PERMISSIONS.CARD_ASSIGN,
    PERMISSIONS.CONVERSATION_CREATE,
    PERMISSIONS.CONVERSATION_CONTROL,
    PERMISSIONS.CONVERSATION_MODERATE,
    PERMISSIONS.SYSTEM_EXPORT
  ],
  
  [USER_ROLES.PARTICIPANT]: [
    PERMISSIONS.CARD_CREATE,
    PERMISSIONS.CARD_EDIT_OWN,
    PERMISSIONS.CARD_DELETE_OWN
  ],
  
  [USER_ROLES.OBSERVER]: [
    // Read-only access, no specific permissions needed
  ]
};

// Session Structure
export const SESSION_STRUCTURE = {
  id: 'string',           // Unique session ID
  userId: 'string',       // Associated user ID
  token: 'string',        // JWT or session token
  expiresAt: 'Date',      // Session expiration
  createdAt: 'Date',      // Session creation time
  lastActiveAt: 'Date',   // Last activity timestamp
  ipAddress: 'string',    // User IP address
  userAgent: 'string'     // Browser/device info
};

// Extended User Structure (additions to existing user model)
export const USER_AUTH_EXTENSIONS = {
  email: 'string',        // Login email (unique)
  passwordHash: 'string', // Hashed password
  role: 'string',         // User role from USER_ROLES
  isActive: 'boolean',    // Account status
  emailVerified: 'boolean', // Email verification status
  lastLoginAt: 'Date',    // Last login timestamp
  loginAttempts: 'number', // Failed login attempts
  lockedUntil: 'Date',    // Account lock expiration
  twoFactorEnabled: 'boolean', // 2FA status
  invitedBy: 'string',    // User ID who invited this user
  inviteToken: 'string',  // Invitation token
  inviteExpiresAt: 'Date' // Invitation expiration
};

// Real-time Collaboration
export const COLLABORATION_EVENTS = {
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  CARD_EDITING: 'card:editing',
  CARD_UPDATED: 'card:updated',
  CARD_MOVED: 'card:moved',
  CONVERSATION_STARTED: 'conversation:started',
  CONVERSATION_PAUSED: 'conversation:paused',
  CONVERSATION_STOPPED: 'conversation:stopped',
  USER_TYPING: 'user:typing'
};

// Helper Functions
export function hasPermission(userRole, permission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function canEditCard(user, card) {
  if (hasPermission(user.role, PERMISSIONS.CARD_EDIT_ALL)) {
    return true;
  }
  if (hasPermission(user.role, PERMISSIONS.CARD_EDIT_OWN)) {
    return card.createdByUserId === user.id;
  }
  return false;
}

export function canDeleteCard(user, card) {
  if (hasPermission(user.role, PERMISSIONS.CARD_DELETE_ALL)) {
    return true;
  }
  if (hasPermission(user.role, PERMISSIONS.CARD_DELETE_OWN)) {
    return card.createdByUserId === user.id;
  }
  return false;
}

export function getRoleDisplayName(role) {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.FACILITATOR]: 'Facilitator',
    [USER_ROLES.PARTICIPANT]: 'Participant',
    [USER_ROLES.OBSERVER]: 'Observer'
  };
  return roleNames[role] || 'Unknown';
}