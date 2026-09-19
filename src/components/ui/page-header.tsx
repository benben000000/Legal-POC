import { HTMLAttributes, forwardRef, ReactNode } from 'react';

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: ReactNode;
}

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, action, className = '', ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={`md:flex md:items-center md:justify-between mb-6 ${className}`}
        {...props}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="mt-4 flex md:ml-4 md:mt-0">
            {action}
          </div>
        )}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';
export { PageHeader };
export type { PageHeaderProps };
