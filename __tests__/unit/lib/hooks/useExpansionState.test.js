import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExpansionState } from '@/lib/hooks/useExpansionState';

describe('useExpansionState', () => {
  it('initializes with empty state by default', () => {
    const { result } = renderHook(() => useExpansionState());
    
    expect(result.current.expandedCount).toBe(0);
    expect(result.current.hasExpanded).toBe(false);
    expect(result.current.expandedArray).toEqual([]);
    expect(result.current.isExpanded('item1')).toBe(false);
  });

  it('initializes with provided array', () => {
    const { result } = renderHook(() => useExpansionState(['item1', 'item2']));
    
    expect(result.current.expandedCount).toBe(2);
    expect(result.current.hasExpanded).toBe(true);
    expect(result.current.expandedArray).toEqual(['item1', 'item2']);
    expect(result.current.isExpanded('item1')).toBe(true);
    expect(result.current.isExpanded('item3')).toBe(false);
  });

  it('initializes with provided Set', () => {
    const { result } = renderHook(() => useExpansionState(new Set(['item1', 'item2'])));
    
    expect(result.current.expandedCount).toBe(2);
    expect(result.current.isExpanded('item1')).toBe(true);
    expect(result.current.isExpanded('item2')).toBe(true);
  });

  describe('toggleItem', () => {
    it('expands item when not expanded', () => {
      const { result } = renderHook(() => useExpansionState());
      
      act(() => {
        result.current.toggleItem('item1');
      });
      
      expect(result.current.isExpanded('item1')).toBe(true);
      expect(result.current.expandedCount).toBe(1);
    });

    it('collapses item when expanded', () => {
      const { result } = renderHook(() => useExpansionState(['item1']));
      
      act(() => {
        result.current.toggleItem('item1');
      });
      
      expect(result.current.isExpanded('item1')).toBe(false);
      expect(result.current.expandedCount).toBe(0);
    });
  });

  describe('expandItem', () => {
    it('expands item', () => {
      const { result } = renderHook(() => useExpansionState());
      
      act(() => {
        result.current.expandItem('item1');
      });
      
      expect(result.current.isExpanded('item1')).toBe(true);
    });

    it('does not duplicate already expanded item', () => {
      const { result } = renderHook(() => useExpansionState(['item1']));
      
      act(() => {
        result.current.expandItem('item1');
      });
      
      expect(result.current.expandedCount).toBe(1);
    });
  });

  describe('collapseItem', () => {
    it('collapses expanded item', () => {
      const { result } = renderHook(() => useExpansionState(['item1', 'item2']));
      
      act(() => {
        result.current.collapseItem('item1');
      });
      
      expect(result.current.isExpanded('item1')).toBe(false);
      expect(result.current.isExpanded('item2')).toBe(true);
      expect(result.current.expandedCount).toBe(1);
    });

    it('handles collapsing non-expanded item gracefully', () => {
      const { result } = renderHook(() => useExpansionState());
      
      act(() => {
        result.current.collapseItem('item1');
      });
      
      expect(result.current.expandedCount).toBe(0);
    });
  });

  describe('expandAll', () => {
    it('expands all provided items', () => {
      const { result } = renderHook(() => useExpansionState());
      
      act(() => {
        result.current.expandAll(['item1', 'item2', 'item3']);
      });
      
      expect(result.current.expandedCount).toBe(3);
      expect(result.current.isExpanded('item1')).toBe(true);
      expect(result.current.isExpanded('item2')).toBe(true);
      expect(result.current.isExpanded('item3')).toBe(true);
    });

    it('replaces existing expanded items', () => {
      const { result } = renderHook(() => useExpansionState(['item1']));
      
      act(() => {
        result.current.expandAll(['item2', 'item3']);
      });
      
      expect(result.current.expandedCount).toBe(2);
      expect(result.current.isExpanded('item1')).toBe(false);
      expect(result.current.isExpanded('item2')).toBe(true);
    });
  });

  describe('collapseAll', () => {
    it('collapses all expanded items', () => {
      const { result } = renderHook(() => useExpansionState(['item1', 'item2', 'item3']));
      
      act(() => {
        result.current.collapseAll();
      });
      
      expect(result.current.expandedCount).toBe(0);
      expect(result.current.hasExpanded).toBe(false);
      expect(result.current.isExpanded('item1')).toBe(false);
    });
  });

  describe('reactive properties', () => {
    it('updates expandedCount reactively', () => {
      const { result } = renderHook(() => useExpansionState());
      
      expect(result.current.expandedCount).toBe(0);
      
      act(() => {
        result.current.expandItem('item1');
      });
      
      expect(result.current.expandedCount).toBe(1);
      
      act(() => {
        result.current.expandItem('item2');
      });
      
      expect(result.current.expandedCount).toBe(2);
    });

    it('updates hasExpanded reactively', () => {
      const { result } = renderHook(() => useExpansionState());
      
      expect(result.current.hasExpanded).toBe(false);
      
      act(() => {
        result.current.expandItem('item1');
      });
      
      expect(result.current.hasExpanded).toBe(true);
      
      act(() => {
        result.current.collapseAll();
      });
      
      expect(result.current.hasExpanded).toBe(false);
    });

    it('updates expandedArray reactively', () => {
      const { result } = renderHook(() => useExpansionState());
      
      expect(result.current.expandedArray).toEqual([]);
      
      act(() => {
        result.current.expandItem('item1');
      });
      
      expect(result.current.expandedArray).toContain('item1');
      
      act(() => {
        result.current.expandItem('item2');
      });
      
      expect(result.current.expandedArray).toEqual(expect.arrayContaining(['item1', 'item2']));
    });
  });
});