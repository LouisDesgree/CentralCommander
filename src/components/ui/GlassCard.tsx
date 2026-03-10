'use client';

import { cn } from '@/lib/cn';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'default' | 'elevated' | 'sunken';
type Padding = 'none' | 'sm' | 'md' | 'lg';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/15 shadow-lg shadow-black/5 dark:shadow-black/20',
  elevated: 'bg-white/70 dark:bg-white/15 backdrop-blur-2xl border border-white/20 dark:border-white/15 shadow-xl shadow-black/5 dark:shadow-black/20',
  sunken: 'bg-black/5 dark:bg-black/20 backdrop-blur-sm border border-white/10 dark:border-white/5',
};

const paddingStyles: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function GlassCard({
  variant = 'default',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl',
        variantStyles[variant],
        paddingStyles[padding],
        interactive && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
      whileHover={interactive ? { scale: 1.01 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
