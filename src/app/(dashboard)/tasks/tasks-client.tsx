'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'FOR_ATTORNEY_REVIEW' | 'COMPLETED_FILED';
  priority: string;
  dueDate: string | null;
  matterId: string;
  matter: { caseTitle: string };
  assignee: { firstName: string; lastName: string } | null;
}

interface MatterOption {
  id: string;
  caseTitle: string;
}

interface UserOption {
  id: string;
  name: string;
  role: string;
}

interface TasksClientProps {
  tasks: TaskItem[];
  matters: MatterOption[];
  users: UserOption[];
}

const STAGES = [
  { id: 'TODO', label: 'To Do', next: 'IN_PROGRESS', nextLabel: 'Start Progress' },
  { id: 'IN_PROGRESS', label: 'In Progress', next: 'FOR_ATTORNEY_REVIEW', nextLabel: 'Send for Review' },
  { id: 'FOR_ATTORNEY_REVIEW', label: 'Attorney Review', next: 'COMPLETED_FILED', nextLabel: 'Approve & File' },
  { id: 'COMPLETED_FILED', label: 'Completed / Filed', next: 'TODO', nextLabel: 'Reopen' },
] as const;

export function TasksClient({ tasks, matters, users }: TasksClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        alert('Failed to update task status');
        return;
      }

      router.refresh();
    } catch {
      alert('Network error updating task status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collaborative Workflow & Tasks"
        description="4-stage legal workflow board for case delegation, drafting handoffs, and attorney review."
        action={
          <div className="flex space-x-2">
            <div className="inline-flex rounded-[4px] border border-gray-300 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`px-3 py-1 text-xs font-medium rounded-[2px] transition-colors ${
                  viewMode === 'board' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Board View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-medium rounded-[2px] transition-colors ${
                  viewMode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Table View
              </button>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              New Task
            </Button>
          </div>
        }
      />

      {viewMode === 'board' ? (
        /* 4-Stage Operational Workflow Board */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((stage) => {
            const stageTasks = tasks.filter((t) => t.status === stage.id);
            return (
              <div key={stage.id} className="flex flex-col bg-gray-50 border border-gray-200 rounded-[4px]">
                <div className="p-3 border-b border-gray-200 bg-white rounded-t-[4px] flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    {stage.label}
                  </h3>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-[4px] bg-gray-100 text-gray-700">
                    {stageTasks.length}
                  </span>
                </div>

                <div className="p-3 space-y-3 flex-1 overflow-y-auto min-h-[350px]">
                  {stageTasks.length > 0 ? (
                    stageTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-3 border border-gray-200 rounded-[4px] shadow-none space-y-2 hover:border-gray-400 transition-colors duration-100"
                      >
                        <div className="flex items-start justify-between">
                          <Badge
                            variant={
                              task.priority === 'CRITICAL' ? 'error' :
                              task.priority === 'HIGH' ? 'warning' : 'neutral'
                            }
                          >
                            {task.priority}
                          </Badge>
                          {task.dueDate && (
                            <span className="text-[11px] text-gray-500 font-mono">
                              Due: {format(new Date(task.dueDate), 'MMM d')}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-medium text-gray-900 leading-snug">
                          {task.title}
                        </h4>

                        <div className="text-xs text-gray-500 truncate">
                          <Link href={`/matters/${task.matterId}`} className="hover:underline text-blue-600">
                            {task.matter.caseTitle}
                          </Link>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                          </span>

                          <button
                            type="button"
                            disabled={updatingId === task.id}
                            onClick={() => handleUpdateStatus(task.id, stage.next)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {updatingId === task.id ? 'Moving...' : `${stage.nextLabel} \u2192`}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-[4px]">
                      No tasks in {stage.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card>
          {tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Matter</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Workflow Stage</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium text-gray-900">{task.title}</TableCell>
                    <TableCell className="text-gray-600">
                      <Link href={`/matters/${task.matterId}`} className="hover:underline text-blue-600">
                        {task.matter.caseTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs">
                      {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.priority === 'CRITICAL' ? 'error' : task.priority === 'HIGH' ? 'warning' : 'neutral'}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.status === 'COMPLETED_FILED' ? 'success' :
                          task.status === 'IN_PROGRESS' || task.status === 'FOR_ATTORNEY_REVIEW' ? 'info' : 'neutral'
                        }
                      >
                        {task.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {task.status !== 'COMPLETED_FILED' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={updatingId === task.id}
                          onClick={() => {
                            const nextStage = task.status === 'TODO'
                              ? 'IN_PROGRESS'
                              : task.status === 'IN_PROGRESS'
                              ? 'FOR_ATTORNEY_REVIEW'
                              : 'COMPLETED_FILED';
                            handleUpdateStatus(task.id, nextStage);
                          }}
                        >
                          Advance Stage
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={updatingId === task.id}
                          onClick={() => handleUpdateStatus(task.id, 'TODO')}
                        >
                          Reopen
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No workflow tasks found"
              description="Assign tasks to associates or paralegals to track drafting and filings."
              action={
                <Button onClick={() => setIsCreateOpen(true)}>
                  Create First Task
                </Button>
              }
            />
          )}
        </Card>
      )}

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        matters={matters}
        users={users}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
