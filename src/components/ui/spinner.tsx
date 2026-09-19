import { HTMLAttributes, forwardRef } from 'react';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-[3px]',
      lg: 'w-12 h-12 border-4',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={`inline-block border-gray-200 border-t-blue-600 rounded-full animate-[spin_600ms_linear_infinite] ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
export { Spinner };
export type { SpinnerProps };
