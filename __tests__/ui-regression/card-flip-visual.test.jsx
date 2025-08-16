import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { ConversationCard } from '@/components/conversation-board/ConversationCard';
import { FlippableCard } from '@/components/conversation-board/FlippableCard';
import { CARD_TYPES } from '@/lib/utils/constants';

// Mock fetch for API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ success: true }),
  })
);

// Mock hooks
vi.mock('@/lib/hooks/useConversations', () => ({
  useConversations: () => ({ activeId: 'test-convo' }),
}));

describe('Card Flip Visual Regression Tests', () => {
  const mockCard = {
    id: 'test-card',
    type: 'question',
    content: 'Test question content',
    zone: 'active',
    position: { x: 100, y: 100 },
    stackOrder: 0,
    faceUp: true,
    createdByUserId: 'user-1',
    assignedToUserId: null,
    createdAt: '2025-08-16T10:00:00Z',
    updatedAt: '2025-08-16T10:00:00Z',
  };

  const mockUsers = [
    { id: 'user-1', name: 'Test User', profilePicture: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dimension consistency', () => {
    it('maintains consistent dimensions when flipping', async () => {
      const { container, rerender } = render(
        <DndContext>
          <ConversationCard
            card={mockCard}
            users={mockUsers}
            animationsEnabled={true}
            onUpdate={vi.fn()}
            onDelete={vi.fn()}
          />
        </DndContext>
      );

      // Get initial dimensions
      const cardElement = container.firstChild;
      const initialWidth = cardElement.offsetWidth;
      const initialHeight = cardElement.offsetHeight;
      const initialRect = cardElement.getBoundingClientRect();

      // Flip the card
      const flipButton = screen.getByTitle('Flip card');
      fireEvent.click(flipButton);

      // Re-render with flipped state
      rerender(
        <DndContext>
          <ConversationCard
            card={{ ...mockCard, faceUp: false }}
            users={mockUsers}
            animationsEnabled={true}
            onUpdate={vi.fn()}
            onDelete={vi.fn()}
          />
        </DndContext>
      );

      // Check dimensions after flip
      const flippedRect = cardElement.getBoundingClientRect();
      
      // Dimensions should remain the same
      expect(flippedRect.width).toBeCloseTo(initialRect.width, 1);
      expect(flippedRect.height).toBeCloseTo(initialRect.height, 1);
    });

    it('renders all card types with correct colors', () => {
      const cardTypes = ['topic', 'question', 'accusation', 'fact', 'guess', 'opinion'];
      
      cardTypes.forEach(type => {
        const { container } = render(
          <DndContext>
            <ConversationCard
              card={{ ...mockCard, type, id: `card-${type}` }}
              users={mockUsers}
              animationsEnabled={true}
              onUpdate={vi.fn()}
              onDelete={vi.fn()}
            />
          </DndContext>
        );

        const cardElement = container.querySelector('.rounded-xl');
        const typeConfig = CARD_TYPES[type];
        
        // Check that appropriate classes are applied
        if (typeConfig && typeConfig.container) {
          const classes = typeConfig.container.split(' ');
          classes.forEach(className => {
            if (className && !className.startsWith('dark:')) {
              expect(cardElement.className).toContain(className.replace('bg-', '').replace('border-', '').replace('text-', ''));
            }
          });
        }
      });
    });
  });

  describe('Stacking behavior with flipped cards', () => {
    it('maintains proper z-index when flipped in a stack', () => {
      const stackedCards = [
        { ...mockCard, id: 'card-1', stackOrder: 0 },
        { ...mockCard, id: 'card-2', stackOrder: 1, faceUp: false },
        { ...mockCard, id: 'card-3', stackOrder: 2 },
      ];

      const { container } = render(
        <DndContext>
          <div>
            {stackedCards.map((card, index) => (
              <ConversationCard
                key={card.id}
                card={card}
                users={mockUsers}
                isStacked={true}
                stackPosition={index}
                animationsEnabled={true}
                onUpdate={vi.fn()}
                onDelete={vi.fn()}
              />
            ))}
          </div>
        </DndContext>
      );

      const cards = container.querySelectorAll('[style*="z-index"]');
      
      // Check z-index ordering
      expect(cards.length).toBe(3);
      cards.forEach((card, index) => {
        const zIndex = parseInt(window.getComputedStyle(card).zIndex || '0');
        expect(zIndex).toBe(index + 1);
      });
    });
  });

  describe('Responsive behavior', () => {
    it('adapts card dimensions for different screen sizes', () => {
      const screenSizes = [
        { width: 375, name: 'mobile' },
        { width: 768, name: 'tablet' },
        { width: 1024, name: 'desktop' },
        { width: 1440, name: 'large' },
      ];

      screenSizes.forEach(({ width, name }) => {
        // Mock window.innerWidth
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        window.dispatchEvent(new Event('resize'));

        const { container } = render(
          <DndContext>
            <ConversationCard
              card={mockCard}
              users={mockUsers}
              animationsEnabled={true}
              onUpdate={vi.fn()}
              onDelete={vi.fn()}
            />
          </DndContext>
        );

        const cardElement = container.firstChild;
        
        // Check that card has appropriate sizing for screen size
        if (name === 'mobile') {
          expect(cardElement.style.minWidth).toBeTruthy();
          expect(cardElement.style.maxWidth).toBeTruthy();
        }
      });
    });
  });

  describe('Animation states', () => {
    it('applies correct transform styles during flip animation', () => {
      const { container } = render(
        <FlippableCard
          card={mockCard}
          animationsEnabled={true}
          screenWidth={1024}
          isEditing={false}
          content={mockCard.content}
          setContent={vi.fn()}
          handleEdit={vi.fn()}
          handleSave={vi.fn()}
          handleKeyDown={vi.fn()}
          handleDelete={vi.fn()}
          handleAssignUser={vi.fn()}
          moveToZone={vi.fn()}
          dragHandleProps={{}}
          showAssignMenu={false}
          setShowAssignMenu={vi.fn()}
          users={mockUsers}
          controlRailWidth={40}
          contentMinHeight={100}
          dateText="2025-08-16"
          createdByUser={mockUsers[0]}
          assignedToUser={null}
          inputRef={{ current: null }}
          typeColors={CARD_TYPES[mockCard.type]}
        />
      );

      const flipCardInner = container.querySelector('.flip-card-inner');
      
      // Check initial state (face up)
      expect(flipCardInner.style.transform).toBe('rotateY(0deg)');
      
      // Check transition is applied
      expect(flipCardInner.style.transition).toContain('transform');
      expect(flipCardInner.style.transformStyle).toBe('preserve-3d');
    });

    it('disables flip animation when animationsEnabled is false', () => {
      const { container } = render(
        <DndContext>
          <ConversationCard
            card={mockCard}
            users={mockUsers}
            animationsEnabled={false}
            onUpdate={vi.fn()}
            onDelete={vi.fn()}
          />
        </DndContext>
      );

      // Should not have flip-card class when animations disabled
      expect(container.querySelector('.flip-card')).not.toBeInTheDocument();
      expect(container.querySelector('.flip-card-inner')).not.toBeInTheDocument();
    });
  });

  describe('Opacity and layering', () => {
    it('ensures card backs are fully opaque', () => {
      const { container } = render(
        <FlippableCard
          card={{ ...mockCard, faceUp: false }}
          animationsEnabled={true}
          screenWidth={1024}
          isEditing={false}
          content={mockCard.content}
          setContent={vi.fn()}
          handleEdit={vi.fn()}
          handleSave={vi.fn()}
          handleKeyDown={vi.fn()}
          handleDelete={vi.fn()}
          handleAssignUser={vi.fn()}
          moveToZone={vi.fn()}
          dragHandleProps={{}}
          showAssignMenu={false}
          setShowAssignMenu={vi.fn()}
          users={mockUsers}
          controlRailWidth={40}
          contentMinHeight={100}
          dateText="2025-08-16"
          createdByUser={mockUsers[0]}
          assignedToUser={null}
          inputRef={{ current: null }}
          typeColors={CARD_TYPES[mockCard.type]}
        />
      );

      const cardBackContainer = container.querySelector('.flip-card-back .rounded-xl');
      
      // Check that opaque background class is applied
      expect(cardBackContainer.className).toContain('bg-white');
      expect(cardBackContainer.className).toContain('dark:bg-gray-900');
    });

    it('properly hides backface during rotation', () => {
      const { container } = render(
        <FlippableCard
          card={mockCard}
          animationsEnabled={true}
          screenWidth={1024}
          isEditing={false}
          content={mockCard.content}
          setContent={vi.fn()}
          handleEdit={vi.fn()}
          handleSave={vi.fn()}
          handleKeyDown={vi.fn()}
          handleDelete={vi.fn()}
          handleAssignUser={vi.fn()}
          moveToZone={vi.fn()}
          dragHandleProps={{}}
          showAssignMenu={false}
          setShowAssignMenu={vi.fn()}
          users={mockUsers}
          controlRailWidth={40}
          contentMinHeight={100}
          dateText="2025-08-16"
          createdByUser={mockUsers[0]}
          assignedToUser={null}
          inputRef={{ current: null }}
          typeColors={CARD_TYPES[mockCard.type]}
        />
      );

      const cardFace = container.querySelector('.flip-card-face');
      const cardBack = container.querySelector('.flip-card-back');
      
      // Both faces should have backface-visibility hidden
      expect(cardFace.style.backfaceVisibility).toBe('hidden');
      expect(cardBack.style.backfaceVisibility).toBe('hidden');
      
      // WebKit prefix should also be set
      expect(cardFace.style.WebkitBackfaceVisibility).toBe('hidden');
      expect(cardBack.style.WebkitBackfaceVisibility).toBe('hidden');
    });
  });
});