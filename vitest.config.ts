import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'happy-dom',
    
    // Global setup
    setupFiles: ['./setup-tests.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        '.next/',
        'out/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        }
      }
    },
    
    // Test patterns
    include: [
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    // Global test utilities
    globals: true,
    
    // Mock configuration
    mockReset: true,
    restoreMocks: true,
    
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  
  // Path resolution to match Next.js
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  
  // Define global variables for tests
  define: {
    'process.env.NODE_ENV': '"test"',
  },
})