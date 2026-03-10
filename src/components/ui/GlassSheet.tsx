'use client';

import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function GlassSheet({ open, onClose, children, className }: GlassSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 inset-x-0 z-50',
              'bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl',
              'border-t border-white/30 dark:border-white/10',
              'rounded-t-3xl max-h-[90vh] overflow-y-auto',
              className
            )}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-400/50" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
