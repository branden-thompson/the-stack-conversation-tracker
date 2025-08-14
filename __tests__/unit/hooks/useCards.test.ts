import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { handlers } from '../../utils/api-mocks'
import { useCards } from '@/lib/hooks/useCards'
import { mockCard, mockCards, createMockCard } from '../../fixtures/cards'

// Setup MSW server for API mocking
const server = setupServer(...handlers)

describe('useCards Hook', () => {
  beforeEach(() => {
    server.listen()
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('Initial State', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useCards())
      
      expect(result.current.loading).toBe(true)
      expect(result.current.cards).toEqual([])
      expect(result.current.error).toBe(null)
    })

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useCards())
      
      expect(typeof result.current.createCard).toBe('function')
      expect(typeof result.current.updateCard).toBe('function')
      expect(typeof result.current.updateMultipleCards).toBe('function')
      expect(typeof result.current.deleteCard).toBe('function')
      expect(typeof result.current.moveCard).toBe('function')
      expect(typeof result.current.getCardsByZone).toBe('function')
      expect(typeof result.current.stackCards).toBe('function')
      expect(typeof result.current.refreshCards).toBe('function')
    })
  })

  describe('Fetching Cards', () => {
    it('should fetch cards on mount', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.cards).toEqual(mockCards)
      expect(result.current.error).toBe(null)
    })

    it('should handle fetch errors', async () => {
      server.use(
        http.get('/api/cards', () => {
          return new Response('Server Error', { status: 500 })
        })
      )

      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.error).toBeTruthy()
      expect(result.current.cards).toEqual([])
    })
  })

  describe('Creating Cards', () => {
    it('should create a new card', async () => {
      const { result } = renderHook(() => useCards())
      
      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newCardData = {
        type: 'topic' as const,
        content: 'New test card',
        zone: 'active' as const,
        position: { x: 20, y: 80 },
        stackOrder: 0,
      }

      let createdCard: any
      await act(async () => {
        createdCard = await result.current.createCard(newCardData)
      })

      expect(createdCard).toMatchObject(newCardData)
      expect(createdCard.id).toBeDefined()
      expect(createdCard.createdAt).toBeDefined()
      expect(createdCard.updatedAt).toBeDefined()
      
      // Should be added to local state
      expect(result.current.cards).toHaveLength(mockCards.length + 1)
      expect(result.current.cards).toContainEqual(createdCard)
    })

    it('should handle creation errors', async () => {
      server.use(
        http.post('/api/cards', () => {
          return new Response('Bad Request', { status: 400 })
        })
      )

      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(async () => {
        await act(async () => {
          await result.current.createCard(createMockCard())
        })
      }).rejects.toThrow()
    })
  })

  describe('Updating Cards', () => {
    it('should update a single card', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = { content: 'Updated content' }
      
      let updatedCard: any
      await act(async () => {
        updatedCard = await result.current.updateCard(mockCard.id, updates)
      })

      expect(updatedCard.content).toBe('Updated content')
      expect(updatedCard.updatedAt).toBeDefined()
      
      // Should update in local state
      const cardInState = result.current.cards.find(c => c.id === mockCard.id)
      expect(cardInState?.content).toBe('Updated content')
    })

    it('should update multiple cards', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = [
        { id: mockCards[0].id, content: 'Updated card 1' },
        { id: mockCards[1].id, content: 'Updated card 2' },
      ]
      
      let updatedCards: any[]
      await act(async () => {
        updatedCards = await result.current.updateMultipleCards(updates)
      })

      expect(updatedCards).toHaveLength(2)
      expect(updatedCards[0].content).toBe('Updated card 1')
      expect(updatedCards[1].content).toBe('Updated card 2')
    })

    it('should handle update errors', async () => {
      server.use(
        http.put('/api/cards', () => {
          return HttpResponse.json(
            { error: 'Card not found' },
            { status: 404 }
          )
        })
      )

      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(async () => {
        await act(async () => {
          await result.current.updateCard('nonexistent-id', { content: 'test' })
        })
      }).rejects.toThrow()
    })
  })

  describe('Deleting Cards', () => {
    it('should delete a card', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCount = result.current.cards.length
      
      await act(async () => {
        await result.current.deleteCard(mockCard.id)
      })

      // Should be removed from local state
      expect(result.current.cards).toHaveLength(initialCount - 1)
      expect(result.current.cards.find(c => c.id === mockCard.id)).toBeUndefined()
    })

    it('should handle delete errors', async () => {
      server.use(
        http.delete('/api/cards', () => {
          return HttpResponse.json(
            { error: 'Card not found' },
            { status: 404 }
          )
        })
      )

      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(async () => {
        await act(async () => {
          await result.current.deleteCard('nonexistent-id')
        })
      }).rejects.toThrow()
    })
  })

  describe('Moving Cards', () => {
    it('should move a card to a different zone', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newZone = 'parking'
      const newPosition = { x: 50, y: 100 }
      
      let movedCard: any
      await act(async () => {
        movedCard = await result.current.moveCard(mockCard.id, newZone, newPosition)
      })

      expect(movedCard.zone).toBe(newZone)
      expect(movedCard.position).toEqual(newPosition)
      expect(movedCard.stackOrder).toBe(0)
    })

    it('should move a card with default position', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let movedCard: any
      await act(async () => {
        movedCard = await result.current.moveCard(mockCard.id, 'resolved')
      })

      expect(movedCard.zone).toBe('resolved')
      expect(movedCard.position).toEqual({ x: 10, y: 50 })
    })
  })

  describe('Cards by Zone', () => {
    it('should group cards by zone', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const cardsByZone = result.current.getCardsByZone()
      
      expect(cardsByZone).toHaveProperty('active')
      expect(cardsByZone).toHaveProperty('parking')
      expect(cardsByZone).toHaveProperty('resolved')
      expect(cardsByZone).toHaveProperty('unresolved')
      
      expect(cardsByZone.active).toHaveLength(1)
      expect(cardsByZone.parking).toHaveLength(1)
      expect(cardsByZone.resolved).toHaveLength(1)
      expect(cardsByZone.unresolved).toHaveLength(1)
    })

    it('should handle zones with no cards', async () => {
      server.use(
        http.get('/api/cards', () => {
          return HttpResponse.json([])
        })
      )

      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const cardsByZone = result.current.getCardsByZone()
      
      expect(Object.keys(cardsByZone)).toHaveLength(0)
    })
  })

  describe('Stacking Cards', () => {
    it('should update stack order for multiple cards', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const cardIds = [mockCards[0].id, mockCards[1].id, mockCards[2].id]
      
      let stackedCards: any[]
      await act(async () => {
        stackedCards = await result.current.stackCards(cardIds)
      })

      expect(stackedCards).toHaveLength(3)
      expect(stackedCards[0].stackOrder).toBe(0)
      expect(stackedCards[1].stackOrder).toBe(1)
      expect(stackedCards[2].stackOrder).toBe(2)
    })
  })

  describe('Refresh Cards', () => {
    it('should refresh cards from API', async () => {
      const { result } = renderHook(() => useCards())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Modify mock to return different data
      server.use(
        http.get('/api/cards', () => {
          return HttpResponse.json([createMockCard({ id: 'new-card', content: 'Refreshed' })])
        })
      )

      await act(async () => {
        await result.current.refreshCards()
      })

      expect(result.current.cards).toHaveLength(1)
      expect(result.current.cards[0].content).toBe('Refreshed')
    })
  })
})