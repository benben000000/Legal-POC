import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs hover:shadow-sm',
      secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-xs',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs hover:shadow-sm',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="spinner mr-2" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
