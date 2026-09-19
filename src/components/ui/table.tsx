import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, forwardRef } from 'react';

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={`w-full text-sm text-left text-gray-700 ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => (
    <thead
      ref={ref}
      className={`text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={`divide-y divide-gray-200 bg-white ${className}`}
      {...props}
    >
      {children}
    </tbody>
  )
);
TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', children, ...props }, ref) => (
    <tr
      ref={ref}
      className={`hover:bg-gray-50 transition-colors duration-100 ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
);
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', children, ...props }, ref) => (
    <th
      ref={ref}
      className={`px-4 py-3 font-medium text-gray-900 whitespace-nowrap ${className}`}
      {...props}
    >
      {children}
    </th>
  )
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', children, ...props }, ref) => (
    <td
      ref={ref}
      className={`px-4 py-3 ${className}`}
      {...props}
    >
      {children}
    </td>
  )
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
