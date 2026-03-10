'use client';

import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onClose: () => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

export function Toast({ message, type = 'info', visible, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={cn(
            'fixed top-4 left-1/2 -translate-x-1/2 z-[100]',
            'bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl',
            'border border-white/20 dark:border-white/15',
            'rounded-2xl shadow-xl px-4 py-3',
            'flex items-center gap-3 min-w-[280px] max-w-[90vw]'
          )}
        >
          {icons[type]}
          <span className="text-sm font-medium flex-1">{message}</span>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
