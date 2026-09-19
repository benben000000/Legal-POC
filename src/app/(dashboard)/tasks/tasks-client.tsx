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
    dotColor: 'bg-slate-400',
    headerBg: 'bg-slate-50',
    next: 'IN_PROGRESS', 
    nextLabel: 'Start Progress' 
  },
  { 
    id: 'IN_PROGRESS', 
    label: 'In Progress', 
    dotColor: 'bg-blue-500',
    headerBg: 'bg-blue-50/50',
    next: 'FOR_ATTORNEY_REVIEW', 
    nextLabel: 'Send for Review' 
  },
  { 
    id: 'FOR_ATTORNEY_REVIEW', 
    label: 'Attorney Review', 
    dotColor: 'bg-amber-500',
    headerBg: 'bg-amber-50/50',
    next: 'COMPLETED_FILED', 
    nextLabel: 'Approve & File' 
  },
  { 
    id: 'COMPLETED_FILED', 
    label: 'Completed / Filed', 
    dotColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50/50',
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
    // Find task
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
      // Revert on error
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
    // Only reset if leaving the column container
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
        title="Collaborative Workflow & Kanban"
        description="Interactive 4-stage legal Kanban board. Drag and drop case items across stages for drafting handoffs, partner review, and court filing."
        action={
          <div className="flex items-center space-x-3">
            {/* View Switcher Pill */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  viewMode === 'board'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kanban Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table View
              </button>
            </div>

            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              + New Task
            </Button>
          </div>
        }
      />

      {viewMode === 'board' ? (
        /* 4-Stage Interactive Drag-and-Drop Kanban Board */
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
                className={`flex flex-col bg-slate-50/70 border rounded-2xl transition-all duration-200 min-h-[480px] ${
                  isColumnActive
                    ? 'kanban-column-active border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 hover:border-slate-300/80'
                }`}
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-slate-200/80 rounded-t-2xl flex items-center justify-between ${stage.headerBg}`}>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`}></span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {stage.label}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200/80 text-slate-700 shadow-xs">
                    {stageTasks.length}
                  </span>
                </div>

                {/* Drop Zone & Task List */}
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
                          className={`group bg-white p-4 border border-slate-200/90 rounded-xl shadow-xs space-y-2.5 cursor-grab active:cursor-grabbing hover:border-slate-300 hover:shadow-sm transition-all duration-150 ${
                            isDragging ? 'kanban-card-dragging' : ''
                          } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-1.5">
                              {/* Drag Grip Handle */}
                              <span className="text-slate-300 group-hover:text-slate-500 text-xs select-none">
                                ⠿
                              </span>
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
                            </div>

                            {task.dueDate && (
                              <span className="text-[11px] text-slate-500 font-mono">
                                {format(new Date(task.dueDate), 'MMM d')}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="text-xs text-slate-500 truncate pt-1">
                            <Link
                              href={`/matters/${task.matterId}`}
                              className="hover:underline text-blue-600 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.matter.caseTitle}
                            </Link>
                          </div>

                          {/* Footer with Assignee & Quick-Move Button */}
                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1.5 text-slate-600">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] flex items-center justify-center border border-slate-200">
                                {task.assignee ? task.assignee.firstName[0] : '?'}
                              </span>
                              <span className="truncate max-w-[100px] text-[11px] font-medium">
                                {task.assignee
                                  ? `${task.assignee.firstName} ${task.assignee.lastName}`
                                  : 'Unassigned'}
                              </span>
                            </div>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(task.id, stage.next as TaskItem['status'])}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                              title={`Advance to ${stage.nextLabel}`}
                            >
                              {isUpdating ? '...' : `${stage.nextLabel} \u2192`}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className={`h-full min-h-[180px] flex flex-col items-center justify-center p-6 text-center text-xs rounded-xl border border-dashed transition-all duration-150 ${
                        isColumnActive
                          ? 'border-blue-400 bg-blue-50/50 text-blue-600 font-medium'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      <span className="text-lg mb-1 opacity-70">
                        {isColumnActive ? '📥' : '📂'}
                      </span>
                      <span>
                        {isColumnActive ? `Release to move here` : `No tasks in ${stage.label.toLowerCase()}`}
                      </span>
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
                      <TableCell className="font-semibold text-slate-900">
                        {task.title}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <Link
                          href={`/matters/${task.matterId}`}
                          className="hover:underline text-blue-600 font-medium"
                        >
                          {task.matter.caseTitle}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs">
                        {task.assignee
                          ? `${task.assignee.firstName} ${task.assignee.lastName}`
                          : 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs font-mono">
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
                      <TableCell>
                        <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-700">
                          <span className={`w-2 h-2 rounded-full ${currentStage?.dotColor || 'bg-slate-400'}`}></span>
                          <span>{currentStage?.label || task.status}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {currentStage && (
                          <button
                            type="button"
                            disabled={updatingId === task.id}
                            onClick={() => handleUpdateStatus(task.id, currentStage.next as TaskItem['status'])}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
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
            <div className="p-8 text-center text-slate-500">
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
