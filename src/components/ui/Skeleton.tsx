import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200/60 dark:bg-gray-700/40 rounded-lg animate-pulse',
        className
      )}
      style={{ width, height }}
    />
  );
}
