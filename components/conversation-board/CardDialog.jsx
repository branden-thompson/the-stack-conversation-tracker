/**
 * CardDialog Component
 * Modal dialog for creating new conversation cards
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CARD_TYPES, ZONES } from '@/lib/utils/constants';

export function CardDialog({ 
  open, 
  onOpenChange, 
  onCreateCard 
}) {
  const [content, setContent] = useState('');
  const [type, setType] = useState('topic');
  const [zone, setZone] = useState('active');
  const [isCreating, setIsCreating] = useState(false);
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      await onCreateCard({
        content: content.trim(),
        type,
        zone,
        position: { x: 10, y: 60 }, // Default position in zone
        stackOrder: 0
      });
      
      // Reset form
      setContent('');
      setType('topic');
      setZone('active');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  /**
   * Handle dialog close
   */
  const handleClose = () => {
    setContent('');
    setType('topic');
    setZone('active');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Card</DialogTitle>
          <DialogDescription>
            Add a new conversation card to track discussion topics
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Card Content */}
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Input
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter card content..."
                className="col-span-3"
                autoFocus
              />
            </div>
            
            {/* Card Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Card Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CARD_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded ${config.color} ${config.borderColor} border`}
                        />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Initial Zone */}
            <div className="grid gap-2">
              <Label htmlFor="zone">Initial Zone</Label>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger id="zone">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ZONES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!content.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}