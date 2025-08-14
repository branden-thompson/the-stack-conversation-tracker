import { http, HttpResponse } from 'msw'
import { mockCards } from '../fixtures/cards'

// Mock API handlers using MSW
export const handlers = [
  // GET /api/cards
  http.get('/api/cards', () => {
    return HttpResponse.json(mockCards)
  }),

  // GET /api/cards?id=:id
  http.get('/api/cards', ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (id) {
      const card = mockCards.find(c => c.id === id)
      if (card) {
        return HttpResponse.json(card)
      }
      return HttpResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(mockCards)
  }),

  // POST /api/cards
  http.post('/api/cards', async ({ request }) => {
    const body = await request.json() as any
    const newCard = {
      id: `test-card-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body,
    }
    return HttpResponse.json(newCard, { status: 201 })
  }),

  // PUT /api/cards
  http.put('/api/cards', async ({ request }) => {
    const body = await request.json() as any
    
    // Handle batch updates
    if (Array.isArray(body)) {
      const updatedCards = body.map(update => ({
        ...mockCards.find(c => c.id === update.id),
        ...update,
        updatedAt: new Date().toISOString(),
      }))
      return HttpResponse.json(updatedCards)
    }
    
    // Handle single update
    const { id, ...updates } = body
    const existingCard = mockCards.find(c => c.id === id)
    
    if (!existingCard) {
      return HttpResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }
    
    const updatedCard = {
      ...existingCard,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    return HttpResponse.json(updatedCard)
  }),

  // DELETE /api/cards
  http.delete('/api/cards', ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return HttpResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      )
    }
    
    const cardExists = mockCards.some(c => c.id === id)
    if (!cardExists) {
      return HttpResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(
      { message: 'Card deleted successfully' },
      { status: 200 }
    )
  }),
]