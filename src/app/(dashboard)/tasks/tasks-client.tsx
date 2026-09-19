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
  assigneeId?: string | null;
  matter: { caseTitle: string };
  assignee: { firstName: string; lastName: string; role?: string } | null;
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
  currentUserId?: string;
  currentUserRole?: string;
}

const STAGES = [
  { 
    id: 'TODO', 
    label: 'To Do', 
    dotColor: 'bg-gray-400',
    headerBg: 'bg-gray-50',
    next: 'IN_PROGRESS', 
    nextLabel: 'Start Progress' 
  },
  { 
    id: 'IN_PROGRESS', 
    label: 'In Progress', 
    dotColor: 'bg-blue-500',
    headerBg: 'bg-blue-50/40',
    next: 'FOR_ATTORNEY_REVIEW', 
    nextLabel: 'Send for Review' 
  },
  { 
    id: 'FOR_ATTORNEY_REVIEW', 
    label: 'Attorney Review', 
    dotColor: 'bg-amber-500',
    headerBg: 'bg-amber-50/40',
    next: 'COMPLETED_FILED', 
    nextLabel: 'Approve & File' 
  },
  { 
    id: 'COMPLETED_FILED', 
    label: 'Completed / Filed', 
    dotColor: 'bg-green-500',
    headerBg: 'bg-green-50/40',
    next: 'TODO', 
    nextLabel: 'Reopen' 
  },
] as const;

export function TasksClient({
  tasks: initialTasks,
  matters,
  users,
  currentUserId,
  currentUserRole,
}: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Drag & drop state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Sync with server state
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const myTasksCount = currentUserId
    ? tasks.filter((t) => t.assigneeId === currentUserId).length
    : 0;

  const displayedTasks =
    scope === 'mine' && currentUserId
      ? tasks.filter((t) => t.assigneeId === currentUserId)
      : tasks;

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
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cogwheel Scope Switcher: All Firm Tasks vs My Tasks */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  scope === 'all'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Firm Tasks ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setScope('mine')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  scope === 'mine'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Tasks ({myTasksCount})
              </button>
            </div>

            {/* View Switcher Pill */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  viewMode === 'board'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kanban Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
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
        /* 4-Stage Modern Drag-and-Drop Kanban Board */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 select-none">
          {STAGES.map((stage) => {
            const stageTasks = displayedTasks.filter((t) => t.status === stage.id);
            const isColumnActive = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={(e) => handleDragLeave(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id as TaskItem['status'])}
                className={`flex flex-col bg-gray-50/80 border rounded-2xl transition-all duration-150 min-h-[480px] ${
                  isColumnActive
                    ? 'kanban-column-active border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-gray-200 rounded-t-2xl flex items-center justify-between ${stage.headerBg}`}>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`}></span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      {stage.label}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 shadow-xs">
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
                          className={`group bg-white p-4 border border-gray-200/90 rounded-xl shadow-xs space-y-2.5 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all duration-150 ${
                            isDragging ? 'kanban-card-dragging' : ''
                          } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-gray-300 group-hover:text-gray-500 text-xs select-none">
                                ⠿
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                                  task.priority === 'CRITICAL'
                                    ? 'text-rose-700'
                                    : task.priority === 'HIGH'
                                    ? 'text-amber-700'
                                    : 'text-gray-500'
                                }`}
                              >
                                {task.priority === 'CRITICAL' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                                {task.priority === 'HIGH' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                                {task.priority === 'CRITICAL' ? 'Critical' : task.priority === 'HIGH' ? 'High' : task.priority === 'NORMAL' ? 'Normal' : 'Low'}
                              </span>
                            </div>

                            {task.dueDate && (
                              <span className="text-[11px] text-gray-500 font-mono">
                                Due: {format(new Date(task.dueDate), 'MMM d')}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="text-xs text-gray-500 truncate pt-1">
                            <Link
                              href={`/matters/${task.matterId}`}
                              className="hover:underline text-blue-600 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.matter.caseTitle}
                            </Link>
                          </div>

                          {/* Footer with Assignee & Quick-Move Button */}
                          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1.5 text-gray-600">
                              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] flex items-center justify-center border border-blue-200 uppercase">
                                {task.assignee ? task.assignee.firstName[0] : '?'}
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="truncate max-w-[100px] text-[11px] font-medium">
                                  {task.assignee
                                    ? `${task.assignee.firstName} ${task.assignee.lastName}`
                                    : 'Unassigned'}
                                </span>
                                {task.assigneeId === currentUserId && (
                                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(task.id, stage.next as TaskItem['status'])}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
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
                          : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      <span>
                        {isColumnActive ? 'Release to move here' : `No tasks in ${stage.label.toLowerCase()}`}
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
                {displayedTasks.map((task) => {
                  const currentStage = STAGES.find((s) => s.id === task.status);
                  return (
                    <TableRow key={task.id} className="hover:bg-gray-50/80 transition-colors">
                      <TableCell className="font-semibold text-gray-900">
                        {task.title}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Link
                          href={`/matters/${task.matterId}`}
                          className="hover:underline text-blue-600 font-medium"
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
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            task.priority === 'CRITICAL'
                              ? 'text-rose-700'
                              : task.priority === 'HIGH'
                              ? 'text-amber-700'
                              : 'text-gray-600'
                          }`}
                        >
                          {task.priority === 'CRITICAL' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                          {task.priority === 'HIGH' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                          {task.priority === 'CRITICAL' ? 'Critical' : task.priority === 'HIGH' ? 'High' : task.priority === 'NORMAL' ? 'Normal' : 'Low'}
                        </span>
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
