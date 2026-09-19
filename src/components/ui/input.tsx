import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, id, className = '', ...props }, ref) => {
    const inputId = id || props.name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helper ? `${inputId}-helper` : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            [errorId, helperId].filter(Boolean).join(' ') || undefined
          }
          className={`block w-full px-3.5 py-2 text-sm text-gray-900 bg-white border rounded-lg placeholder-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-gray-50 disabled:text-gray-500 ${
            error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 hover:border-gray-400'
          } ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">
            {error}
          </p>
        )}
        {helper && !error && (
          <p id={helperId} className="text-xs text-gray-500 mt-1">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
export type { InputProps };
