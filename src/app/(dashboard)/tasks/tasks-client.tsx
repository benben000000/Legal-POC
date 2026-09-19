'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
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
  { 
    id: 'TODO', 
    label: 'To Do', 
    next: 'IN_PROGRESS', 
    nextLabel: 'Start Progress' 
  },
  { 
    id: 'IN_PROGRESS', 
    label: 'In Progress', 
    next: 'FOR_ATTORNEY_REVIEW', 
    nextLabel: 'Send for Review' 
  },
  { 
    id: 'FOR_ATTORNEY_REVIEW', 
    label: 'Attorney Review', 
    next: 'COMPLETED_FILED', 
    nextLabel: 'Approve & File' 
  },
  { 
    id: 'COMPLETED_FILED', 
    label: 'Completed / Filed', 
    next: 'TODO', 
    nextLabel: 'Reopen' 
  },
] as const;

export function TasksClient({ tasks: initialTasks, matters, users }: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Drag & drop state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Sync with server state
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleUpdateStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    const previousTasks = [...tasks];

    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    setUpdatingId(taskId);

    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update task status');
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setTasks(previousTasks);
      alert('Unable to move task. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStage: TaskItem['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    setDragOverStage(null);
    setDraggingTaskId(null);

    if (taskId) {
      await handleUpdateStatus(taskId, targetStage);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Collaborative 4-stage legal workflow for case delegation, drafting handoffs, and attorney review."
        action={
          <div className="flex items-center space-x-2">
            <div className="inline-flex rounded-[4px] border border-gray-300 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`px-3 py-1 text-xs font-medium rounded-[2px] transition-colors duration-100 ${
                  viewMode === 'board'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Board View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-medium rounded-[2px] transition-colors duration-100 ${
                  viewMode === 'table'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Table View
              </button>
            </div>

            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              New Task
            </Button>
          </div>
        }
      />

      {viewMode === 'board' ? (
        /* 4-Stage Kanban Board compliant with GEMINI.md */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 select-none">
          {STAGES.map((stage) => {
            const stageTasks = tasks.filter((t) => t.status === stage.id);
            const isColumnActive = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id as TaskItem['status'])}
                className={`flex flex-col bg-gray-50 border rounded-[4px] min-h-[460px] ${
                  isColumnActive
                    ? 'bg-gray-100 border-blue-600'
                    : 'border-gray-200'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200 bg-white rounded-t-[4px] flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    {stage.label}
                  </h3>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-[4px] bg-gray-100 text-gray-700">
                    {stageTasks.length}
                  </span>
                </div>

                {/* Drop Zone & Task Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {stageTasks.length > 0 ? (
                    stageTasks.map((task) => {
                      const isDragging = draggingTaskId === task.id;
                      const isUpdating = updatingId === task.id;

                      return (
                        <div
                          key={task.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white p-3 border border-gray-200 rounded-[4px] shadow-none space-y-2 hover:border-gray-400 transition-colors duration-100 cursor-grab active:cursor-grabbing ${
                            isDragging ? 'opacity-50' : ''
                          } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <Badge
                              variant={
                                task.priority === 'CRITICAL'
                                  ? 'error'
                                  : task.priority === 'HIGH'
                                  ? 'warning'
                                  : 'neutral'
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

                          {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="text-xs text-gray-500 truncate">
                            <Link
                              href={`/matters/${task.matterId}`}
                              className="hover:underline text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.matter.caseTitle}
                            </Link>
                          </div>

                          {/* Footer with Assignee & Quick-Move Button */}
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium truncate max-w-[120px]">
                              {task.assignee
                                ? `${task.assignee.firstName} ${task.assignee.lastName}`
                                : 'Unassigned'}
                            </span>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(task.id, stage.next as TaskItem['status'])}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {isUpdating ? 'Moving...' : `${stage.nextLabel} \u2192`}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full min-h-[160px] flex items-center justify-center p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-[4px]">
                      {isColumnActive ? 'Drop task here' : `No tasks in ${stage.label.toLowerCase()}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabular List View */
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
                {tasks.map((task) => {
                  const currentStage = STAGES.find((s) => s.id === task.status);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium text-gray-900">
                        {task.title}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Link
                          href={`/matters/${task.matterId}`}
                          className="hover:underline text-blue-600"
                        >
                          {task.matter.caseTitle}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs">
                        {task.assignee
                          ? `${task.assignee.firstName} ${task.assignee.lastName}`
                          : 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs font-mono">
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            task.priority === 'CRITICAL'
                              ? 'error'
                              : task.priority === 'HIGH'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-700">
                        {currentStage?.label || task.status}
                      </TableCell>
                      <TableCell className="text-right">
                        {currentStage && (
                          <button
                            type="button"
                            disabled={updatingId === task.id}
                            onClick={() => handleUpdateStatus(task.id, currentStage.next as TaskItem['status'])}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {updatingId === task.id ? 'Moving...' : `${currentStage.nextLabel} \u2192`}
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No tasks found. Click &ldquo;New Task&rdquo; above to create one.
            </div>
          )}
        </Card>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        matters={matters}
        users={users}
      />
    </div>
  );
}
