/**
 * StackControls Component
 * Provides controls for managing card stacks
 */

'use client';

import { useState } from 'react';
import { 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Maximize, 
  Minimize2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function StackControls({ 
  cards, 
  onReorderStack, 
  onExpandStack, 
  onCollapseStack 
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (cards.length <= 1) return null;
  
  /**
   * Move card up in stack
   */
  const moveCardUp = (index) => {
    if (index === 0) return;
    const newOrder = [...cards];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorderStack(newOrder);
  };
  
  /**
   * Move card down in stack
   */
  const moveCardDown = (index) => {
    if (index === cards.length - 1) return;
    const newOrder = [...cards];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorderStack(newOrder);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-8 right-0 h-6 px-2"
        >
          <Layers className="w-3 h-3 mr-1" />
          {cards.length} stacked
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Stack Order</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onExpandStack()}
                title="Expand stack"
              >
                <Maximize className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCollapseStack()}
                title="Collapse stack"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {cards.map((card, index) => {
            const cardType = CARD_TYPES[card.type] || CARD_TYPES.topic;
            return (
              <div
                key={card.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded text-xs",
                  cardType.color,
                  cardType.borderColor,
                  "border"
                )}
              >
                <span className="truncate flex-1 mr-2">
                  {card.content || "Empty card"}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => moveCardUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => moveCardDown(index)}
                    disabled={index === cards.length - 1}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}