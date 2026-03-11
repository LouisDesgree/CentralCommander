import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskCategory } from '@/types/tasks';
import { generateId } from '@/lib/utils';

export type TaskView = 'all' | 'today' | 'upcoming' | 'done';

interface TaskStoreState {
  tasks: Task[];
  activeView: TaskView;
  activeCategory: TaskCategory | null;
  editingTask: Task | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleDone: (id: string) => void;
  setActiveView: (view: TaskView) => void;
  setActiveCategory: (category: TaskCategory | null) => void;
  setEditingTask: (task: Task | null) => void;
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set) => ({
      tasks: [],
      activeView: 'all',
      activeCategory: null,
      editingTask: null,

      addTask: (taskData) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: [
            {
              ...taskData,
              id: generateId(),
              createdAt: now,
              updatedAt: now,
            },
            ...state.tasks,
          ],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      toggleDone: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'done' ? 'todo' : 'done',
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      setActiveView: (view) => set({ activeView: view }),
      setActiveCategory: (category) => set({ activeCategory: category }),
      setEditingTask: (task) => set({ editingTask: task }),
    }),
    {
      name: 'cc-tasks',
    }
  )
);
