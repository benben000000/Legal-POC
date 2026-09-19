import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, forwardRef } from 'react';

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={`w-full text-sm text-left text-slate-700 ${className}`}
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
      className={`text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70 border-b border-slate-200/80 ${className}`}
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
      className={`divide-y divide-slate-100 bg-white ${className}`}
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
      className={`hover:bg-slate-50/80 transition-colors duration-100 ${className}`}
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
      className={`px-5 py-3.5 font-semibold text-slate-700 whitespace-nowrap ${className}`}
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
      className={`px-5 py-3.5 text-slate-600 ${className}`}
      {...props}
    >
      {children}
    </td>
  )
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
