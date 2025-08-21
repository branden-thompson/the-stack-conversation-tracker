/**
 * SSE Component Update Integration Tests
 * 
 * Tests the complete data flow: SSE Hook → Component → UI Updates
 * Ensures the exact issue we fixed (SSE data not reaching UI) is covered.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Zone } from '../../../components/conversation-board/Zone';
import { BoardCanvas } from '../../../components/conversation-board/BoardCanvas';
import { useSSECardEvents } from '../../../lib/hooks/useSSECardEvents';

// Mock the SSE hook
vi.mock('../../../lib/hooks/useSSECardEvents');
const mockUseSSECardEvents = vi.mocked(useSSECardEvents);

// Test data
const testCards = [
  {
    id: 'test-card-1',
    content: 'Test Card Content 1',
    type: 'topic', 
    zone: 'active',
    position: { x: 100, y: 100 },
    faceUp: true,
    createdAt: Date.now() - 1000,
    updatedAt: Date.now() - 500,
    createdByUserId: 'user-1'
  },
  {
    id: 'test-card-2',
    content: 'Test Card Content 2', 
    type: 'question',
    zone: 'parking',
    position: { x: 200, y: 200 },
    faceUp: true,
    createdAt: Date.now() - 2000,
    updatedAt: Date.now() - 1000,
    createdByUserId: 'user-1'
  }
];

describe('SSE Component Update Integration', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    
    mockUseSSECardEvents.mockReset();
  });
  
  afterEach(() => {
    queryClient.clear();
  });

  describe('Zone Component SSE Integration', () => {
    it('should receive and render SSE cards directly in Zone component', async () => {
      const activeCards = testCards.filter(card => card.zone === 'active');
      
      render(
        <Zone
          zoneId="active"
          cards={activeCards} // Direct SSE cards, not from getCardsByZone()
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          titleOverride="Active Conversation"
          users={[]}
        />
      );
      
      // Should render the card content
      await waitFor(() => {
        expect(screen.getByText('Test Card Content 1')).toBeInTheDocument();
      });
      
      // Should be in the active zone 
      expect(screen.getByText('Active Conversation')).toBeInTheDocument();
    });

    it('should update Zone content when SSE cards change', async () => {
      const initialCards = [testCards[0]];
      
      const { rerender } = render(
        <Zone
          zoneId="active"
          cards={initialCards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          titleOverride="Active Conversation"
          users={[]}
        />
      );
      
      // Initial render
      await waitFor(() => {
        expect(screen.getByText('Test Card Content 1')).toBeInTheDocument();
      });
      
      // Update with new card content via SSE
      const updatedCards = [{
        ...testCards[0],
        content: 'Updated via SSE',
        updatedAt: Date.now()
      }];
      
      rerender(
        <Zone
          zoneId="active"
          cards={updatedCards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          titleOverride="Active Conversation"
          users={[]}
        />
      );
      
      // Should show updated content
      await waitFor(() => {
        expect(screen.getByText('Updated via SSE')).toBeInTheDocument();
        expect(screen.queryByText('Test Card Content 1')).not.toBeInTheDocument();
      });
    });

    it('should handle zone changes via SSE card updates', async () => {
      // Start with card in active zone
      const { rerender } = render(
        <div>
          <Zone
            zoneId="active"
            cards={testCards.filter(card => card.zone === 'active')}
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            titleOverride="Active"
            users={[]}
          />
          <Zone
            zoneId="parking"
            cards={testCards.filter(card => card.zone === 'parking')}
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            titleOverride="Parking"
            users={[]}
          />
        </div>
      );
      
      // Initial state: card 1 in active, card 2 in parking
      await waitFor(() => {
        expect(screen.getByText('Test Card Content 1')).toBeInTheDocument();
        expect(screen.getByText('Test Card Content 2')).toBeInTheDocument();
      });
      
      // Move card 1 from active to parking via SSE
      const updatedCards = [
        { ...testCards[0], zone: 'parking', updatedAt: Date.now() },
        testCards[1]
      ];
      
      rerender(
        <div>
          <Zone
            zoneId="active"
            cards={updatedCards.filter(card => card.zone === 'active')}
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            titleOverride="Active"
            users={[]}
          />
          <Zone
            zoneId="parking"
            cards={updatedCards.filter(card => card.zone === 'parking')}
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            titleOverride="Parking"
            users={[]}
          />
        </div>
      );
      
      // Both cards should now be in parking zone
      await waitFor(() => {
        const activeZone = screen.getByText('Active').closest('div');
        const parkingZone = screen.getByText('Parking').closest('div');
        
        // Active zone should be empty
        expect(activeZone).not.toContainElement(screen.queryByText('Test Card Content 1'));
        
        // Parking zone should have both cards
        expect(parkingZone).toContainElement(screen.getByText('Test Card Content 1'));
        expect(parkingZone).toContainElement(screen.getByText('Test Card Content 2'));
      });
    });
  });

  describe('BoardCanvas SSE Integration', () => {
    it('should distribute SSE cards to correct zones using direct filtering', async () => {
      render(
        <BoardCanvas
          cards={testCards} // All SSE cards
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      // Each card should appear in its designated zone
      await waitFor(() => {
        expect(screen.getByText('Test Card Content 1')).toBeInTheDocument();
        expect(screen.getByText('Test Card Content 2')).toBeInTheDocument();
      });
      
      // Verify cards are in correct zones by checking zone structure
      const activeZone = screen.getByText(/active/i).closest('[class*="zone"], [class*="Zone"]');
      const parkingZone = screen.getByText(/parking/i).closest('[class*="zone"], [class*="Zone"]');
      
      if (activeZone && parkingZone) {
        expect(activeZone).toContainElement(screen.getByText('Test Card Content 1'));
        expect(parkingZone).toContainElement(screen.getByText('Test Card Content 2'));
      }
    });

    it('should never call getCardsByZone when SSE cards are provided', async () => {
      const mockGetCardsByZone = vi.fn(() => ({
        active: [],
        parking: [],
        resolved: [],
        unresolved: []
      }));
      
      render(
        <BoardCanvas
          cards={testCards} // SSE cards provided
          getCardsByZone={mockGetCardsByZone} // Should not be called
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Card Content 1')).toBeInTheDocument();
      });
      
      // Critical assertion: getCardsByZone should never be called
      expect(mockGetCardsByZone).not.toHaveBeenCalled();
    });

    it('should use cards.filter() for zone distribution, not getCardsByZone()', async () => {
      // Create spy on Array.prototype.filter to verify it's being used
      const originalFilter = Array.prototype.filter;
      const filterSpy = vi.fn(originalFilter);
      Array.prototype.filter = filterSpy;
      
      render(
        <BoardCanvas
          cards={testCards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Card Content 1')).toBeInTheDocument();
      });
      
      // Verify filter was called (for zone filtering)
      expect(filterSpy).toHaveBeenCalled();
      
      // Check that filter was called with zone criteria
      const filterCalls = filterSpy.mock.calls;
      const zoneFilterCalls = filterCalls.filter(call => 
        call[0] && call[0].toString().includes('zone')
      );
      expect(zoneFilterCalls.length).toBeGreaterThan(0);
      
      // Restore original filter
      Array.prototype.filter = originalFilter;
    });
  });

  describe('Real-Time Update Propagation', () => {
    it('should propagate SSE updates through component hierarchy', async () => {
      const TestComponent = ({ cards }) => (
        <BoardCanvas
          cards={cards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      const { rerender } = render(<TestComponent cards={[testCards[0]]} />);
      
      // Initial render
      await waitFor(() => {
        expect(screen.getByText('Test Card Content 1')).toBeInTheDocument();
      });
      
      // Simulate SSE update
      const updatedCard = {
        ...testCards[0],
        content: 'Real-time Updated Content',
        updatedAt: Date.now()
      };
      
      rerender(<TestComponent cards={[updatedCard]} />);
      
      // Should show updated content
      await waitFor(() => {
        expect(screen.getByText('Real-time Updated Content')).toBeInTheDocument();
        expect(screen.queryByText('Test Card Content 1')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple simultaneous card updates', async () => {
      const TestComponent = ({ cards }) => (
        <BoardCanvas
          cards={cards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      const { rerender } = render(<TestComponent cards={testCards} />);
      
      // Initial render
      await waitFor(() => {
        expect(screen.getByText('Test Card Content 1')).toBeInTheDocument();
        expect(screen.getByText('Test Card Content 2')).toBeInTheDocument();
      });
      
      // Update both cards simultaneously
      const updatedCards = testCards.map((card, index) => ({
        ...card,
        content: `Simultaneously Updated ${index + 1}`,
        updatedAt: Date.now()
      }));
      
      rerender(<TestComponent cards={updatedCards} />);
      
      // Both updates should be visible
      await waitFor(() => {
        expect(screen.getByText('Simultaneously Updated 1')).toBeInTheDocument();
        expect(screen.getByText('Simultaneously Updated 2')).toBeInTheDocument();
      });
    });

    it('should maintain UI state during rapid SSE updates', async () => {
      let updateCount = 0;
      const TestComponent = ({ cards }) => (
        <BoardCanvas
          cards={cards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      const { rerender } = render(<TestComponent cards={[testCards[0]]} />);
      
      // Simulate rapid updates (like our 800ms polling)
      const rapidUpdateInterval = setInterval(() => {
        updateCount++;
        const updatedCard = {
          ...testCards[0],
          content: `Rapid Update ${updateCount}`,
          updatedAt: Date.now()
        };
        
        rerender(<TestComponent cards={[updatedCard]} />);
      }, 100); // 10 updates per second
      
      // Let it run for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      clearInterval(rapidUpdateInterval);
      
      // Final update
      const finalCard = {
        ...testCards[0],
        content: 'Final Update State',
        updatedAt: Date.now()
      };
      
      rerender(<TestComponent cards={[finalCard]} />);
      
      // Should show final state
      await waitFor(() => {
        expect(screen.getByText('Final Update State')).toBeInTheDocument();
      });
      
      expect(updateCount).toBeGreaterThan(5); // Verify rapid updates occurred
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty SSE cards array gracefully', async () => {
      render(
        <BoardCanvas
          cards={[]} // Empty SSE cards
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      // Should render empty zones without crashing
      await waitFor(() => {
        expect(screen.getByText(/active/i)).toBeInTheDocument();
        expect(screen.getByText(/parking/i)).toBeInTheDocument();
      });
      
      // No cards should be rendered
      expect(screen.queryByText('Test Card Content')).not.toBeInTheDocument();
    });

    it('should handle malformed SSE card data', async () => {
      const malformedCards = [
        { id: 'card-1' }, // Missing required fields
        { id: 'card-2', content: 'Valid card', type: 'topic', zone: 'active' }
      ];
      
      // Should not crash with malformed data
      expect(() => {
        render(
          <BoardCanvas
            cards={malformedCards}
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            users={[]}
          />
        );
      }).not.toThrow();
      
      // Valid card should still render
      await waitFor(() => {
        expect(screen.getByText('Valid card')).toBeInTheDocument();
      });
    });

    it('should handle SSE cards with invalid zone gracefully', async () => {
      const invalidZoneCards = [{
        ...testCards[0],
        zone: 'nonexistent-zone' // Invalid zone
      }];
      
      render(
        <BoardCanvas
          cards={invalidZoneCards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      // Should render zones without crashing
      await waitFor(() => {
        expect(screen.getByText(/active/i)).toBeInTheDocument();
      });
      
      // Card with invalid zone should not appear in any zone
      // (or should be filtered out gracefully)
      const allZones = screen.getAllByText(/active|parking|resolved|unresolved/i);
      allZones.forEach(zone => {
        const zoneContainer = zone.closest('[class*="zone"], div');
        if (zoneContainer) {
          expect(zoneContainer).not.toContainElement(
            screen.queryByText('Test Card Content 1')
          );
        }
      });
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle large numbers of SSE cards efficiently', async () => {
      // Generate 50 cards across different zones
      const manyCards = Array.from({ length: 50 }, (_, i) => ({
        id: `perf-card-${i}`,
        content: `Performance Test Card ${i}`,
        type: 'topic',
        zone: ['active', 'parking', 'resolved', 'unresolved'][i % 4],
        position: { x: i * 50, y: i * 30 },
        faceUp: true,
        createdAt: Date.now() - i * 100,
        updatedAt: Date.now() - i * 50,
        createdByUserId: 'user-1'
      }));
      
      const startTime = performance.now();
      
      render(
        <BoardCanvas
          cards={manyCards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      // Should render first and last cards
      await waitFor(() => {
        expect(screen.getByText('Performance Test Card 0')).toBeInTheDocument();
        expect(screen.getByText('Performance Test Card 49')).toBeInTheDocument();
      });
      
      const renderTime = performance.now() - startTime;
      
      // Should render within reasonable time (1 second for 50 cards)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should efficiently filter cards by zone', async () => {
      const manyCards = Array.from({ length: 100 }, (_, i) => ({
        id: `filter-card-${i}`,
        content: `Filter Test Card ${i}`,
        type: 'topic',
        zone: 'active', // All in same zone to test filtering efficiency
        position: { x: i * 10, y: i * 10 },
        faceUp: true,
        createdAt: Date.now() - i,
        updatedAt: Date.now() - i,
        createdByUserId: 'user-1'
      }));
      
      const startTime = performance.now();
      
      render(
        <BoardCanvas
          cards={manyCards}
          onUpdateCard={vi.fn()}
          onDeleteCard={vi.fn()}
          users={[]}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Filter Test Card 0')).toBeInTheDocument();
      });
      
      const filterTime = performance.now() - startTime;
      
      // Filtering 100 cards should be nearly instantaneous
      expect(filterTime).toBeLessThan(500);
    });
  });
});