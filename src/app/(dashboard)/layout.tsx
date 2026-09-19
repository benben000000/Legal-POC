import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { NavigationProgress } from '@/components/layout/navigation-progress';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure the user is authenticated to view any dashboard route
  const user = await requireAuth();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <NavigationProgress />
      <Sidebar userRole={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
