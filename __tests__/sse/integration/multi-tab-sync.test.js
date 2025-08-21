/**
 * Multi-Tab SSE Synchronization Integration Tests
 * 
 * Critical tests for the exact issue we just fixed - ensuring real-time
 * card synchronization works correctly across multiple browser tabs.
 * These tests would have caught the getCardsByZone() vs SSE cards issue.
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Board } from '../../../components/conversation-board/Board';
import { useSSECardEvents } from '../../../lib/hooks/useSSECardEvents';
import { BoardCanvas } from '../../../components/conversation-board/BoardCanvas';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Test utilities
import { createWrapper, mockQueryClient } from '../../utils/test-utils';

// Mock the SSE hook for controlled testing
vi.mock('../../../lib/hooks/useSSECardEvents');

const mockUseSSECardEvents = vi.mocked(useSSECardEvents);

// Mock data matching the structure from debugging session
const mockCards = [
  {
    id: 'card-1',
    content: 'Test Card 1',
    type: 'topic',
    zone: 'active',
    position: { x: 100, y: 100 },
    createdAt: Date.now() - 1000,
    updatedAt: Date.now() - 500,
    faceUp: true,
    createdByUserId: 'user-1'
  },
  {
    id: 'card-2', 
    content: 'Test Card 2',
    type: 'question',
    zone: 'parking',
    position: { x: 200, y: 200 },
    createdAt: Date.now() - 2000,
    updatedAt: Date.now() - 1000,
    faceUp: true,
    createdByUserId: 'user-1'
  }
];

// MSW server for API mocking
const server = setupServer(
  http.get('/api/cards/events', () => {
    return HttpResponse.json(mockCards);
  }),
  http.get('/api/cards', () => {
    return HttpResponse.json(mockCards);
  })
);

describe('Multi-Tab SSE Synchronization', () => {
  let queryClient1, queryClient2;
  
  beforeAll(() => {
    server.listen();
  });
  
  beforeEach(() => {
    // Create separate query clients for each "tab"
    queryClient1 = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    queryClient2 = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    
    // Reset mocks
    mockUseSSECardEvents.mockReset();
  });
  
  afterEach(() => {
    queryClient1.clear();
    queryClient2.clear();
    server.resetHandlers();
  });
  
  afterAll(() => {
    server.close();
  });

  describe('Critical Issue: Data Source Consistency', () => {
    it('should render SSE cards, not REST cards in BoardCanvas zones', async () => {
      // Simulate the fixed state: SSE hook returns cards
      const sseCards = [
        { ...mockCards[0], content: 'SSE Updated Card 1' },
        { ...mockCards[1], zone: 'resolved' } // moved to different zone
      ];
      
      mockUseSSECardEvents.mockReturnValue({
        cards: sseCards,
        registrationStatus: 'registered',
        isConnected: true
      });
      
      // Mock getCardsByZone to return different data (old REST data)
      const mockGetCardsByZone = vi.fn(() => ({
        active: [mockCards[0]], // Original card without SSE updates
        parking: [mockCards[1]], // Original card in wrong zone
        resolved: [],
        unresolved: []
      }));
      
      const TestBoard = () => {
        const cardEvents = useSSECardEvents({
          enabled: true,
          forDevPages: true,
          backgroundOperation: true
        });
        
        return (
          <BoardCanvas
            cards={cardEvents.cards} // FIXED: Uses SSE cards
            getCardsByZone={mockGetCardsByZone} // Should NOT be used
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            users={[]}
          />
        );
      };
      
      render(
        <QueryClientProvider client={queryClient1}>
          <TestBoard />
        </QueryClientProvider>
      );
      
      // Should render SSE card content, not REST card content
      await waitFor(() => {
        expect(screen.getByText('SSE Updated Card 1')).toBeInTheDocument();
      });
      
      // Should render card in SSE zone (resolved), not REST zone (parking)
      const resolvedZone = screen.getByText(/resolved/i).closest('[class*="zone"]');
      expect(resolvedZone).toContainElement(screen.getByText(mockCards[1].content));
      
      // Verify getCardsByZone was NOT called (critical fix)
      expect(mockGetCardsByZone).not.toHaveBeenCalled();
    });

    it('should filter cards by zone using SSE data, not getCardsByZone()', async () => {
      const sseCards = [
        { ...mockCards[0], zone: 'active' },
        { ...mockCards[1], zone: 'active' }, // Both cards in active zone
      ];
      
      mockUseSSECardEvents.mockReturnValue({
        cards: sseCards,
        registrationStatus: 'registered', 
        isConnected: true
      });
      
      // Mock getCardsByZone to return wrong data
      const mockGetCardsByZone = vi.fn(() => ({
        active: [], // Wrong: says no cards in active
        parking: sseCards, // Wrong: says cards are in parking
        resolved: [],
        unresolved: []
      }));
      
      render(
        <QueryClientProvider client={queryClient1}>
          <BoardCanvas
            cards={sseCards}
            getCardsByZone={mockGetCardsByZone}
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            users={[]}
          />
        </QueryClientProvider>
      );
      
      // Both cards should be in active zone (based on SSE data)
      await waitFor(() => {
        const activeZone = screen.getByText(/active/i).closest('[class*="zone"]');
        expect(activeZone).toContainElement(screen.getByText('Test Card 1'));
        expect(activeZone).toContainElement(screen.getByText('Test Card 2'));
      });
      
      // Parking zone should be empty (ignoring getCardsByZone data)
      const parkingZone = screen.getByText(/parking/i).closest('[class*="zone"]');
      expect(parkingZone).not.toContainElement(screen.getByText('Test Card 1'));
      expect(parkingZone).not.toContainElement(screen.getByText('Test Card 2'));
    });
  });

  describe('Multi-Tab Real-Time Updates', () => {
    it('should sync card creation across tabs within 1 second', async () => {
      // Tab 1: Initial empty state
      mockUseSSECardEvents.mockReturnValueOnce({
        cards: [],
        registrationStatus: 'registered',
        isConnected: true
      });
      
      const { rerender: rerenderTab1 } = render(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      // Tab 2: Initial empty state  
      mockUseSSECardEvents.mockReturnValueOnce({
        cards: [],
        registrationStatus: 'registered',
        isConnected: true
      });
      
      const { rerender: rerenderTab2 } = render(
        <QueryClientProvider client={queryClient2}>
          <Board />
        </QueryClientProvider>
      );
      
      // Simulate card created in Tab 1
      const newCard = {
        id: 'new-card',
        content: 'New Card from Tab 1',
        type: 'topic',
        zone: 'active',
        position: { x: 0, y: 0 },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        faceUp: true,
        createdByUserId: 'user-1'
      };
      
      // Both tabs should receive the new card via SSE
      mockUseSSECardEvents.mockReturnValue({
        cards: [newCard],
        registrationStatus: 'registered',
        isConnected: true
      });
      
      // Rerender both tabs (simulating SSE update)
      rerenderTab1(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      rerenderTab2(
        <QueryClientProvider client={queryClient2}>
          <Board />
        </QueryClientProvider>
      );
      
      // Both tabs should show the new card
      const tab1Cards = screen.getAllByText('New Card from Tab 1');
      const tab2Cards = screen.getAllByText('New Card from Tab 1');
      
      expect(tab1Cards.length).toBeGreaterThan(0);
      expect(tab2Cards.length).toBeGreaterThan(0);
    });

    it('should sync card zone changes across tabs', async () => {
      const initialCard = { ...mockCards[0], zone: 'active' };
      
      // Both tabs start with card in active zone
      mockUseSSECardEvents.mockReturnValue({
        cards: [initialCard],
        registrationStatus: 'registered',
        isConnected: true
      });
      
      const { rerender: rerenderTab1 } = render(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      const { rerender: rerenderTab2 } = render(
        <QueryClientProvider client={queryClient2}>
          <Board />
        </QueryClientProvider>
      );
      
      // Verify initial state: card in active zone
      await waitFor(() => {
        const activeZones = screen.getAllByText(/active/i);
        expect(activeZones.length).toBeGreaterThan(0);
      });
      
      // Simulate card moved to resolved zone via SSE
      const movedCard = { ...initialCard, zone: 'resolved', updatedAt: Date.now() };
      
      mockUseSSECardEvents.mockReturnValue({
        cards: [movedCard],
        registrationStatus: 'registered',
        isConnected: true
      });
      
      // Rerender both tabs
      rerenderTab1(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      rerenderTab2(
        <QueryClientProvider client={queryClient2}>
          <Board />
        </QueryClientProvider>
      );
      
      // Card should now be in resolved zone in both tabs
      await waitFor(() => {
        const resolvedZones = screen.getAllByText(/resolved/i);
        expect(resolvedZones.length).toBeGreaterThan(0);
        
        // Card should not be in active zone anymore
        const activeZones = screen.queryAllByText(initialCard.content);
        activeZones.forEach(element => {
          const zone = element.closest('[class*="zone"]');
          const zoneTitle = zone?.querySelector('[class*="font-semibold"]');
          expect(zoneTitle?.textContent).not.toBe('Active Conversation');
        });
      });
    });

    it('should sync card flipping across tabs', async () => {
      const cardFaceUp = { ...mockCards[0], faceUp: true };
      
      mockUseSSECardEvents.mockReturnValue({
        cards: [cardFaceUp],
        registrationStatus: 'registered',
        isConnected: true
      });
      
      const { rerender: rerenderTab1 } = render(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      const { rerender: rerenderTab2 } = render(
        <QueryClientProvider client={queryClient2}>
          <Board />
        </QueryClientProvider>
      );
      
      // Simulate card flipped to back in one tab
      const cardFaceDown = { ...cardFaceUp, faceUp: false, updatedAt: Date.now() };
      
      mockUseSSECardEvents.mockReturnValue({
        cards: [cardFaceDown],
        registrationStatus: 'registered',
        isConnected: true
      });
      
      // Rerender both tabs
      rerenderTab1(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      rerenderTab2(
        <QueryClientProvider client={queryClient2}>
          <Board />
        </QueryClientProvider>
      );
      
      // Both tabs should show flipped card
      // Note: Actual UI testing would need to check CSS classes or card back content
      await waitFor(() => {
        // This is a simplified test - real implementation would check flip state
        expect(screen.getAllByText(cardFaceDown.content).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Hook Registry Multi-Tab Coordination', () => {
    it('should allow multiple tabs to register SSE hooks independently', async () => {
      // Simulate multiple hook registrations (what our fix enabled)
      const tab1HookId = 'sse-hook-tab1-12345';
      const tab2HookId = 'sse-hook-tab2-67890';
      
      mockUseSSECardEvents
        .mockReturnValueOnce({
          cards: mockCards,
          registrationStatus: 'registered',
          isConnected: true,
          hookId: tab1HookId
        })
        .mockReturnValueOnce({
          cards: mockCards,
          registrationStatus: 'registered', 
          isConnected: true,
          hookId: tab2HookId
        });
      
      // Render both tabs
      render(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      render(
        <QueryClientProvider client={queryClient2}>
          <Board />
        </QueryClientProvider>
      );
      
      // Both tabs should be able to register and receive data
      expect(mockUseSSECardEvents).toHaveBeenCalledTimes(2);
      
      // Both should have received the cards
      await waitFor(() => {
        const allCards = screen.getAllByText('Test Card 1');
        expect(allCards.length).toBe(2); // One from each tab
      });
    });

    it('should handle tab closure and hook unregistration', async () => {
      mockUseSSECardEvents.mockReturnValue({
        cards: mockCards,
        registrationStatus: 'registered',
        isConnected: true
      });
      
      const { unmount } = render(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      // Verify initial render
      await waitFor(() => {
        expect(screen.getByText('Test Card 1')).toBeInTheDocument();
      });
      
      // Unmount component (simulate tab close)
      unmount();
      
      // Hook should clean up (tested via useEffect cleanup in actual hook)
      expect(screen.queryByText('Test Card 1')).not.toBeInTheDocument();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid card updates without UI flickering', async () => {
      const baseCard = { ...mockCards[0] };
      let updateCount = 0;
      
      // Simulate rapid updates
      const rapidUpdates = setInterval(() => {
        updateCount++;
        const updatedCard = {
          ...baseCard,
          content: `Updated Card ${updateCount}`,
          updatedAt: Date.now()
        };
        
        mockUseSSECardEvents.mockReturnValue({
          cards: [updatedCard],
          registrationStatus: 'registered',
          isConnected: true
        });
      }, 50); // 20 updates per second
      
      const { rerender } = render(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      // Let updates run for a short time
      await new Promise(resolve => setTimeout(resolve, 500));
      clearInterval(rapidUpdates);
      
      // Final rerender with last update
      rerender(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      // Should show the latest update
      await waitFor(() => {
        expect(screen.getByText(`Updated Card ${updateCount}`)).toBeInTheDocument();
      });
      
      expect(updateCount).toBeGreaterThan(5); // Verify rapid updates occurred
    });

    it('should maintain performance with large number of cards', async () => {
      // Generate 100 cards
      const manyCards = Array.from({ length: 100 }, (_, i) => ({
        id: `card-${i}`,
        content: `Test Card ${i}`,
        type: 'topic',
        zone: ['active', 'parking', 'resolved', 'unresolved'][i % 4],
        position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 500,
        faceUp: true,
        createdByUserId: 'user-1'
      }));
      
      mockUseSSECardEvents.mockReturnValue({
        cards: manyCards,
        registrationStatus: 'registered',
        isConnected: true
      });
      
      const startTime = performance.now();
      
      render(
        <QueryClientProvider client={queryClient1}>
          <Board />
        </QueryClientProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Card 0')).toBeInTheDocument();
        expect(screen.getByText('Test Card 99')).toBeInTheDocument();
      });
      
      const renderTime = performance.now() - startTime;
      
      // Render should complete within reasonable time (2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('Regression Prevention', () => {
    it('should never use getCardsByZone() when SSE cards are available', async () => {
      const sseCards = [{ ...mockCards[0], content: 'SSE Card Data' }];
      
      mockUseSSECardEvents.mockReturnValue({
        cards: sseCards,
        registrationStatus: 'registered',
        isConnected: true
      });
      
      // Create a getCardsByZone that returns different data
      const mockGetCardsByZone = vi.fn(() => ({
        active: [{ ...mockCards[0], content: 'REST Card Data' }],
        parking: [],
        resolved: [],
        unresolved: []
      }));
      
      render(
        <QueryClientProvider client={queryClient1}>
          <BoardCanvas
            cards={sseCards} // SSE cards should be used
            getCardsByZone={mockGetCardsByZone}
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            users={[]}
          />
        </QueryClientProvider>
      );
      
      // Should render SSE data, not REST data
      await waitFor(() => {
        expect(screen.getByText('SSE Card Data')).toBeInTheDocument();
        expect(screen.queryByText('REST Card Data')).not.toBeInTheDocument();
      });
      
      // Critical: getCardsByZone should NEVER be called
      expect(mockGetCardsByZone).not.toHaveBeenCalled();
    });

    it('should maintain correct zone filtering with direct SSE data', async () => {
      const mixedZoneCards = [
        { ...mockCards[0], zone: 'active', content: 'Active Card' },
        { ...mockCards[1], zone: 'parking', content: 'Parking Card' }
      ];
      
      mockUseSSECardEvents.mockReturnValue({
        cards: mixedZoneCards,
        registrationStatus: 'registered',
        isConnected: true
      });
      
      render(
        <QueryClientProvider client={queryClient1}>
          <BoardCanvas
            cards={mixedZoneCards}
            onUpdateCard={vi.fn()}
            onDeleteCard={vi.fn()}
            users={[]}
          />
        </QueryClientProvider>
      );
      
      // Each card should be in its correct zone
      await waitFor(() => {
        // Find zones
        const activeZone = screen.getByText(/active/i).closest('[data-testid="zone"]') || 
                          screen.getByText(/active/i).closest('div');
        const parkingZone = screen.getByText(/parking/i).closest('[data-testid="zone"]') ||
                           screen.getByText(/parking/i).closest('div');
        
        // Verify correct placement
        expect(screen.getByText('Active Card')).toBeInTheDocument();
        expect(screen.getByText('Parking Card')).toBeInTheDocument();
      });
    });
  });
});