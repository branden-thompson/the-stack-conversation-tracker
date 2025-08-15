// Custom hook for managing expansion state in timeline components
// Extracted from ConversationTimeline.jsx and TreeTimeline.jsx

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing expansion state of collapsible items
 * @param {Array|Set} initialExpanded - Initial set of expanded item IDs
 * @returns {Object} Expansion state and control functions
 */
export function useExpansionState(initialExpanded = []) {
  const [expandedItems, setExpandedItems] = useState(() => {
    if (initialExpanded instanceof Set) {
      return new Set(initialExpanded);
    }
    return new Set(Array.isArray(initialExpanded) ? initialExpanded : []);
  });

  /**
   * Toggle expansion state for a single item
   * @param {string} itemId - ID of the item to toggle
   */
  const toggleItem = useCallback((itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  /**
   * Expand a specific item
   * @param {string} itemId - ID of the item to expand
   */
  const expandItem = useCallback((itemId) => {
    setExpandedItems(prev => new Set([...prev, itemId]));
  }, []);

  /**
   * Collapse a specific item
   * @param {string} itemId - ID of the item to collapse
   */
  const collapseItem = useCallback((itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  /**
   * Expand all items from a given list
   * @param {Array} itemIds - Array of item IDs to expand
   */
  const expandAll = useCallback((itemIds = []) => {
    setExpandedItems(new Set(itemIds));
  }, []);

  /**
   * Collapse all items
   */
  const collapseAll = useCallback(() => {
    setExpandedItems(new Set());
  }, []);

  /**
   * Check if a specific item is expanded
   * @param {string} itemId - ID of the item to check
   * @returns {boolean} Whether the item is expanded
   */
  const isExpanded = useCallback((itemId) => {
    return expandedItems.has(itemId);
  }, [expandedItems]);

  /**
   * Get count of expanded items
   * @returns {number} Number of expanded items
   */
  const expandedCount = expandedItems.size;

  /**
   * Check if any items are expanded
   * @returns {boolean} Whether any items are expanded
   */
  const hasExpanded = expandedCount > 0;

  /**
   * Get array of expanded item IDs
   * @returns {Array} Array of expanded item IDs
   */
  const expandedArray = Array.from(expandedItems);

  return {
    // State
    expandedItems,
    expandedCount,
    hasExpanded,
    expandedArray,
    
    // Actions
    toggleItem,
    expandItem,
    collapseItem,
    expandAll,
    collapseAll,
    
    // Queries
    isExpanded
  };
}