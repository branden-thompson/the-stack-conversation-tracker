/**
 * CardDialog Component
 * Modal to create a new card. Now supports user assignment.
 */

'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { UserSelector } from '@/components/ui/user-selector';
import { CARD_TYPES } from '@/lib/utils/constants';
import { User, Crown } from 'lucide-react';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { cn } from '@/lib/utils';

export function CardDialog({ open, onOpenChange, onCreateCard, users = [], currentUser = null }) {
  const dynamicTheme = useDynamicAppTheme();
  const [type, setType] = useState('topic');
  const [content, setContent] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(''); // User ID for assignment
  const [submitting, setSubmitting] = useState(false);

  const typeOptions = useMemo(() => {
    const keys = Object.keys(CARD_TYPES || {});
    // keep common order if available
    const order = ['topic', 'question', 'accusation', 'fact', 'factual', 'factual_statement', 'objective_fact'];
    const sorted = [...new Set([...order, ...keys])].filter(k => CARD_TYPES?.[k]);
    return sorted.map(k => ({ key: k, label: CARD_TYPES[k].label || k }));
  }, []);

  const handleClose = () => {
    onOpenChange?.(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (submitting) return;

    setSubmitting(true);
    try {
      await onCreateCard?.({
        type,
        content: content?.trim() || '',
        assignedUserId: assignedUserId || null,
      });

      // reset
      setType('topic');
      setContent('');
      setAssignedUserId('');
      handleClose();
    } catch (err) {
      // keep dialog open; you could surface an error toast here
      /* noop */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Card</DialogTitle>
          <DialogDescription>Create a new conversation card.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Type */}
          <div className="space-y-2">
            <Label>Card type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <textarea
              className={cn(
                "w-full border rounded-md p-2 text-sm min-h-[90px] transition-colors outline-none focus:ring-2 focus:ring-blue-500/50",
                dynamicTheme.colors.background.secondary,
                dynamicTheme.colors.border.primary,
                dynamicTheme.colors.text.primary,
                "placeholder:" + dynamicTheme.colors.text.tertiary
              )}
              placeholder="What's the topic/question/fact/accusation?"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          {/* Current User Info */}
          {currentUser && (
            <div className={cn(
              "rounded-md p-3",
              dynamicTheme.colors.background.tertiary
            )}>
              <Label className={cn(
                "text-sm font-medium",
                dynamicTheme.colors.text.secondary
              )}>Creating as:</Label>
              <div className="flex items-center gap-2 mt-1">
                <User className={cn("w-4 h-4", dynamicTheme.colors.text.tertiary)} />
                <span className={cn("text-sm font-medium", dynamicTheme.colors.text.primary)}>
                  {currentUser.name}
                  {currentUser.isSystemUser && (
                    <Crown className="w-3 h-3 ml-1 inline opacity-60" />
                  )}
                </span>
                {currentUser.preferences?.theme && (
                  <span className={cn("text-xs capitalize", dynamicTheme.colors.text.tertiary)}>
                    ({currentUser.preferences.theme})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Assignment */}
          <div className="space-y-2">
            <Label>Assign to user (optional)</Label>
            <UserSelector
              users={users}
              currentUserId={assignedUserId}
              onUserSelect={(user) => setAssignedUserId(user.id)}
              placeholder="No assignment"
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}