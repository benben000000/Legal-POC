export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Legal Demo
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Philippine Practice Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-gray-200 rounded-[4px] sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
