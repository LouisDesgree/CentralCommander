import { cn } from '@/lib/cn';
import Image from 'next/image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; pixels: number }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', pixels: 24 },
  sm: { container: 'w-8 h-8', text: 'text-xs', pixels: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', pixels: 40 },
  lg: { container: 'w-14 h-14', text: 'text-lg', pixels: 56 },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500',
    'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const styles = sizeStyles[size];

  if (src) {
    return (
      <div className={cn(styles.container, 'relative rounded-full overflow-hidden ring-2 ring-white/20', className)}>
        <Image src={src} alt={name} width={styles.pixels} height={styles.pixels} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        styles.container,
        'rounded-full flex items-center justify-center ring-2 ring-white/20',
        getColorFromName(name),
        className
      )}
    >
      <span className={cn(styles.text, 'font-medium text-white')}>{getInitials(name)}</span>
    </div>
  );
}
