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
        className={`text-center py-12 px-6 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 ${className}`}
        {...props}
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">{description}</p>
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
