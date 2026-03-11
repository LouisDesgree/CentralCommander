'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import {
  TASK_PRIORITY_CONFIG,
  TASK_CATEGORY_CONFIG,
  type Task,
  type TaskPriority,
  type TaskCategory,
} from '@/types/tasks';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  initialTask?: Task | null;
}

export function TaskForm({ open, onClose, initialTask }: TaskFormProps) {
  const { addTask, updateTask } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? '');
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
      setDueDate(initialTask.dueDate ?? '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('personal');
      setDueDate('');
    }
  }, [initialTask, open]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (initialTask) {
      updateTask(initialTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate || undefined,
        status: initialTask.status,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate || undefined,
        status: 'todo',
      });
    }

    onClose();
  };

  const inputCls = cn(
    'w-full px-4 py-3 text-sm',
    'bg-white/40 dark:bg-white/8 backdrop-blur-lg',
    'border border-white/20 dark:border-white/10 rounded-xl',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'outline-none focus:ring-2 focus:ring-blue-500/30',
    'transition-all duration-200'
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className={cn(
              'fixed bottom-0 inset-x-0 z-50',
              'bg-white/92 dark:bg-[#1a1d26]/95 backdrop-blur-3xl',
              'border-t border-white/20 dark:border-white/10 rounded-t-3xl',
              'px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+20px)]',
              'max-h-[90dvh] overflow-y-auto'
            )}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {initialTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Title */}
              <input
                type="text"
                placeholder="Task title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className={cn(inputCls, 'text-base font-medium')}
                autoFocus
              />

              {/* Description */}
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={cn(inputCls, 'resize-none')}
              />

              {/* Priority */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    Object.entries(TASK_PRIORITY_CONFIG) as [
                      TaskPriority,
                      (typeof TASK_PRIORITY_CONFIG)[TaskPriority],
                    ][]
                  ).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPriority(key)}
                      className={cn(
                        'py-2 rounded-xl text-xs font-semibold transition-all duration-150',
                        priority === key
                          ? `${config.bgColor} ${config.textColor} ring-1 ring-current/25`
                          : 'bg-white/40 dark:bg-white/8 text-gray-500 border border-white/20 dark:border-white/10'
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    Object.entries(TASK_CATEGORY_CONFIG) as [
                      TaskCategory,
                      (typeof TASK_CATEGORY_CONFIG)[TaskCategory],
                    ][]
                  ).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={cn(
                        'py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150',
                        category === key
                          ? `${config.bg} ${config.color} ring-1 ring-current/25`
                          : 'bg-white/40 dark:bg-white/8 text-gray-500 border border-white/20 dark:border-white/10'
                      )}
                    >
                      <span>{config.icon}</span>
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className={cn(
                  'w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200',
                  'bg-blue-500 hover:bg-blue-600 active:scale-[0.98]',
                  'shadow-lg shadow-blue-500/25',
                  'disabled:opacity-40 disabled:pointer-events-none'
                )}
              >
                {initialTask ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
