'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface MatterOption {
  id: string;
  caseTitle: string;
}

interface UserOption {
  id: string;
  name: string;
  role: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  matters: MatterOption[];
  users: UserOption[];
  defaultMatterId?: string;
  onSuccess?: () => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  matters,
  users,
  defaultMatterId,
  onSuccess,
}: CreateTaskModalProps) {
  const [matterId, setMatterId] = useState(defaultMatterId || matters[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!matterId) throw new Error('Please select a matter');
      if (!title) throw new Error('Task title is required');

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matterId,
          title,
          description,
          assignedToId: assigneeId || undefined,
          priority,
          status: 'TODO',
          dueDate: dueDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
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
        <ModalTitle>Create Legal Workflow Task</ModalTitle>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Select
            label="Associated Matter *"
            id="task-matter"
            value={matterId}
            onChange={(e) => setMatterId(e.target.value)}
            options={matters.map((m) => ({ value: m.id, label: m.caseTitle }))}
          />

          <Input
            label="Task Title *"
            id="task-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Draft Pre-Trial Brief"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Assigned Team Member"
              id="task-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.role.replace('_', ' ')})`,
              }))}
            />

            <Select
              label="Priority *"
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
              ]}
            />
          </div>

          <Input
            label="Due Date"
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Textarea
            label="Work Instructions / Scope"
            id="task-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specific instructions for drafting, research, or filing..."
          />
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Assign Task
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
