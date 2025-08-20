import '@testing-library/jest-dom'
import React from 'react'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Automatically cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    const { src, alt, ...otherProps } = props
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...otherProps })
  },
}))

// Mock environment variables
process.env.NODE_ENV = 'test'

// Enable all safety switches for tests
process.env.NEXT_PUBLIC_USE_REACT_QUERY = 'true'
process.env.NEXT_PUBLIC_CARD_EVENTS_ENABLED = 'true'
process.env.NEXT_PUBLIC_USER_TRACKING_ENABLED = 'true'
process.env.NEXT_PUBLIC_SESSION_EVENTS_ENABLED = 'true'
process.env.NEXT_PUBLIC_CONVERSATION_POLLING_ENABLED = 'true'
process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED = 'true'

// Ensure test database directory exists and is writable
beforeAll(async () => {
  // Mock fetch for tests that don't mock it explicitly
  if (!global.fetch) {
    global.fetch = vi.fn()
  }
})

// Global test utilities
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// Mock localStorage and sessionStorage with default safety switch values
const createStorageMock = () => ({
  getItem: vi.fn((key) => {
    // Enable safety switches by default in tests
    if (key === 'emergency-disable') return 'false';
    return null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
})

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: createStorageMock(),
})

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: createStorageMock(),
})

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))