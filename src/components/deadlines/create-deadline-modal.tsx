'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, addDays } from 'date-fns';

interface MatterOption {
  id: string;
  caseTitle: string;
}

interface CreateDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  matters: MatterOption[];
  defaultMatterId?: string;
  onSuccess?: () => void;
}

const PHILIPPINE_PRESETS = [
  { label: 'Custom Date / Custom Period', days: 0, defaultTitle: '' },
  { label: 'Motion for Reconsideration / New Trial (15 Days)', days: 15, defaultTitle: 'File Motion for Reconsideration' },
  { label: 'Reply / Comment on Motion (10 Days)', days: 10, defaultTitle: 'Submit Reply / Comment' },
  { label: 'Answer to Complaint / Petition (15 Days)', days: 15, defaultTitle: 'File Verified Answer' },
  { label: 'Notice of Appeal (15 Days)', days: 15, defaultTitle: 'File Notice of Appeal' },
  { label: 'Petition for Review - Court of Appeals (15 Days)', days: 15, defaultTitle: 'File Petition for Review' },
  { label: 'Petition for Certiorari - Rule 65 (60 Days)', days: 60, defaultTitle: 'File Petition for Certiorari' },
];

export function CreateDeadlineModal({
  isOpen,
  onClose,
  matters,
  defaultMatterId,
  onSuccess,
}: CreateDeadlineModalProps) {
  const [matterId, setMatterId] = useState(defaultMatterId || matters[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1);
  const [triggerDate, setTriggerDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [periodDays, setPeriodDays] = useState(15);
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 15), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultMatterId) {
      setMatterId(defaultMatterId);
    } else if (matters.length > 0 && !matterId) {
      setMatterId(matters[0].id);
    }
  }, [defaultMatterId, matters, matterId]);

  const handlePresetChange = (presetIdx: number) => {
    setSelectedPresetIndex(presetIdx);
    const preset = PHILIPPINE_PRESETS[presetIdx];
    if (preset.days > 0) {
      setPeriodDays(preset.days);
      if (!title || PHILIPPINE_PRESETS.some((p) => p.defaultTitle === title)) {
        setTitle(preset.defaultTitle);
      }
      const trigger = new Date(triggerDate);
      if (!isNaN(trigger.getTime())) {
        setDueDate(format(addDays(trigger, preset.days), 'yyyy-MM-dd'));
      }
    }
  };

  const handleTriggerDateChange = (newDateStr: string) => {
    setTriggerDate(newDateStr);
    const trigger = new Date(newDateStr);
    if (!isNaN(trigger.getTime()) && periodDays > 0) {
      setDueDate(format(addDays(trigger, periodDays), 'yyyy-MM-dd'));
    }
  };

  const handlePeriodDaysChange = (newDays: number) => {
    setPeriodDays(newDays);
    const trigger = new Date(triggerDate);
    if (!isNaN(trigger.getTime()) && newDays > 0) {
      setDueDate(format(addDays(trigger, newDays), 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!matterId) throw new Error('Please select a matter');
      if (!title) throw new Error('Deadline title is required');
      if (!dueDate) throw new Error('Due date is required');

      const res = await fetch('/api/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matterId,
          title,
          description,
          triggerDate,
          dueDate,
          periodDays,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create deadline');
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Add Court Deadline / Calendar Entry</ModalTitle>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Select
            label="Associated Case / Matter *"
            id="deadline-matter"
            value={matterId}
            onChange={(e) => setMatterId(e.target.value)}
            options={matters.map((m) => ({ value: m.id, label: m.caseTitle }))}
          />

          <Select
            label="Procedural Deadline Calculation Preset"
            id="deadline-preset"
            value={selectedPresetIndex.toString()}
            onChange={(e) => handlePresetChange(parseInt(e.target.value))}
            options={PHILIPPINE_PRESETS.map((p, idx) => ({
              value: idx.toString(),
              label: p.label,
            }))}
          />

          <Input
            label="Deadline Title *"
            id="deadline-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. File Motion for Reconsideration"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Notice / Receipt Date *"
              id="trigger-date"
              type="date"
              required
              value={triggerDate}
              onChange={(e) => handleTriggerDateChange(e.target.value)}
            />

            <Input
              label="Period (Days)"
              id="period-days"
              type="number"
              min="0"
              value={periodDays}
              onChange={(e) => handlePeriodDaysChange(parseInt(e.target.value) || 0)}
            />

            <Input
              label="Final Filing Date *"
              id="due-date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <Textarea
            label="Remarks / Court Filing Notes"
            id="deadline-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional court instructions or remarks..."
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Record Deadline
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
