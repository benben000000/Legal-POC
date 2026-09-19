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
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 ${className}`}
        {...props}
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2 shrink-0">
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
