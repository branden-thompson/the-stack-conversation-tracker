/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils - cn function', () => {
  describe('Basic functionality', () => {
    it('should combine simple class names', () => {
      const result = cn('bg-red-500', 'text-white');
      expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle single class name', () => {
      const result = cn('bg-blue-500');
      expect(result).toBe('bg-blue-500');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle null and undefined inputs', () => {
      const result = cn(null, undefined, 'bg-green-500');
      expect(result).toBe('bg-green-500');
    });
  });

  describe('Conditional class handling', () => {
    it('should handle conditional classes with falsy values', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class');
    });

    it('should handle conditional classes with truthy values', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class active-class');
    });

    it('should handle object-style conditionals', () => {
      const result = cn({
        'bg-red-500': true,
        'text-white': false,
        'border-solid': true
      });
      expect(result).toBe('bg-red-500 border-solid');
    });
  });

  describe('Tailwind conflict resolution', () => {
    it('should resolve conflicting padding classes', () => {
      const result = cn('p-4', 'p-6');
      expect(result).toBe('p-6'); // Later class should win
    });

    it('should resolve conflicting background colors', () => {
      const result = cn('bg-red-500', 'bg-blue-500');
      expect(result).toBe('bg-blue-500');
    });

    it('should resolve conflicting text sizes', () => {
      const result = cn('text-sm', 'text-lg', 'text-xl');
      expect(result).toBe('text-xl');
    });

    it('should handle mixed conflicting and non-conflicting classes', () => {
      const result = cn('p-4 text-white bg-red-500', 'p-6 border-solid bg-blue-500');
      expect(result).toBe('text-white p-6 border-solid bg-blue-500');
    });
  });

  describe('Array input handling', () => {
    it('should handle array of class names', () => {
      const result = cn(['bg-red-500', 'text-white', 'p-4']);
      expect(result).toBe('bg-red-500 text-white p-4');
    });

    it('should handle nested arrays', () => {
      const result = cn(['bg-red-500', ['text-white', 'p-4']]);
      expect(result).toBe('bg-red-500 text-white p-4');
    });

    it('should handle mixed arrays and strings', () => {
      const result = cn('base-class', ['bg-red-500', 'text-white'], 'border-solid');
      expect(result).toBe('base-class bg-red-500 text-white border-solid');
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should handle button variant classes', () => {
      const variant = 'primary';
      const size = 'lg';
      const disabled = false;
      
      const result = cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled
        }
      );
      
      expect(result).toContain('bg-blue-600 text-white hover:bg-blue-700');
      expect(result).toContain('px-6 py-3 text-lg');
      expect(result).not.toContain('opacity-50');
    });

    it('should handle card component classes', () => {
      const elevated = true;
      const interactive = false;
      
      const result = cn(
        'rounded-lg border bg-white dark:bg-gray-800',
        elevated && 'shadow-lg',
        interactive && 'hover:shadow-xl cursor-pointer transition-shadow',
        'p-6'
      );
      
      expect(result).toContain('rounded-lg border bg-white dark:bg-gray-800');
      expect(result).toContain('shadow-lg');
      expect(result).toContain('p-6');
      expect(result).not.toContain('hover:shadow-xl');
    });

    it('should handle responsive classes', () => {
      const result = cn(
        'w-full',
        'sm:w-1/2',
        'md:w-1/3',
        'lg:w-1/4',
        'xl:w-1/5'
      );
      
      expect(result).toBe('w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      const result = cn('', 'bg-red-500', '', 'text-white');
      expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle whitespace-only strings', () => {
      const result = cn('   ', 'bg-red-500', '  ', 'text-white');
      expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle duplicate classes', () => {
      const result = cn('bg-red-500', 'bg-red-500', 'text-white');
      expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle very long class lists', () => {
      const manyClasses = Array.from({ length: 50 }, (_, i) => `class-${i}`);
      const result = cn(...manyClasses);
      expect(result).toContain('class-0');
      expect(result).toContain('class-49');
    });
  });
});