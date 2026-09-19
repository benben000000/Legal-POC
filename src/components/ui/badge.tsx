import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border';
    
    const variantStyles = {
      neutral: 'bg-slate-100/90 text-slate-700 border-slate-200/80',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      warning: 'bg-amber-50 text-amber-800 border-amber-200/70',
      error: 'bg-rose-50 text-rose-700 border-rose-200/70',
      info: 'bg-blue-50 text-blue-700 border-blue-200/70',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
export { Badge };
export type { BadgeProps };
