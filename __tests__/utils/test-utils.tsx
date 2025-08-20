import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { DndContext } from '@dnd-kit/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new QueryClient instance for each test to ensure isolation
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retry for tests
      gcTime: 0, // Disable caching for tests
    },
    mutations: {
      retry: false,
    },
  },
})

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <DndContext>
          {children}
        </DndContext>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Custom renderHook with providers
import { renderHook as rtlRenderHook, RenderHookOptions } from '@testing-library/react'

const customRenderHook = <TProps, TResult>(
  render: (initialProps: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
) => rtlRenderHook(render, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render, customRenderHook as renderHook }