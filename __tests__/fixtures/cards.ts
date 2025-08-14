export const mockCard = {
  id: 'test-card-1',
  type: 'topic' as const,
  content: 'Test card content',
  zone: 'active' as const,
  position: { x: 10, y: 60 },
  stackOrder: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  createdBy: 'system',
  person: 'system',
}

export const mockCards = [
  mockCard,
  {
    ...mockCard,
    id: 'test-card-2',
    type: 'opinion' as const,
    content: 'Test opinion card',
    zone: 'parking' as const,
  },
  {
    ...mockCard,
    id: 'test-card-3',
    type: 'question' as const,
    content: 'Test question card',
    zone: 'resolved' as const,
  },
  {
    ...mockCard,
    id: 'test-card-4',
    type: 'fact' as const,
    content: 'Test fact card',
    zone: 'unresolved' as const,
  },
]

export const mockCardsByZone = {
  active: [mockCards[0]],
  parking: [mockCards[1]],
  resolved: [mockCards[2]],
  unresolved: [mockCards[3]],
}

export const createMockCard = (overrides: Partial<typeof mockCard> = {}) => ({
  ...mockCard,
  ...overrides,
})