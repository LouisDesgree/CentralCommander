'use client';

import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
  secondary: 'bg-white/20 dark:bg-white/10 backdrop-blur-lg border border-white/20 text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-white/15',
  ghost: 'text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/10',
  danger: 'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
          variantStyles[variant],
          sizeStyles[size],
          (disabled || loading) && 'opacity-50 pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Spinner size={size === 'sm' ? 14 : 18} /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
