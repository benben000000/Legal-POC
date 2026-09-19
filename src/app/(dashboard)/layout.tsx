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
    <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:min-h-0 print:overflow-visible print:bg-white print:block">
      <div className="print:hidden">
        <NavigationProgress />
      </div>
      <div className="print:hidden shrink-0">
        <Sidebar userRole={user.role} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden print:h-auto print:min-h-0 print:overflow-visible print:block">
        <div className="print:hidden">
          <Header user={user} />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:bg-white print:overflow-visible print:h-auto print:block">
          <div className="mx-auto max-w-7xl animate-page-enter print:m-0 print:p-0 print:max-w-none print:w-full print:animate-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
