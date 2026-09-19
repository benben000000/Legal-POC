import { HTMLAttributes, forwardRef } from 'react';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-white border border-gray-200 rounded-xl shadow-xs transition-shadow duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-5 py-4 border-b border-gray-100 rounded-t-xl flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-base font-semibold text-gray-900 tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-5 py-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardBody.displayName = 'CardBody';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 rounded-b-xl sm:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardBody, CardFooter };
