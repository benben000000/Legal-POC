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
    <header className="bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1">
          {/* Breadcrumbs or page title could go here */}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Signed in</span>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
