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
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
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
          className={`block w-full px-3.5 py-2 text-sm text-slate-900 bg-white border rounded-lg placeholder-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500 ${
            error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300/80 hover:border-slate-400/80'
          } ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-rose-600 mt-1" role="alert">
            {error}
          </p>
        )}
        {helper && !error && (
          <p id={helperId} className="text-xs text-slate-500 mt-1">
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
