'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-xs border-b border-slate-200/80 sticky top-0 z-30 transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>NCR Judicial Region Active</span>
          </div>
          <span className="hidden md:inline-block text-xs text-slate-400">|</span>
          <span className="hidden md:inline-block text-xs text-slate-500 font-medium">
            Electronic Court Docket & Filing Tracker
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center border border-blue-200">
              AG
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">Atty. Benedict Garcia</span>
              <span className="text-[10px] text-slate-500">Lead Attorney & Managing Partner</span>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={handleLogout} className="text-xs">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
