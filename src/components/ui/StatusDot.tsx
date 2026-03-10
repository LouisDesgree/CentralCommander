import { cn } from '@/lib/cn';

type StatusDotColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

interface StatusDotProps {
  color?: StatusDotColor;
  pulse?: boolean;
  className?: string;
}

const colorStyles: Record<StatusDotColor, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
};

export function StatusDot({ color = 'gray', pulse = false, className }: StatusDotProps) {
  return (
    <span className={cn('relative flex h-2.5 w-2.5', className)}>
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            colorStyles[color]
          )}
        />
      )}
      <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', colorStyles[color])} />
    </span>
  );
}
