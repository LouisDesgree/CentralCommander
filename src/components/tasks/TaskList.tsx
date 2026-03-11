'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { TaskItem } from './TaskItem';
import type { Task } from '@/types/tasks';
import { CheckCircle2, ListTodo } from 'lucide-react';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

export function TaskList({ onEditTask }: TaskListProps) {
  const { tasks, activeView, activeCategory } = useTaskStore();

  const filtered = useMemo(() => {
    const todayStr = new Date().toDateString();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return tasks
      .filter((t) => {
        if (activeCategory && t.category !== activeCategory) return false;

        switch (activeView) {
          case 'today':
            return (
              t.dueDate &&
              new Date(t.dueDate).toDateString() === todayStr &&
              t.status !== 'done'
            );
          case 'upcoming':
            return t.dueDate && new Date(t.dueDate) >= now && t.status !== 'done';
          case 'done':
            return t.status === 'done';
          default: // 'all' => active tasks
            return t.status !== 'done';
        }
      })
      .sort((a, b) => {
        // Sort by priority then by due date
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pDiff !== 0) return pDiff;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, activeView, activeCategory]);

  if (filtered.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 gap-3 text-center"
      >
        {activeView === 'done' ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-gray-200 dark:text-white/15" />
            <p className="text-sm font-medium text-gray-500">No completed tasks yet</p>
            <p className="text-xs text-gray-400">Complete a task to see it here</p>
          </>
        ) : (
          <>
            <ListTodo className="w-12 h-12 text-gray-200 dark:text-white/15" />
            <p className="text-sm font-medium text-gray-500">
              {activeView === 'today'
                ? 'Nothing due today'
                : activeView === 'upcoming'
                  ? 'No upcoming tasks'
                  : 'No active tasks'}
            </p>
            <p className="text-xs text-gray-400">Tap + to add a new task</p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div layout className="space-y-2">
      <AnimatePresence mode="popLayout">
        {filtered.map((task) => (
          <TaskItem key={task.id} task={task} onEdit={onEditTask} />
        ))}
      </AnimatePresence>
      <motion.p
        layout
        className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2 pb-1"
      >
        {filtered.length} task{filtered.length !== 1 ? 's' : ''}
      </motion.p>
    </motion.div>
  );
}
