// Mock implementation of lowdb for testing
export const mockDb = {
  data: {
    cards: [],
    people: [
      { id: 'p-system', name: 'system' },
      { id: 'p-alex', name: 'Alex' },
    ],
    conversations: [],
    events: [],
  },
  
  read: vi.fn().mockResolvedValue(undefined),
  write: vi.fn().mockResolvedValue(undefined),
  
  chain: {
    get: vi.fn().mockReturnThis(),
    find: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    value: vi.fn().mockReturnValue([]),
    push: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    assign: vi.fn().mockReturnThis(),
  },
}

// Mock the database module
vi.mock('@/lib/db/database', () => ({
  getAllCards: vi.fn().mockResolvedValue([]),
  getCard: vi.fn().mockResolvedValue(null),
  createCard: vi.fn().mockResolvedValue({}),
  updateCard: vi.fn().mockResolvedValue({}),
  deleteCard: vi.fn().mockResolvedValue(true),
  updateMultipleCards: vi.fn().mockResolvedValue([]),
}))

export default mockDb