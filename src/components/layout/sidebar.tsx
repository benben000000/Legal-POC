'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Matters', href: '/matters' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Deadlines', href: '/deadlines' },
  { name: 'Documents', href: '/documents' },
  { name: 'Billing', href: '/billing' },
  { name: 'Team', href: '/team' },
  { name: 'Audit Logs', href: '/audit-logs' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 bg-gray-900 border-r border-gray-800 min-h-screen select-none">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-800 bg-gray-950">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-white text-base font-bold tracking-tight">Legal Demo</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-[4px] transition-colors duration-100 ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Firm Workspace Footer */}
        <div className="pt-4 border-t border-gray-800 mt-6 px-2">
          <div className="p-3 rounded-[4px] bg-gray-950 border border-gray-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-200">Garcia Law Offices</span>
            </div>
            <p className="text-[11px] text-gray-500">Chambers: Makati & Pasig</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
