/**
 * Event Type Registry and Validation System
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | CRITICAL INFRASTRUCTURE
 * Centralized event schema definition and validation for SSE system
 * 
 * Features:
 * - Strongly-typed event schemas
 * - Business rule validation
 * - Authorization validation
 * - Event routing configuration
 * - Performance optimization flags
 */

import { z } from 'zod';

/**
 * Base Event Schema
 * All SSE events must conform to this base structure
 */
const BaseEventSchema = z.object({
  eventType: z.string().min(1),
  eventId: z.string().optional(),
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  timestamp: z.number().positive(),
  version: z.string().default('1.0'),
  source: z.enum(['client', 'server', 'system']).default('client')
});

/**
 * Card Event Schemas
 * Events related to card operations (CRUD)
 */
const CardEventDataSchema = z.object({
  cardId: z.string().min(1),
  cardData: z.object({
    id: z.string().optional(),
    type: z.enum(['topic', 'question', 'accusation', 'fact', 'guess', 'opinion']).optional(),
    content: z.string().optional(),
    zone: z.enum(['active', 'completed', 'parked', 'archive']).optional(),
    position: z.object({
      x: z.number(),
      y: z.number()
    }).optional(),
    stackOrder: z.number().optional(),
    faceUp: z.boolean().optional(),
    createdByUserId: z.string().optional(),
    assignedToUserId: z.string().nullable().optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional()
  }).optional(),
  fromZone: z.string().optional(),
  toZone: z.string().optional(),
  updates: z.record(z.any()).optional()
});

const CardEventSchema = BaseEventSchema.extend({
  eventType: z.enum([
    'card.created',
    'card.updated', 
    'card.moved',
    'card.deleted',
    'card.assigned',
    'card.flipped'
  ]),
  eventData: CardEventDataSchema
});

/**
 * Session Event Schemas
 * Events related to user sessions and activity
 */
const SessionEventDataSchema = z.object({
  activityType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  duration: z.number().optional(),
  reason: z.enum(['user-logout', 'timeout', 'system-shutdown']).optional(),
  userType: z.enum(['registered', 'guest', 'system']).optional()
});

const SessionEventSchema = BaseEventSchema.extend({
  eventType: z.enum([
    'session.started',
    'session.ended',
    'session.activity',
    'session.heartbeat'
  ]),
  eventData: SessionEventDataSchema
});

/**
 * UI Event Schemas
 * Events related to user interface interactions
 */
