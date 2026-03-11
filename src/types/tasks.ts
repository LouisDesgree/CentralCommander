export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'personal' | 'work' | 'finance' | 'health' | 'learning' | 'projects';

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; dotColor: string; textColor: string; bgColor: string }
> = {
  critical: {
    label: 'Critical',
    dotColor: 'bg-red-500',
    textColor: 'text-red-500',
    bgColor: 'bg-red-500/10 dark:bg-red-500/15',
  },
  high: {
    label: 'High',
    dotColor: 'bg-orange-500',
    textColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10 dark:bg-orange-500/15',
  },
  medium: {
    label: 'Medium',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-500',
    bgColor: 'bg-amber-400/10 dark:bg-amber-400/15',
  },
  low: {
    label: 'Low',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  },
};

export const TASK_CATEGORY_CONFIG: Record<
  TaskCategory,
  { label: string; color: string; bg: string; icon: string }
> = {
  personal: { label: 'Personal', color: 'text-violet-500', bg: 'bg-violet-500/10', icon: '👤' },
  work:     { label: 'Work',     color: 'text-blue-500',    bg: 'bg-blue-500/10',   icon: '💼' },
  finance:  { label: 'Finance',  color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: '💰' },
  health:   { label: 'Health',   color: 'text-rose-500',    bg: 'bg-rose-500/10',   icon: '❤️' },
  learning: { label: 'Learning', color: 'text-amber-500',   bg: 'bg-amber-500/10',  icon: '📚' },
  projects: { label: 'Projects', color: 'text-indigo-500',  bg: 'bg-indigo-500/10', icon: '🚀' },
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
