import { describe, it, expect } from 'vitest';
import { EVENT_TYPES, DEFAULT_EVENT_CONFIG, getEventConfig } from '@/lib/utils/timelineConstants';

describe('timelineConstants', () => {
  describe('EVENT_TYPES', () => {
    it('contains configuration for all event types', () => {
      expect(EVENT_TYPES).toHaveProperty('card.created');
      expect(EVENT_TYPES).toHaveProperty('card.moved');
      expect(EVENT_TYPES).toHaveProperty('card.updated');
      expect(EVENT_TYPES).toHaveProperty('card.deleted');
    });

    it('has consistent structure for all event types', () => {
      Object.values(EVENT_TYPES).forEach(config => {
        expect(config).toHaveProperty('icon');
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('color');
        expect(config).toHaveProperty('bgClass');
        expect(config).toHaveProperty('iconClass');
        expect(config).toHaveProperty('description');
      });
    });

    it('has correct labels for event types', () => {
      expect(EVENT_TYPES['card.created'].label).toBe('Card Created');
      expect(EVENT_TYPES['card.moved'].label).toBe('Card Moved');
      expect(EVENT_TYPES['card.updated'].label).toBe('Card Updated');
      expect(EVENT_TYPES['card.deleted'].label).toBe('Card Deleted');
    });

    it('has appropriate colors for event types', () => {
      expect(EVENT_TYPES['card.created'].color).toBe('emerald');
      expect(EVENT_TYPES['card.moved'].color).toBe('blue');
      expect(EVENT_TYPES['card.updated'].color).toBe('amber');
      expect(EVENT_TYPES['card.deleted'].color).toBe('rose');
    });
  });

  describe('DEFAULT_EVENT_CONFIG', () => {
    it('has all required properties', () => {
      expect(DEFAULT_EVENT_CONFIG).toHaveProperty('icon');
      expect(DEFAULT_EVENT_CONFIG).toHaveProperty('label');
      expect(DEFAULT_EVENT_CONFIG).toHaveProperty('color');
      expect(DEFAULT_EVENT_CONFIG).toHaveProperty('bgClass');
      expect(DEFAULT_EVENT_CONFIG).toHaveProperty('iconClass');
      expect(DEFAULT_EVENT_CONFIG).toHaveProperty('description');
    });

    it('uses gray color scheme for unknown events', () => {
      expect(DEFAULT_EVENT_CONFIG.color).toBe('gray');
      expect(DEFAULT_EVENT_CONFIG.label).toBe('Unknown Event');
    });
  });

  describe('getEventConfig', () => {
    it('returns correct config for known event types', () => {
      const config = getEventConfig('card.created');
      expect(config).toBe(EVENT_TYPES['card.created']);
    });

    it('returns default config with custom label for unknown event types', () => {
      const config = getEventConfig('unknown.event');
      expect(config.label).toBe('unknown.event');
      expect(config.color).toBe('gray');
      expect(config.description).toBe('Unknown event type');
    });

    it('handles undefined event type', () => {
      const config = getEventConfig();
      expect(config.label).toBe('undefined');
      expect(config.color).toBe('gray');
    });

    it('handles null event type', () => {
      const config = getEventConfig(null);
      expect(config.label).toBe('null');
      expect(config.color).toBe('gray');
    });
  });
});