const UIEventDataSchema = z.object({
  dialogType: z.string().optional(),
  trayType: z.string().optional(),
  theme: z.string().optional(),
  buttonId: z.string().optional(),
  componentName: z.string().optional(),
  interactionType: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const UIEventSchema = BaseEventSchema.extend({
  eventType: z.enum([
    'ui.dialogOpen',
    'ui.dialogClose',
    'ui.trayOpen',
    'ui.trayClose', 
    'ui.themeChanged',
    'ui.buttonClick',
    'ui.hover',
    'ui.focus'
  ]),
  eventData: UIEventDataSchema
});

/**
 * System Event Schemas
 * Events related to system operations and health
 */
const SystemEventDataSchema = z.object({
  healthStatus: z.enum(['healthy', 'degraded', 'critical']).optional(),
  errorMessage: z.string().optional(),
  performanceMetrics: z.record(z.number()).optional(),
  circuitBreakerState: z.enum(['closed', 'open', 'half-open']).optional()
});

const SystemEventSchema = BaseEventSchema.extend({
  eventType: z.enum([
    'system.health',
    'system.error',
    'system.warning',
    'system.circuitBreaker',
    'connection.established',
    'connection.lost',
    'heartbeat'
  ]),
  eventData: SystemEventDataSchema
});

/**
 * Event Registry Configuration
 * Defines behavior and routing for each event type
 */
export const EVENT_REGISTRY = {
  // Card Events - Critical data operations
  'card.created': {
    schema: CardEventSchema,
    persistence: true,
    broadcast: true,
    priority: 'high',
    fallback: 'react-query-invalidate',
    authorization: 'session-owner',
    rateLimit: { window: 60000, max: 100 } // 100 per minute
  },
  'card.updated': {
    schema: CardEventSchema,
    persistence: true,
    broadcast: true,
    priority: 'high',
    fallback: 'react-query-invalidate',
    authorization: 'session-owner',
    rateLimit: { window: 60000, max: 200 }
  },
  'card.moved': {
    schema: CardEventSchema,
    persistence: true,
    broadcast: true,
    priority: 'high',
    fallback: 'react-query-invalidate',
    authorization: 'session-owner',
    rateLimit: { window: 60000, max: 150 }
  },
  'card.deleted': {
    schema: CardEventSchema,
    persistence: true,
    broadcast: true,
    priority: 'critical',
    fallback: 'react-query-invalidate',
    authorization: 'session-owner',
    rateLimit: { window: 60000, max: 50 }
  },

  // Session Events - User activity tracking
  'session.started': {
    schema: SessionEventSchema,
    persistence: true,
    broadcast: false,
    priority: 'medium',
    fallback: 'local-storage',
    authorization: 'session-owner',
    rateLimit: { window: 60000, max: 10 }
  },
  'session.ended': {
    schema: SessionEventSchema,
    persistence: true,
    broadcast: false,
    priority: 'medium',
    fallback: 'local-storage',
    authorization: 'session-owner',
    rateLimit: { window: 60000, max: 10 }
  },
  'session.activity': {
    schema: SessionEventSchema,
    persistence: false,
    broadcast: false,
    priority: 'low',
    fallback: 'none',
    authorization: 'session-owner',
    rateLimit: { window: 60000, max: 500 }
  },

  // UI Events - User interface interactions
  'ui.themeChanged': {
    schema: UIEventSchema,
    persistence: true,
    broadcast: true,
    priority: 'medium',
    fallback: 'local-storage',
    authorization: 'user-scoped',
    rateLimit: { window: 60000, max: 20 }
  },
  'ui.buttonClick': {
    schema: UIEventSchema,
    persistence: false,
    broadcast: false,
    priority: 'low',
    fallback: 'none',
    authorization: 'session-owner',
    rateLimit: { window: 60000, max: 1000 }
  },
  'ui.dialogOpen': {
    schema: UIEventSchema,
    persistence: false,
    broadcast: true,
    priority: 'low',
    fallback: 'none',
    authorization: 'user-scoped',
    rateLimit: { window: 60000, max: 100 }
  },

  // System Events - Health and monitoring
  'system.health': {
    schema: SystemEventSchema,
    persistence: false,
    broadcast: false,
    priority: 'low',
    fallback: 'none',
    authorization: 'system',
    rateLimit: { window: 60000, max: 60 }
  },
  'connection.established': {
    schema: SystemEventSchema,
    persistence: false,
    broadcast: false,
    priority: 'medium',
    fallback: 'none',
    authorization: 'system',
    rateLimit: { window: 60000, max: 100 }
  },
  'heartbeat': {
    schema: SystemEventSchema,
    persistence: false,
    broadcast: false,
    priority: 'low',
    fallback: 'none',
    authorization: 'system',
    rateLimit: { window: 60000, max: 120 }
  }
};

/**
 * Event Validator Class
 * Handles validation of events against registered schemas
 */
export class EventValidator {
  /**
   * Validate event against registered schema
   */
  static validateEvent(event) {
    try {
      // Check if event type is registered
      const config = EVENT_REGISTRY[event.eventType];
      if (!config) {
        return {
          valid: false,
          error: `Unknown event type: ${event.eventType}`,
          code: 'UNKNOWN_EVENT_TYPE'
        };
      }

      // Validate against schema
      const validationResult = config.schema.safeParse(event);
      if (!validationResult.success) {
        return {
          valid: false,
          error: `Schema validation failed: ${validationResult.error.message}`,
          code: 'SCHEMA_VALIDATION_FAILED',
          details: validationResult.error.errors
        };
      }

      // Validate business rules
      const businessValidation = this.validateBusinessRules(event);
      if (!businessValidation.valid) {
        return businessValidation;
      }

      // Validate authorization
      const authValidation = this.validateAuthorization(event);
      if (!authValidation.valid) {
        return authValidation;
      }

      return { valid: true, event: validationResult.data };

    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error.message}`,
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Validate business rules for specific event types
   */
  static validateBusinessRules(event) {
    switch (event.eventType) {
      case 'card.moved':
        return this.validateCardMove(event);
      case 'card.updated':
        return this.validateCardUpdate(event);
      case 'card.deleted':
        return this.validateCardDelete(event);
      default:
        return { valid: true };
    }
  }

  /**
   * Validate card move operation
   */
  static validateCardMove(event) {
    const { cardId, fromZone, toZone } = event.eventData;

    if (!cardId) {
      return {
        valid: false,
        error: 'Card ID required for move operation',
        code: 'MISSING_CARD_ID'
      };
    }

    const validZones = ['active', 'completed', 'parked', 'archive'];
    if (toZone && !validZones.includes(toZone)) {
      return {
        valid: false,
        error: `Invalid target zone: ${toZone}`,
        code: 'INVALID_ZONE'
      };
    }

    return { valid: true };
  }

  /**
   * Validate card update operation
   */
  static validateCardUpdate(event) {
    const { cardId, updates } = event.eventData;

    if (!cardId) {
      return {
        valid: false,
        error: 'Card ID required for update operation',
        code: 'MISSING_CARD_ID'
      };
    }

    if (!updates || Object.keys(updates).length === 0) {
      return {
        valid: false,
        error: 'Update data required for update operation',
        code: 'MISSING_UPDATE_DATA'
      };
    }

    return { valid: true };
  }

  /**
   * Validate card delete operation
   */
  static validateCardDelete(event) {
    const { cardId } = event.eventData;

    if (!cardId) {
      return {
        valid: false,
        error: 'Card ID required for delete operation',
        code: 'MISSING_CARD_ID'
      };
    }

    return { valid: true };
  }

  /**
   * Validate event authorization
   */
  static validateAuthorization(event) {
    const config = EVENT_REGISTRY[event.eventType];
    if (!config) {
      return { valid: false, error: 'Unknown event type for authorization' };
    }

    switch (config.authorization) {
      case 'session-owner':
        return this.validateSessionOwner(event);
      case 'user-scoped':
        return this.validateUserScoped(event);
      case 'system':
        return this.validateSystemAuth(event);
      default:
        return { valid: true };
    }
  }

  /**
   * Validate session owner authorization
   */
  static validateSessionOwner(event) {
    if (!event.sessionId || !event.userId) {
      return {
        valid: false,
        error: 'Session ID and User ID required for session-owner authorization',
        code: 'MISSING_SESSION_AUTH'
      };
    }

    // Additional session validation would go here
    // For now, basic presence check is sufficient
    return { valid: true };
  }

  /**
   * Validate user-scoped authorization
   */
  static validateUserScoped(event) {
    if (!event.userId) {
      return {
        valid: false,
        error: 'User ID required for user-scoped authorization',
        code: 'MISSING_USER_ID'
      };
    }

    return { valid: true };
  }

  /**
   * Validate system authorization
   */
  static validateSystemAuth(event) {
    if (event.source !== 'system') {
      return {
        valid: false,
        error: 'System events can only be emitted by system source',
        code: 'INVALID_SYSTEM_SOURCE'
      };
    }

    return { valid: true };
  }

  /**
   * Get event configuration
   */
  static getEventConfig(eventType) {
    return EVENT_REGISTRY[eventType] || null;
  }

  /**
   * Check if event should be persisted
   */
  static shouldPersist(eventType) {
    const config = EVENT_REGISTRY[eventType];
    return config ? config.persistence : false;
  }

  /**
   * Check if event should be broadcast
   */
  static shouldBroadcast(eventType) {
    const config = EVENT_REGISTRY[eventType];
    return config ? config.broadcast : false;
  }

  /**
   * Get event priority
   */
  static getEventPriority(eventType) {
    const config = EVENT_REGISTRY[eventType];
    return config ? config.priority : 'low';
  }
}