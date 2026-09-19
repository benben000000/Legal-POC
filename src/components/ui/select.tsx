import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, required, className = '', ...props }, ref) => {
    const selectId = id || props.name;
    const errorId = error ? `${selectId}-error` : undefined;

    const cleanLabel = label ? label.replace(/\s*\*+$/, '') : undefined;
    const isRequired = Boolean(required || (label && label.includes('*')));

    return (
      <div className="space-y-1.5 text-left">
        {cleanLabel && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
          >
            {cleanLabel}
            {isRequired && (
              <span className="text-red-500 ml-1 font-bold" title="Required field" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          className={`block w-full px-3.5 py-2 text-sm text-gray-900 bg-white border rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-gray-50 disabled:text-gray-500 ${
            error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 hover:border-gray-400'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-xs text-red-600 mt-1 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
export type { SelectProps };
