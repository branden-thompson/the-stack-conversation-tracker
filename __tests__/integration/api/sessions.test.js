/**
 * Integration tests for session API endpoints
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/sessions/route';
import { POST as POST_EVENTS, GET as GET_EVENTS } from '@/app/api/sessions/events/route';
import { POST as POST_SIMULATE, DELETE as DELETE_SIMULATE, GET as GET_SIMULATE } from '@/app/api/sessions/simulate/route';
import { NextRequest } from 'next/server';

describe('Sessions API', () => {
  describe('GET /api/sessions', () => {
    it('should return grouped sessions', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('grouped');
      expect(data).toHaveProperty('guests');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test-user-123',
          userType: 'registered',
          browser: 'Chrome 120 on macOS',
          metadata: {
            route: '/test',
            userName: 'Test User',
          },
        }),
      });
      
      const response = await POST(request);
      const session = await response.json();
      
      expect(response.status).toBe(201);
      expect(session).toHaveProperty('id');
      expect(session.userId).toBe('test-user-123');
      expect(session.userType).toBe('registered');
      expect(session.status).toBe('active');
      expect(session.browser).toBe('Chrome 120 on macOS');
      expect(session.metadata.userName).toBe('Test User');
    });

    it('should handle guest sessions', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'guest_abc123',
          userType: 'guest',
          browser: 'Safari 17 on macOS',
        }),
      });
      
      const response = await POST(request);
      const session = await response.json();
      
      expect(response.status).toBe(201);
      expect(session.userType).toBe('guest');
      expect(session.userId).toBe('guest_abc123');
    });
  });

  describe('DELETE /api/sessions', () => {
    it('should end a session', async () => {
      // First create a session
      const createRequest = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test-user-456',
          userType: 'registered',
        }),
      });
      
      const createResponse = await POST(createRequest);
      const session = await createResponse.json();
      
      // Then end it
      const deleteRequest = new NextRequest(`http://localhost:3000/api/sessions?id=${session.id}`, {
        method: 'DELETE',
      });
      
      const deleteResponse = await DELETE(deleteRequest);
      const result = await deleteResponse.json();
      
      expect(deleteResponse.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.session.status).toBe('ended');
    });

    it('should return 404 for non-existent session', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions?id=non-existent', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request);
      const result = await response.json();
      
      expect(response.status).toBe(404);
      expect(result.error).toBe('Session not found');
    });

    it('should return 400 if no session ID provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('Session ID required');
    });
  });
});

describe('Session Events API', () => {
  describe('POST /api/sessions/events', () => {
    it('should batch ingest events', async () => {
      const events = [
        {
          id: 'evt1',
          type: 'page_view',
          timestamp: Date.now(),
          metadata: { route: '/page1' },
        },
        {
          id: 'evt2',
          type: 'card_created',
          timestamp: Date.now(),
          metadata: { cardId: 'card123' },
        },
      ];
      
      const request = new NextRequest('http://localhost:3000/api/sessions/events', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'session123',
          events,
        }),
      });
      
      const response = await POST_EVENTS(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.eventsReceived).toBe(2);
    });

    it('should return 400 for invalid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions/events', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          events: 'not-an-array',
        }),
      });
      
      const response = await POST_EVENTS(request);
      const result = await response.json();
      
      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid request body');
    });
  });

  describe('GET /api/sessions/events', () => {
    it('should retrieve events for a session', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions/events?sessionId=session123&limit=50');
      
      const response = await GET_EVENTS(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.events)).toBe(true);
    });

    it('should filter by category', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions/events?category=navigation&limit=20');
      
      const response = await GET_EVENTS(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result).toHaveProperty('events');
      // All events should be navigation category (if any exist)
      result.events.forEach(event => {
        if (event.category) {
          expect(event.category).toBe('navigation');
        }
      });
    });

    it('should return all recent events when no sessionId specified', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions/events');
      
      const response = await GET_EVENTS(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('total');
    });
  });
});

describe('Session Simulation API', () => {
  describe('POST /api/sessions/simulate', () => {
    it('should create simulated sessions', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions/simulate', {
        method: 'POST',
        body: JSON.stringify({
          count: 3,
          autoActivity: true,
        }),
      });
      
      const response = await POST_SIMULATE(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.sessions).toHaveLength(3);
      expect(result.sessions[0]).toHaveProperty('id');
      expect(result.sessions[0].metadata.simulated).toBe(true);
    });

    it('should create single session by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions/simulate', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      
      const response = await POST_SIMULATE(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.sessions).toHaveLength(1);
    });
  });

  describe('DELETE /api/sessions/simulate', () => {
    it('should remove all simulated sessions', async () => {
      // First create some simulated sessions
      const createRequest = new NextRequest('http://localhost:3000/api/sessions/simulate', {
        method: 'POST',
        body: JSON.stringify({ count: 3 }),
      });
      
      await POST_SIMULATE(createRequest);
      
      // Then remove all
      const deleteRequest = new NextRequest('http://localhost:3000/api/sessions/simulate', {
        method: 'DELETE',
      });
      
      const response = await DELETE_SIMULATE(deleteRequest);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.removed).toBeGreaterThanOrEqual(0);
    });

    it('should remove specific simulated session', async () => {
      // First create a simulated session
      const createRequest = new NextRequest('http://localhost:3000/api/sessions/simulate', {
        method: 'POST',
        body: JSON.stringify({ count: 1 }),
      });
      
      const createResponse = await POST_SIMULATE(createRequest);
      const { sessions } = await createResponse.json();
      const sessionId = sessions[0].id;
      
      // Then remove it
      const deleteRequest = new NextRequest(`http://localhost:3000/api/sessions/simulate?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      const response = await DELETE_SIMULATE(deleteRequest);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.removed).toBe(1);
    });
  });

  describe('GET /api/sessions/simulate', () => {
    it('should retrieve simulated sessions', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions/simulate');
      
      const response = await GET_SIMULATE(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result).toHaveProperty('sessions');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.sessions)).toBe(true);
    });
  });
});