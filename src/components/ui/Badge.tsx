import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-200/60 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300',
  primary: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  success: 'bg-green-500/20 text-green-600 dark:text-green-400',
  warning: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-500/20 text-red-600 dark:text-red-400',
  info: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
};

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
