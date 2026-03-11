'use client';

import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { PageTransition } from '@/components/layout/PageTransition';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFilterBar } from '@/components/tasks/TaskFilterBar';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/types/tasks';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { ParticleField } from '@/components/ui/ParticleField';

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const { tasks, editingTask, setEditingTask } = useTaskStore();

  const activeTasks = tasks.filter((t) => t.status !== 'done').length;

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <>
      <TopBar
        title="Tasks"
        trailing={
          activeTasks > 0 ? (
            <Badge variant="primary">{activeTasks} active</Badge>
          ) : undefined
        }
      />

      <PageTransition>
        <div className="relative px-4 pt-4 pb-28 space-y-4">
          <ParticleField count={24} maxOpacity={0.18} speed={0.15} />
          <div className="relative z-10 space-y-4">
            <TaskFilterBar />
            <TaskList onEditTask={handleEditTask} />
          </div>
        </div>
      </PageTransition>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className={cn(
          'fixed z-30',
          'bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] right-4',
          'w-14 h-14 rounded-2xl flex items-center justify-center',
          'bg-blue-500 hover:bg-blue-600',
          'shadow-xl shadow-blue-500/30',
          'active:scale-95 transition-all duration-200'
        )}
        aria-label="Add task"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      <TaskForm
        open={showForm}
        onClose={handleCloseForm}
        initialTask={editingTask}
      />
    </>
  );
}
