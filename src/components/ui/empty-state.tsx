import { HTMLAttributes, forwardRef, ReactNode } from 'react';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, action, className = '', ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`text-center py-12 px-6 border border-dashed border-slate-300/80 rounded-xl bg-slate-50/50 ${className}`}
        {...props}
      >
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-lg">
          📄
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
        {action && (
          <div className="mt-5">
            {action}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
export { EmptyState };
export type { EmptyStateProps };
