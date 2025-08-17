/**
 * JSONPreview Component
 * 
 * Enhanced JSON display with syntax highlighting, collapsible sections,
 * and better visual formatting
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/utils/ui-constants';
import { ChevronDown, ChevronRight, Copy, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Enhanced JSON syntax highlighter using Tailwind classes
 */
function highlightJSON(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  
  return json
    // Keys (property names) - blue and semi-bold
    .replace(/("(?:[^"\\]|\\.)*?")\s*:/g, '<span class="text-blue-500 dark:text-indigo-400 font-semibold">$1</span>:')
    // String values - green
    .replace(/:\s*("(?:[^"\\]|\\.)*?")/g, ': <span class="text-green-500 dark:text-emerald-400">$1</span>')
    // Numbers (integers and floats, including negative) - amber
    .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="text-amber-500 dark:text-amber-400 font-medium">$1</span>')
    // Booleans - purple, bold, italic
    .replace(/:\s*(true|false)/g, ': <span class="text-purple-500 dark:text-purple-300 font-semibold italic">$1</span>')
    // Null values - gray, italic
    .replace(/:\s*(null)/g, ': <span class="text-gray-400 dark:text-gray-400 font-medium italic opacity-80">$1</span>')
    // Array values - strings
    .replace(/,\s*("(?:[^"\\]|\\.)*?")/g, ', <span class="text-green-500 dark:text-emerald-400">$1</span>')
    .replace(/\[\s*("(?:[^"\\]|\\.)*?")/g, '[<span class="text-green-500 dark:text-emerald-400">$1</span>')
    // Array values - numbers
    .replace(/,\s*(-?\d+\.?\d*)/g, ', <span class="text-amber-500 dark:text-amber-400 font-medium">$1</span>')
    .replace(/\[\s*(-?\d+\.?\d*)/g, '[<span class="text-amber-500 dark:text-amber-400 font-medium">$1</span>')
    // Array values - booleans
    .replace(/,\s*(true|false)/g, ', <span class="text-purple-500 dark:text-purple-300 font-semibold italic">$1</span>')
    .replace(/\[\s*(true|false)/g, '[<span class="text-purple-500 dark:text-purple-300 font-semibold italic">$1</span>')
    // Array values - null
    .replace(/,\s*(null)/g, ', <span class="text-gray-400 dark:text-gray-400 font-medium italic opacity-80">$1</span>')
    .replace(/\[\s*(null)/g, '[<span class="text-gray-400 dark:text-gray-400 font-medium italic opacity-80">$1</span>')
    // Brackets and braces - gray and bold
    .replace(/([{}[\],])/g, '<span class="text-gray-500 dark:text-gray-300 font-bold">$1</span>');
}

export function JSONPreview({ 
  value, 
  collapsible = false, 
  maxHeight = 'max-h-40',
  className 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const jsonString = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  const highlightedJSON = highlightJSON(jsonString);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const shouldShowControls = collapsible || jsonString.length > 200;
  
  return (
    <div className={cn(
      'relative rounded-lg border overflow-hidden',
      THEME.colors.border.primary,
      THEME.colors.background.tertiary,
      className
    )}>
      {/* Header with controls */}
      {shouldShowControls && (
        <div className={cn(
          'flex items-center justify-between px-3 py-2 border-b',
          THEME.colors.border.primary,
          THEME.colors.background.secondary
        )}>
          <div className="flex items-center gap-2">
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  'p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors',
                  THEME.colors.text.tertiary
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
            <span className={cn('text-xs font-medium', THEME.colors.text.secondary)}>
              JSON Payload
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
      
      {/* JSON content */}
      {(!collapsible || !isCollapsed) && (
        <div className={cn(
          'overflow-auto p-3',
          isExpanded ? 'max-h-96' : maxHeight,
          shouldShowControls ? '' : 'rounded-lg' // Only round if no header
        )}>
          <pre 
            className={cn(
              'text-xs whitespace-pre-wrap break-words leading-relaxed',
              'font-mono', // Fallback for systems without Roboto Mono
              THEME.colors.text.primary
            )}
            style={{ fontFamily: '"Roboto Mono", "SF Mono", Monaco, Inconsolata, "Liberation Mono", "Courier New", monospace' }}
            dangerouslySetInnerHTML={{ __html: highlightedJSON }}
          />
        </div>
      )}
      
      {/* Copy feedback */}
      {copied && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
          Copied!
        </div>
      )}
    </div>
  );
}

/**
 * Compact JSON preview for inline use
 */
export function JSONPreviewInline({ 
  value, 
  maxLength = 50,
  className 
}) {
  const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
  const displayValue = jsonString.length > maxLength 
    ? jsonString.slice(0, maxLength) + '...'
    : jsonString;
  
  return (
    <code 
      className={cn(
        'text-xs px-2 py-1 rounded',
        THEME.colors.background.tertiary,
        THEME.colors.text.secondary,
        className
      )}
      style={{ fontFamily: '"Roboto Mono", "SF Mono", Monaco, Inconsolata, "Liberation Mono", "Courier New", monospace' }}
    >
      {displayValue}
    </code>
  );
}