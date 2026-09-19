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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">
            Supreme Court Judicial E-Filing System Connected
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-medium text-gray-900 leading-tight">Atty. Benedict Garcia</span>
            <span className="text-[11px] text-gray-500">Lead Attorney</span>
          </div>

          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
