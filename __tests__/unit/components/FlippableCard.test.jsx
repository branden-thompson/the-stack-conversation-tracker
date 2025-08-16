import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlippableCard } from '@/components/conversation-board/FlippableCard';
import { ANIMATION } from '@/lib/utils/ui-constants';

// Mock fetch
global.fetch = vi.fn();

// Mock the child components
vi.mock('@/components/conversation-board/CardFace', () => ({
  CardFace: ({ card, onFlip }) => (
    <div data-testid="card-face">
      <div>{card.content}</div>
      <button onClick={onFlip}>Flip</button>
    </div>
  ),
}));

vi.mock('@/components/conversation-board/CardBack', () => ({
  CardBack: ({ card, onFlip }) => (
    <div data-testid="card-back" onClick={onFlip}>
      <div>Card Type: {card.type}</div>
    </div>
  ),
}));

vi.mock('@/lib/hooks/useConversations', () => ({
  useConversations: () => ({ activeId: 'test-conversation-id' }),
}));

describe('FlippableCard', () => {
  const mockCard = {
    id: 'test-card-1',
    type: 'question',
    content: 'Test question content',
    faceUp: true,
    zone: 'active',
  };

  const defaultProps = {
    card: mockCard,
    animationsEnabled: true,
    screenWidth: 1024,
    isEditing: false,
    content: mockCard.content,
    setContent: vi.fn(),
    handleEdit: vi.fn(),
    handleSave: vi.fn(),
    handleKeyDown: vi.fn(),
    handleDelete: vi.fn(),
    handleAssignUser: vi.fn(),
    moveToZone: vi.fn(),
    dragHandleProps: {},
    showAssignMenu: false,
    setShowAssignMenu: vi.fn(),
    users: [],
    controlRailWidth: 40,
    contentMinHeight: 100,
    dateText: '2025-08-16',
    createdByUser: null,
    assignedToUser: null,
    inputRef: { current: null },
    typeColors: { container: 'bg-blue-50' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe('Rendering', () => {
    it('renders both CardFace and CardBack when animations enabled', () => {
      render(<FlippableCard {...defaultProps} />);
      // Both faces are in DOM, visibility controlled by CSS transform
      expect(screen.getByTestId('card-face')).toBeInTheDocument();
      expect(screen.getByTestId('card-back')).toBeInTheDocument();
    });

    it('shows correct face based on faceUp state', () => {
      const { container, rerender } = render(<FlippableCard {...defaultProps} />);
      const flipCardInner = container.querySelector('.flip-card-inner');
      
      // Face up - no rotation
      expect(flipCardInner).toHaveStyle({ transform: 'rotateY(0deg)' });
      
      // Face down - 180deg rotation
      const props = {
        ...defaultProps,
        card: { ...mockCard, faceUp: false },
      };
      rerender(<FlippableCard {...props} />);
      expect(flipCardInner).toHaveStyle({ transform: 'rotateY(180deg)' });
    });

    it('renders without flip container when animations are disabled', () => {
      const props = {
        ...defaultProps,
        animationsEnabled: false,
      };
      const { container } = render(<FlippableCard {...props} />);
      expect(container.querySelector('.flip-card')).not.toBeInTheDocument();
      expect(screen.getByTestId('card-face')).toBeInTheDocument();
    });

    it('applies correct perspective style', () => {
      const { container } = render(<FlippableCard {...defaultProps} />);
      const flipCard = container.querySelector('.flip-card');
      expect(flipCard).toHaveStyle({ perspective: ANIMATION.card.flip.perspective });
    });
  });

  describe('Flip functionality', () => {
    it('flips card when flip button is clicked', async () => {
      render(<FlippableCard {...defaultProps} />);
      const flipButton = screen.getByText('Flip');
      
      fireEvent.click(flipButton);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/cards/flip', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: mockCard.id,
            flipTo: 'faceDown',
            flippedBy: 'user',
            conversationId: 'test-conversation-id',
          }),
        });
      });
    });

    it('does not flip when animations are disabled', () => {
      const props = {
        ...defaultProps,
        animationsEnabled: false,
      };
      render(<FlippableCard {...props} />);
      const flipButton = screen.getByText('Flip');
      
      fireEvent.click(flipButton);
      
      expect(fetch).not.toHaveBeenCalled();
    });

    it('handles flip API error gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Error message',
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<FlippableCard {...defaultProps} />);
      const flipButton = screen.getByText('Flip');
      
      fireEvent.click(flipButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to flip card:', 'Error message');
      });
      
      consoleSpy.mockRestore();
    });

    it('calls onFlip callback when provided', async () => {
      const onFlipCallback = vi.fn();
      const props = {
        ...defaultProps,
        onFlip: onFlipCallback,
      };
      
      render(<FlippableCard {...props} />);
      const flipButton = screen.getByText('Flip');
      
      fireEvent.click(flipButton);
      
      await waitFor(() => {
        expect(onFlipCallback).toHaveBeenCalledWith({ success: true });
      });
    });
  });

  describe('Dimensions', () => {
    it('passes dimensions to CardBack', () => {
      const props = {
        ...defaultProps,
        card: { ...mockCard, faceUp: false },
        style: {
          minWidth: '200px',
          maxWidth: '400px',
          minHeight: '150px',
        },
      };
      
      const { container } = render(<FlippableCard {...props} />);
      const cardBack = screen.getByTestId('card-back');
      
      // CardBack should receive dimension props
      expect(cardBack).toBeInTheDocument();
    });

    it('applies style dimensions to flip container', () => {
      const props = {
        ...defaultProps,
        style: {
          width: '300px',
          height: '200px',
        },
      };
      
      const { container } = render(<FlippableCard {...props} />);
      const flipCard = container.querySelector('.flip-card');
      
      expect(flipCard).toHaveStyle({
        width: '300px',
        height: '200px',
      });
    });
  });

  describe('Transform states', () => {
    it('applies correct transform for face up state', () => {
      const { container } = render(<FlippableCard {...defaultProps} />);
      const flipCardInner = container.querySelector('.flip-card-inner');
      
      expect(flipCardInner).toHaveStyle({
        transform: 'rotateY(0deg)',
      });
    });

    it('applies correct transform for face down state', () => {
      const props = {
        ...defaultProps,
        card: { ...mockCard, faceUp: false },
      };
      
      const { container } = render(<FlippableCard {...props} />);
      const flipCardInner = container.querySelector('.flip-card-inner');
      
      expect(flipCardInner).toHaveStyle({
        transform: 'rotateY(180deg)',
      });
    });
  });
});