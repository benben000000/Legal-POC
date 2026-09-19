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
    <aside className="flex flex-col w-64 bg-gray-950 border-r border-gray-900 min-h-screen select-none">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-900/90 bg-gray-950">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-blue-500 transition-colors">
            LD
          </div>
          <div className="flex flex-col">
            <span className="text-white text-base font-bold tracking-tight">Legal Demo</span>
            <span className="text-[11px] text-gray-400 font-medium">Practice Cloud</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Practice Management
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                }`}
              >
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Firm Workspace Footer */}
        <div className="pt-4 border-t border-gray-900 mt-6 px-2">
          <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-200">Garcia Law Offices</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] text-gray-400">Makati & Pasig Chambers</p>
            <div className="pt-1 text-[10px] text-gray-400 flex items-center justify-between">
              <span>Jurisdiction: PH</span>
              <span className="font-mono text-gray-400">v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
