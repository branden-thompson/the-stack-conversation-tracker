/**
 * CardDialog Component
 * Modal to create a new card. Now supports assigning a person (data only).
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { CARD_TYPES } from '@/lib/utils/constants';
import { usePeople } from '@/lib/hooks/usePeople';

export function CardDialog({ open, onOpenChange, onCreateCard }) {
  const [type, setType] = useState('topic');
  const [content, setContent] = useState('');
  const [assignee, setAssignee] = useState(''); // free text; defaults to 'system' if empty
  const [submitting, setSubmitting] = useState(false);

  const { people, createPerson, findByName } = usePeople();

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
      // Resolve person safely
      let personName = assignee?.trim();
      if (!personName) {
        personName = 'system'; // safe default
      }

      // Ensure person exists (create if not found)
      const existing = findByName(personName);
      if (!existing && personName.toLowerCase() !== 'system') {
        await createPerson(personName);
      }

      await onCreateCard?.({
        type,
        content: content?.trim() || '',
        person: personName, // <-- attach person (string) to card payload
      });

      // reset
      setType('topic');
      setContent('');
      setAssignee('');
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
              className="w-full border rounded-md p-2 text-sm min-h-[90px]"
              placeholder="What’s the topic/question/fact/accusation?"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assigned to (person)</Label>
            <Input
              placeholder="e.g. Alex (leave blank to default to 'system')"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              list="people-list"
            />
            {/* Simple datalist for quick pick of existing names */}
            <datalist id="people-list">
              {people.map(p => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
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