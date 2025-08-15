import { describe, it, expect } from 'vitest';
import { getEventSummary, getPayloadDetails } from '@/lib/utils/timelineEvents';

describe('timelineEvents', () => {
  describe('getEventSummary', () => {
    it('returns correct summary for card.created events', () => {
      const event = {
        type: 'card.created',
        payload: { type: 'topic', zone: 'active' }
      };
      
      expect(getEventSummary(event)).toBe('Created topic in active');
    });

    it('handles card.created with missing payload fields', () => {
      const event = {
        type: 'card.created',
        payload: {}
      };
      
      expect(getEventSummary(event)).toBe('Created card in unknown zone');
    });

    it('returns correct summary for card.moved events', () => {
      const event = {
        type: 'card.moved',
        payload: { from: 'active', to: 'completed' }
      };
      
      expect(getEventSummary(event)).toBe('Moved from active to completed');
    });

    it('handles card.moved with missing payload fields', () => {
      const event = {
        type: 'card.moved',
        payload: { from: 'active' }
      };
      
      expect(getEventSummary(event)).toBe('Moved from active to ?');
    });

    it('returns correct summary for card.updated events', () => {
      const event = {
        type: 'card.updated',
        payload: { fields: ['content', 'position'] }
      };
      
      expect(getEventSummary(event)).toBe('Updated content, position');
    });

    it('handles card.updated with empty fields array', () => {
      const event = {
        type: 'card.updated',
        payload: { fields: [] }
      };
      
      expect(getEventSummary(event)).toBe('Updated properties');
    });

    it('handles card.updated with no fields, infers from payload keys', () => {
      const event = {
        type: 'card.updated',
        payload: { id: 'card-1', content: 'new content', position: 'updated' }
      };
      
      expect(getEventSummary(event)).toBe('Updated content, position');
    });

    it('returns correct summary for card.deleted events', () => {
      const event = {
        type: 'card.deleted',
        payload: { zone: 'active' }
      };
      
      expect(getEventSummary(event)).toBe('Deleted from active');
    });

    it('handles card.deleted with missing zone', () => {
      const event = {
        type: 'card.deleted',
        payload: {}
      };
      
      expect(getEventSummary(event)).toBe('Deleted from board');
    });

    it('returns event type for unknown event types', () => {
      const event = {
        type: 'unknown.event',
        payload: { some: 'data' }
      };
      
      expect(getEventSummary(event)).toBe('unknown.event');
    });

    it('handles events with missing payload', () => {
      const event = {
        type: 'card.created'
      };
      
      expect(getEventSummary(event)).toBe('Created card in unknown zone');
    });
  });

  describe('getPayloadDetails', () => {
    it('extracts all non-empty payload details', () => {
      const event = {
        payload: {
          id: 'card-1',
          type: 'topic',
          zone: 'active',
          content: 'Some content'
        }
      };
      
      const details = getPayloadDetails(event);
      
      expect(details).toHaveLength(4);
      expect(details).toContainEqual({ key: 'id', value: 'card-1' });
      expect(details).toContainEqual({ key: 'type', value: 'topic' });
      expect(details).toContainEqual({ key: 'zone', value: 'active' });
      expect(details).toContainEqual({ key: 'content', value: 'Some content' });
    });

    it('filters out null and undefined values', () => {
      const event = {
        payload: {
          id: 'card-1',
          type: null,
          zone: undefined,
          content: 'Some content'
        }
      };
      
      const details = getPayloadDetails(event);
      
      expect(details).toHaveLength(2);
      expect(details).toContainEqual({ key: 'id', value: 'card-1' });
      expect(details).toContainEqual({ key: 'content', value: 'Some content' });
    });

    it('filters out empty string values', () => {
      const event = {
        payload: {
          id: 'card-1',
          type: '',
          content: 'Some content'
        }
      };
      
      const details = getPayloadDetails(event);
      
      expect(details).toHaveLength(2);
      expect(details).toContainEqual({ key: 'id', value: 'card-1' });
      expect(details).toContainEqual({ key: 'content', value: 'Some content' });
    });

    it('converts non-string values to strings', () => {
      const event = {
        payload: {
          id: 123,
          active: true,
          count: 0,
          data: { nested: 'object' }
        }
      };
      
      const details = getPayloadDetails(event);
      
      expect(details).toContainEqual({ key: 'id', value: '123' });
      expect(details).toContainEqual({ key: 'active', value: 'true' });
      expect(details).toContainEqual({ key: 'count', value: '0' });
      expect(details).toContainEqual({ key: 'data', value: '[object Object]' });
    });

    it('handles missing payload gracefully', () => {
      const event = {};
      
      const details = getPayloadDetails(event);
      
      expect(details).toEqual([]);
    });

    it('handles null payload gracefully', () => {
      const event = { payload: null };
      
      const details = getPayloadDetails(event);
      
      expect(details).toEqual([]);
    });

    it('handles empty payload object', () => {
      const event = { payload: {} };
      
      const details = getPayloadDetails(event);
      
      expect(details).toEqual([]);
    });

    it('handles arrays in payload', () => {
      const event = {
        payload: {
          fields: ['content', 'position']
        }
      };
      
      const details = getPayloadDetails(event);
      
      expect(details).toHaveLength(1);
      expect(details[0].key).toBe('fields');
      expect(details[0].value).toBe('content,position'); // Arrays get stringified
    });
  });
});