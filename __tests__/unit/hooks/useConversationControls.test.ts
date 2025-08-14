import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useConversationControls } from '@/lib/hooks/useConversationControls'
import { mockConversation } from '../../fixtures/conversations'

// Mock window functions
Object.defineProperty(window, 'prompt', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true,
})

// Mock the useConversations hook
const mockConversations = {
  activeId: mockConversation.id,
  items: [mockConversation],
  create: vi.fn(),
  patch: vi.fn(),
  refresh: vi.fn(),
  logEvent: vi.fn(),
}

vi.mock('@/lib/hooks/useConversations', () => ({
  useConversations: () => mockConversations
}))

describe('useConversationControls Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Reset mock implementations
    mockConversations.activeId = mockConversation.id
    mockConversations.items = [mockConversation]
    mockConversations.create = vi.fn()
    mockConversations.patch = vi.fn()
    mockConversations.refresh = vi.fn()
    mockConversations.logEvent = vi.fn()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.activeConversation).toEqual(mockConversation)
      expect(typeof result.current.runtime).toBe('string')
      expect(result.current.runtime).toMatch(/^\d{2}:\d{2}:\d{2}$/)
      expect(typeof result.current.onStart).toBe('function')
      expect(typeof result.current.onPause).toBe('function') 
      expect(typeof result.current.onResumeOrStart).toBe('function')
      expect(typeof result.current.onStop).toBe('function')
      expect(typeof result.current.conversationApi).toBe('object')
    })

    it('should provide conversationApi with correct structure', () => {
      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.conversationApi).toHaveProperty('activeId')
      expect(result.current.conversationApi).toHaveProperty('items')
      expect(result.current.conversationApi).toHaveProperty('create')
      expect(result.current.conversationApi).toHaveProperty('patch')
      expect(result.current.conversationApi).toHaveProperty('logEvent')
    })
  })

  describe('Runtime Calculation', () => {
    it('should return formatted time string for active conversation', () => {
      const activeConv = {
        ...mockConversation,
        status: 'active' as const,
        startedAt: Date.now() - 30000, // Started 30 seconds ago
        pausedAt: null,
      }

      mockConversations.items = [activeConv]
      mockConversations.activeId = activeConv.id

      const { result } = renderHook(() => useConversationControls())
      
      // Should show roughly 30 seconds elapsed
      expect(result.current.runtime).toMatch(/^00:00:\d{2}$/)
      
      // Advance timer by 1 second
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Runtime should still be in the same format (no need to wait for async updates)
      expect(result.current.runtime).toMatch(/^00:00:\d{2}$/)
    })

    it('should return formatted time for paused conversation', () => {
      const pausedConv = {
        ...mockConversation,
        status: 'paused' as const,
        startedAt: Date.now() - 120000, // Started 2 minutes ago
        pausedAt: Date.now() - 60000,   // Paused 1 minute ago
      }

      mockConversations.items = [pausedConv]
      mockConversations.activeId = pausedConv.id

      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.runtime).toMatch(/^00:01:\d{2}$/)
    })

    it('should return formatted time for stopped conversation', () => {
      const stoppedConv = {
        ...mockConversation,
        status: 'stopped' as const,
        startedAt: Date.now() - 180000,  // Started 3 minutes ago
        stoppedAt: Date.now() - 60000,   // Stopped 1 minute ago
        updatedAt: Date.now() - 60000,
      }

      mockConversations.items = [stoppedConv]
      mockConversations.activeId = stoppedConv.id

      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.runtime).toBe('00:02:00')
    })

    it('should return 00:00:00 for conversations without start time', () => {
      const noStartConv = {
        ...mockConversation,
        startedAt: null,
        pausedAt: null,
        stoppedAt: null,
      }

      mockConversations.items = [noStartConv]
      mockConversations.activeId = noStartConv.id

      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.runtime).toBe('00:00:00')
    })

    it('should return 00:00:00 when no active conversation', () => {
      mockConversations.activeId = null
      mockConversations.items = []

      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.runtime).toBe('00:00:00')
    })
  })

  describe('Active Conversation', () => {
    it('should return active conversation when activeId matches', () => {
      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.activeConversation).toEqual(mockConversation)
    })

    it('should return null when no active conversation', () => {
      mockConversations.activeId = null

      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.activeConversation).toBe(null)
    })

    it('should return null when activeId not found in items', () => {
      mockConversations.activeId = 'nonexistent-id'

      const { result } = renderHook(() => useConversationControls())
      
      expect(result.current.activeConversation).toBe(null)
    })
  })

  describe('Conversation Controls', () => {
    it('should start a new conversation with user prompt', async () => {
      vi.mocked(window.prompt).mockReturnValue('Test Conversation')
      mockConversations.create.mockResolvedValue({ id: 'new-conversation' })
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onStart()
      })

      expect(window.prompt).toHaveBeenCalledWith('Name this conversation:', '')
      expect(mockConversations.create).toHaveBeenCalledWith('Test Conversation')
      expect(mockConversations.refresh).toHaveBeenCalled()
    })

    it('should not create conversation if user cancels prompt', async () => {
      vi.mocked(window.prompt).mockReturnValue(null)
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onStart()
      })

      expect(mockConversations.create).not.toHaveBeenCalled()
    })

    it('should not create conversation if user enters empty name', async () => {
      vi.mocked(window.prompt).mockReturnValue('   ')
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onStart()
      })

      expect(mockConversations.create).not.toHaveBeenCalled()
    })

    it('should pause an active conversation', async () => {
      mockConversations.patch.mockResolvedValue({ ...mockConversation, status: 'paused' })
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onPause()
      })

      expect(mockConversations.patch).toHaveBeenCalledWith(mockConversation.id, {
        status: 'paused',
        pausedAt: expect.any(Number),
      })
    })

    it('should not pause if no active conversation', async () => {
      mockConversations.activeId = null
      mockConversations.items = []
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onPause()
      })

      expect(mockConversations.patch).not.toHaveBeenCalled()
    })

    it('should resume a paused conversation', async () => {
      const pausedConv = {
        ...mockConversation,
        status: 'paused' as const,
      }
      
      mockConversations.items = [pausedConv]
      mockConversations.patch.mockResolvedValue({ ...pausedConv, status: 'active' })
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onResumeOrStart()
      })

      expect(mockConversations.patch).toHaveBeenCalledWith(pausedConv.id, {
        status: 'active',
        startedAt: expect.any(Number),
        pausedAt: null,
        stoppedAt: null,
      })
    })

    it('should start new conversation when resuming with no active conversation', async () => {
      mockConversations.activeId = null
      mockConversations.items = []
      vi.mocked(window.prompt).mockReturnValue('New Conversation')
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onResumeOrStart()
      })

      expect(window.prompt).toHaveBeenCalled()
      expect(mockConversations.create).toHaveBeenCalledWith('New Conversation')
    })

    it('should stop an active conversation with confirmation', async () => {
      vi.mocked(window.confirm).mockReturnValue(true)
      mockConversations.patch.mockResolvedValue({ ...mockConversation, status: 'stopped' })
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onStop()
      })

      expect(window.confirm).toHaveBeenCalledWith('End this conversation? This will stop the timer.')
      expect(mockConversations.patch).toHaveBeenCalledWith(mockConversation.id, {
        status: 'stopped',
        stoppedAt: expect.any(Number),
      })
    })

    it('should not stop conversation if user cancels confirmation', async () => {
      vi.mocked(window.confirm).mockReturnValue(false)
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onStop()
      })

      expect(mockConversations.patch).not.toHaveBeenCalled()
    })

    it('should not stop if no active conversation', async () => {
      mockConversations.activeId = null
      mockConversations.items = []
      
      const { result } = renderHook(() => useConversationControls())
      
      await act(async () => {
        await result.current.onStop()
      })

      expect(mockConversations.patch).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should propagate conversation creation errors', async () => {
      vi.mocked(window.prompt).mockReturnValue('Test Conversation')
      mockConversations.create.mockRejectedValue(new Error('Creation failed'))

      const { result } = renderHook(() => useConversationControls())
      
      // Should propagate error from create function
      await expect(async () => {
        await act(async () => {
          await result.current.onStart()
        })
      }).rejects.toThrow('Creation failed')

      expect(mockConversations.create).toHaveBeenCalled()
    })

    it('should propagate conversation update errors', async () => {
      mockConversations.patch.mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(() => useConversationControls())
      
      // Should propagate error from patch function
      await expect(async () => {
        await act(async () => {
          await result.current.onPause()
        })
      }).rejects.toThrow('Update failed')

      expect(mockConversations.patch).toHaveBeenCalled()
    })
  })
})