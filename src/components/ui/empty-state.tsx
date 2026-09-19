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
        className={`text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-[4px] bg-white ${className}`}
        {...props}
      >
        <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        {action && (
          <div className="mt-6">
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
