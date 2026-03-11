'use client';

import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { TASK_PRIORITY_CONFIG, TASK_CATEGORY_CONFIG, type Task } from '@/types/tasks';
import { cn } from '@/lib/cn';
import { Check, Calendar, Trash2, ChevronRight } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { toggleDone, deleteTask } = useTaskStore();

  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const categoryConfig = TASK_CATEGORY_CONFIG[task.category];
  const isDone = task.status === 'done';

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due && due < now && !isDone;
  const isToday = due && due.toDateString() === new Date().toDateString();

  const formattedDue = due
    ? due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3.5',
        'bg-white/60 dark:bg-white/8 backdrop-blur-xl',
        'border border-white/20 dark:border-white/10 rounded-2xl',
        'transition-opacity duration-200',
        isDone && 'opacity-55'
      )}
    >
      {/* Priority bar */}
      <div
        className={cn(
          'absolute left-0 top-4 bottom-4 w-[3px] rounded-full',
          priorityConfig.dotColor
        )}
      />

      {/* Checkbox */}
      <button
        onClick={() => toggleDone(task.id)}
        className={cn(
          'flex-none w-[22px] h-[22px] rounded-full border-2 transition-all duration-200',
          'flex items-center justify-center mt-0.5',
          isDone
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 dark:border-white/25 hover:border-blue-500 dark:hover:border-blue-400'
        )}
      >
        {isDone && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(task)}>
        <p
          className={cn(
            'text-sm font-medium leading-snug',
            isDone && 'line-through text-gray-400 dark:text-gray-500'
          )}
        >
          {task.title}
        </p>
        {task.description && !isDone && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full',
              categoryConfig.bg,
              categoryConfig.color
            )}
          >
            {categoryConfig.icon} {categoryConfig.label}
          </span>
          {formattedDue && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[11px] font-medium',
                isOverdue
                  ? 'text-red-500'
                  : isToday
                    ? 'text-blue-500'
                    : 'text-gray-400 dark:text-gray-500'
              )}
            >
              <Calendar className="w-3 h-3" />
              {isOverdue ? 'Overdue · ' : isToday ? 'Today · ' : ''}
              {formattedDue}
            </span>
          )}
          {task.status === 'in_progress' && (
            <span className="text-[11px] font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              In progress
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-gray-400 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
