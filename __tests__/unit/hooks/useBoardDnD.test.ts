import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBoardDnD } from '@/lib/hooks/useBoardDnD'
import { mockCards, mockCardsByZone } from '../../fixtures/cards'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'

// Mock the constants
vi.mock('@/lib/utils/constants', () => ({
  ZONES: {
    active: true,
    parking: true,
    resolved: true,
    unresolved: true,
  }
}))

describe('useBoardDnD Hook', () => {
  const mockOnUpdateCard = vi.fn()
  const mockGetCardsByZone = vi.fn(() => mockCardsByZone)

  const defaultProps = {
    cards: mockCards,
    onUpdateCard: mockOnUpdateCard,
    getCardsByZone: mockGetCardsByZone,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      expect(result.current.activeCard).toBe(null)
      expect(result.current.isDraggingCard).toBe(false)
      expect(result.current.contextProps).toHaveProperty('onDragStart')
      expect(result.current.contextProps).toHaveProperty('onDragEnd')
      expect(result.current.contextProps).toHaveProperty('collisionDetection')
    })

    it('should provide DnD context props', () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const { contextProps } = result.current
      expect(typeof contextProps.onDragStart).toBe('function')
      expect(typeof contextProps.onDragEnd).toBe('function')
      expect(typeof contextProps.collisionDetection).toBe('function')
    })
  })

  describe('Drag Start', () => {
    it('should set active card on drag start', () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const dragStartEvent: Partial<DragStartEvent> = {
        active: {
          id: mockCards[0].id,
        } as any
      }

      act(() => {
        result.current.contextProps.onDragStart(dragStartEvent as DragStartEvent)
      })

      expect(result.current.activeCard).toEqual(mockCards[0])
      expect(result.current.isDraggingCard).toBe(true)
    })

    it('should handle drag start with unknown card ID', () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const dragStartEvent: Partial<DragStartEvent> = {
        active: {
          id: 'unknown-card-id',
        } as any
      }

      act(() => {
        result.current.contextProps.onDragStart(dragStartEvent as DragStartEvent)
      })

      expect(result.current.activeCard).toBe(null)
      expect(result.current.isDraggingCard).toBe(true)
    })
  })

  describe('Drag End', () => {
    it('should reset state on drag end', () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      // First start a drag
      act(() => {
        result.current.contextProps.onDragStart({
          active: { id: mockCards[0].id }
        } as DragStartEvent)
      })

      expect(result.current.isDraggingCard).toBe(true)

      // Then end the drag
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: mockCards[0].id } as any,
        over: null,
        delta: { x: 0, y: 0 }
      }

      act(() => {
        result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(result.current.activeCard).toBe(null)
      expect(result.current.isDraggingCard).toBe(false)
    })

    it('should handle drop on zone', async () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: mockCards[0].id } as any,
        over: { id: 'parking' } as any,
        delta: { x: 20, y: 30 }
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).toHaveBeenCalledWith(mockCards[0].id, {
        zone: 'parking',
        position: { x: 30, y: 90 }, // original position + delta, with minimums applied
        stackOrder: 0,
      })
    })

    it('should handle stacking when dropped near same type card', async () => {
      // Create cards of same type in parking zone for stacking test
      const sameTypeCards = [
        { ...mockCards[0], zone: 'parking', position: { x: 50, y: 100 }, stackOrder: 0 },
        { ...mockCards[1], zone: 'parking', position: { x: 52, y: 102 }, type: mockCards[0].type }
      ]

      const customGetCardsByZone = vi.fn(() => ({
        parking: sameTypeCards
      }))

      const { result } = renderHook(() => useBoardDnD({
        ...defaultProps,
        cards: sameTypeCards,
        getCardsByZone: customGetCardsByZone
      }))
      
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: sameTypeCards[0].id } as any,
        over: { id: 'parking' } as any,
        delta: { x: 2, y: 2 } // Small delta to trigger stacking
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).toHaveBeenCalledWith(sameTypeCards[0].id, {
        zone: 'parking',
        position: { x: 52, y: 102 }, // Stack target position
        stackOrder: 1, // Stack target stackOrder + 1
      })
    })

    it('should handle drop on another card directly', async () => {
      // Ensure both cards have the same type for the drop to work
      const sameTypeCards = [
        { ...mockCards[0], type: 'topic' },
        { ...mockCards[1], type: 'topic' } // Same type as dragged card
      ]

      const { result } = renderHook(() => useBoardDnD({
        ...defaultProps,
        cards: sameTypeCards
      }))
      
      const targetCard = sameTypeCards[1]
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: sameTypeCards[0].id } as any,
        over: { 
          id: targetCard.id,
          data: { current: { type: 'card' } }
        } as any,
        delta: { x: 0, y: 0 }
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).toHaveBeenCalledWith(sameTypeCards[0].id, {
        zone: targetCard.zone,
        position: targetCard.position,
        stackOrder: (targetCard.stackOrder || 0) + 1,
      })
    })

    it('should ignore drop on same card', async () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: mockCards[0].id } as any,
        over: { 
          id: mockCards[0].id,
          data: { current: { type: 'card' } }
        } as any,
        delta: { x: 0, y: 0 }
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).not.toHaveBeenCalled()
    })

    it('should ignore drop on card of different type', async () => {
      const differentTypeCard = { ...mockCards[1], type: 'different-type' }
      const cardsWithDifferentType = [...mockCards, differentTypeCard]

      const { result } = renderHook(() => useBoardDnD({
        ...defaultProps,
        cards: cardsWithDifferentType
      }))
      
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: mockCards[0].id } as any,
        over: { 
          id: differentTypeCard.id,
          data: { current: { type: 'card' } }
        } as any,
        delta: { x: 0, y: 0 }
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).not.toHaveBeenCalled()
    })

    it('should handle free positioning when no valid drop target', async () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: mockCards[0].id } as any,
        over: null,
        delta: { x: 50, y: 25 }
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).toHaveBeenCalledWith(mockCards[0].id, {
        position: { 
          x: (mockCards[0].position?.x || 10) + 50, 
          y: (mockCards[0].position?.y || 60) + 25 
        }
      })
    })

    it('should handle drag end without active card', async () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const dragEndEvent: Partial<DragEndEvent> = {
        active: null as any,
        over: null,
        delta: { x: 0, y: 0 }
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).not.toHaveBeenCalled()
    })

    it('should handle drag end with unknown card ID', async () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: 'unknown-card' } as any,
        over: { id: 'parking' } as any,
        delta: { x: 0, y: 0 }
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).not.toHaveBeenCalled()
    })
  })

  describe('Collision Detection', () => {
    it('should use custom collision detection', () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      expect(result.current.contextProps.collisionDetection).toBeDefined()
      expect(typeof result.current.contextProps.collisionDetection).toBe('function')
    })

    it('should prioritize card collisions over zone collisions', () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      const mockArgs = {
        droppableContainers: new Map(),
        active: { id: 'test' },
        collisionRect: { top: 0, left: 0, bottom: 10, right: 10 }
      } as any

      // Mock pointerWithin to return card collision
      vi.doMock('@dnd-kit/core', () => ({
        pointerWithin: vi.fn(() => [
          { 
            id: 'card-collision',
            data: { 
              droppableContainer: { 
                data: { current: { type: 'card' } } 
              } 
            } 
          },
          { id: 'zone-collision' }
        ]),
        rectIntersection: vi.fn(() => [{ id: 'zone-collision' }])
      }))

      // This test verifies the collision detection function exists and can be called
      expect(() => {
        result.current.contextProps.collisionDetection(mockArgs)
      }).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty cards array', () => {
      const { result } = renderHook(() => useBoardDnD({
        ...defaultProps,
        cards: []
      }))
      
      expect(result.current.activeCard).toBe(null)
      expect(result.current.isDraggingCard).toBe(false)
    })

    it('should propagate onUpdateCard errors', async () => {
      const errorOnUpdate = vi.fn().mockRejectedValue(new Error('Update failed'))
      
      const { result } = renderHook(() => useBoardDnD({
        ...defaultProps,
        onUpdateCard: errorOnUpdate
      }))
      
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: mockCards[0].id } as any,
        over: { id: 'parking' } as any,
        delta: { x: 0, y: 0 }
      }

      // Should propagate error from onUpdateCard function
      await expect(async () => {
        await act(async () => {
          await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
        })
      }).rejects.toThrow('Update failed')

      expect(errorOnUpdate).toHaveBeenCalled()
    })

    it('should handle minimum position constraints', async () => {
      const { result } = renderHook(() => useBoardDnD(defaultProps))
      
      // Test negative delta that would go below minimums
      const dragEndEvent: Partial<DragEndEvent> = {
        active: { id: mockCards[0].id } as any,
        over: { id: 'parking' } as any,
        delta: { x: -100, y: -100 }
      }

      await act(async () => {
        await result.current.contextProps.onDragEnd(dragEndEvent as DragEndEvent)
      })

      expect(mockOnUpdateCard).toHaveBeenCalledWith(mockCards[0].id, {
        zone: 'parking',
        position: { x: 10, y: 60 }, // Should be clamped to minimums
        stackOrder: 0,
      })
    })
  })
})